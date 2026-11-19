import type { JSX } from "react";
import { flattenNodes } from "@augeron/core";
import { closeSplit, useWorkbench } from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";

/** Companion pane pinned to one coordinate. Shows the node, its flags, and links to related coordinates. */
export function CoordinateSplitPane({ coord }: { coord: string }): JSX.Element {
  const tree = useWorkbench((s) => s.wb.history.present);
  const node = flattenNodes(tree).find((candidate) => candidate.coordinate === coord) ?? null;

  return (
    <div className="split-pane" data-split-coord={coord}>
      <header className="pane-header split-pane__head">
        <span>
          Pinned target: <span className="coord-ref coord-ref--static">{coord}</span>
        </span>
        <button type="button" className="plain-button" onClick={closeSplit}>
          close
        </button>
      </header>
      {node ? (
        <div className="split-pane__body">
          <p className="node__text">
            <OberonTextRenderer text={node.rawText} idPrefix={`split-${node.id}`} plainClickRuns={false} sourceCoord={coord} />
          </p>
          {node.flags.map((flag, index) => (
            <div key={`${flag.type}-${index}`} className={flag.type === "CONTRADICTION" || flag.type === "BROKEN_REF" ? "flag-strip flag-strip--danger" : "flag-strip flag-strip--caution"}>
              <span className="flag-badge">{flag.type}</span>
              <span className="flag-message">
                <OberonTextRenderer
                  text={flag.relatedCoordinate ? `${flag.message} [${flag.type} <-> ${flag.relatedCoordinate}]` : flag.message}
                  idPrefix={`split-flag-${node.id}-${index}`}
                  plainClickRuns={false}
                  sourceCoord={coord}
                />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="split-pane__body">{coord} is not in this document.</p>
      )}
    </div>
  );
}
