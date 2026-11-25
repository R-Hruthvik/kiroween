import type { JSX } from "react";
import { flattenNodes, type FlagType } from "@augeron/core";
import { closeSplit, useWorkbench } from "../state/useWorkbenchStore";
import { MarkdownBlock } from "./MarkdownBlock";
import { OberonTextRenderer } from "./OberonTextRenderer";
import { RedlineCallout } from "./RedlineCallout";

const FLAG_LABELS: Record<FlagType, string> = {
  UNVERIFIED_CLAIM: "UNVERIFIED",
  CONTRADICTION: "CONTRADICTION",
  AMBIGUOUS_TERM: "AMBIGUOUS",
  BROKEN_REF: "BROKEN REF",
};

/**
 * Companion pane pinned to one § address, below the sheet. It shows that paragraph, its redline callouts,
 * and links to related addresses. Its address outlines in ink when the pane opens on it, so the reader sees the target.
 */
export function CoordinateSplitPane({ coord }: { coord: string }): JSX.Element {
  const tree = useWorkbench((s) => s.wb.history.present);
  const node = flattenNodes(tree).find((candidate) => candidate.coordinate === coord) ?? null;

  return (
    <div className="split-pane" data-split-coord={coord}>
      <header className="split-pane__head">
        <span>
          Following <span className="coord-ref coord-ref--static split-pane__target">{coord}</span>
        </span>
        <button type="button" className="plain-button" onClick={closeSplit}>
          close
        </button>
      </header>
      {node ? (
        <div className="split-pane__body">
          <div className="node__text">
            <MarkdownBlock text={node.rawText} idPrefix={`split-${node.id}`} plainClickRuns={false} sourceCoord={coord} />
          </div>
          {node.flags.map((flag, index) => (
            <RedlineCallout key={`${flag.type}-${index}`} label={FLAG_LABELS[flag.type]} sourceCoord={coord}>
              <OberonTextRenderer
                text={flag.relatedCoordinate ? `${flag.message} [${flag.type} <-> ${flag.relatedCoordinate}]` : flag.message}
                idPrefix={`split-flag-${node.id}-${index}`}
                plainClickRuns={false}
                sourceCoord={coord}
              />
            </RedlineCallout>
          ))}
        </div>
      ) : (
        <p className="split-pane__body">{coord} is not in this document.</p>
      )}
    </div>
  );
}
