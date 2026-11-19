import type { JSX, SyntheticEvent } from "react";
import {
  projectTree,
  flattenNodes,
  type DocNode,
  type DocumentTree,
  type NodeFlag,
  type ProjectedNode,
  type ViewSpecCode,
} from "@augeron/core";
import {
  cancelSourceEdit,
  dispatchLine,
  setSelection,
  setSourceDraft,
  useWorkbench,
} from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";

const VIEW_SPECS: readonly ViewSpecCode[] = ["a", "h", "f", "u", "r"];
const VIEW_LABELS: Record<ViewSpecCode, string> = {
  a: "all",
  h: "headings",
  f: "first-sentence",
  u: "unverified",
  r: "requirements",
};

const ROLE_TAGS: Partial<Record<DocNode["role"], string>> = {
  Requirement: "REQ",
  Claim: "CLAIM",
  Evidence: "EVID",
  Assumption: "ASSUMP",
};

function flagClass(flag: NodeFlag): string {
  switch (flag.type) {
    case "CONTRADICTION":
    case "BROKEN_REF":
      return "flag-strip flag-strip--danger";
    case "UNVERIFIED_CLAIM":
    case "AMBIGUOUS_TERM":
      return "flag-strip flag-strip--caution";
  }
}

function displayContent(item: ProjectedNode): string {
  if (item.node.role === "Heading") return item.node.rawText.replace(/^#+\s*/, "");
  return item.truncated ? item.node.firstSentence : item.displayText;
}

function NodeTree({
  item,
  selectedIds,
  highlight,
}: {
  item: ProjectedNode;
  selectedIds: readonly string[];
  highlight: ReadonlySet<string>;
}): JSX.Element {
  const node = item.node;
  const isHeading = node.role === "Heading";
  const classes = [
    "node",
    isHeading ? `node--heading node--depth-${Math.min(node.depth, 3)}` : "node--body",
    selectedIds.includes(node.id) ? "node--selected" : "",
    highlight.has(node.coordinate) ? "node--highlight" : "",
  ]
    .filter((part) => part.length > 0)
    .join(" ");
  const tag = ROLE_TAGS[node.role] ?? "";
  return (
    <section className={classes} data-coord={node.coordinate} data-node-id={node.id}>
      <div className="node__row">
        <span className="node__gutter">{node.coordinate}</span>
        <div className="node__body">
          <p className={isHeading ? "node__text node__text--heading" : "node__text"}>
            <OberonTextRenderer
              text={displayContent(item)}
              idPrefix={`node-${node.id}`}
              plainClickRuns={false}
              sourceCoord={node.coordinate}
            />
            {item.truncated ? <span className="badge-words">[+{node.hiddenWordCount}w]</span> : null}
          </p>
          {node.flags.map((flag, index) => (
            <div key={`${flag.type}-${index}`} className={flagClass(flag)}>
              <span className="flag-badge">{flag.type}</span>
              <span className="flag-message">
                <OberonTextRenderer
                  text={flag.message}
                  idPrefix={`flag-${node.id}-${index}`}
                  plainClickRuns={false}
                  sourceCoord={node.coordinate}
                />
              </span>
            </div>
          ))}
        </div>
        <span className="node__role">{tag}</span>
      </div>
      {item.children.length > 0 ? (
        <div className="node__children">
          {item.children.map((child) => (
            <NodeTree key={child.node.id} item={child} selectedIds={selectedIds} highlight={highlight} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Reads the browser selection and maps it to node ids. Runs on mouseup and keyup, so clicks in other
 * panes never reach this code and the last document selection persists.
 */
function captureSelection(container: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  if (selection.isCollapsed) {
    const anchor = selection.anchorNode;
    const element = anchor instanceof Element ? anchor : anchor?.parentElement ?? null;
    const owner = element?.closest<HTMLElement>("[data-node-id]") ?? null;
    const id = owner?.dataset.nodeId;
    if (id && owner && container.contains(owner)) setSelection([id], "");
    return;
  }
  const range = selection.getRangeAt(0);
  const ids: string[] = [];
  container.querySelectorAll<HTMLElement>("[data-node-id]").forEach((el) => {
    const id = el.dataset.nodeId;
    if (id && range.intersectsNode(el)) ids.push(id);
  });
  setSelection(ids, selection.toString());
}

function countNodes(tree: DocumentTree): number {
  return flattenNodes(tree).length;
}

export function NlsDocumentPane(): JSX.Element {
  const tree = useWorkbench((s) => s.wb.history.present);
  const view = useWorkbench((s) => s.wb.activeViewSpec);
  const selectedIds = useWorkbench((s) => s.wb.selectedNodeIds);
  const highlight = useWorkbench((s) => s.highlight);
  const sourceEdit = useWorkbench((s) => s.sourceEdit);
  const sourceDraft = useWorkbench((s) => s.sourceDraft);
  const projected = projectTree(tree, view);

  const onSelectionEvent = (event: SyntheticEvent<HTMLDivElement>): void => {
    captureSelection(event.currentTarget);
  };

  return (
    <div className="doc-pane">
      <header className="pane-header doc-pane__status">
        <span className="doc-title">{tree.title}</span>
        <span className="view-strip" aria-label="View-Spec">
          {VIEW_SPECS.map((code) => (
            <button
              key={code}
              type="button"
              className={code === view ? "view-letter view-letter--active" : "view-letter"}
              title={`View.Spec(${code})`}
              onClick={() => void dispatchLine(`View.Spec(${code})`)}
            >
              [{code}] {VIEW_LABELS[code]}
            </button>
          ))}
        </span>
        <span className="doc-meta">
          {countNodes(tree)} nodes ·{" "}
          <OberonTextRenderer text="Edit.Source" idPrefix="doc-edit" plainClickRuns={true} />
        </span>
      </header>

      {sourceEdit ? (
        <div className="doc-source">
          <textarea
            className="doc-source__area"
            value={sourceDraft}
            spellCheck={false}
            onChange={(event) => setSourceDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancelSourceEdit();
            }}
            aria-label="Document source (Markdown)"
          />
          <div className="doc-source__bar">
            <OberonTextRenderer text="Edit.Done" idPrefix="doc-done" plainClickRuns={true} />
            <button type="button" className="plain-button" onClick={cancelSourceEdit}>
              cancel (Esc)
            </button>
          </div>
        </div>
      ) : (
        <div
          className="doc-body"
          onMouseUp={onSelectionEvent}
          onKeyUp={onSelectionEvent}
          role="region"
          aria-label="NLS document"
        >
          {projected.length === 0 ? (
            <p className="doc-empty">
              Nothing in this view. Press <kbd>a</kbd> for the full document.
            </p>
          ) : (
            projected.map((item) => (
              <NodeTree key={item.node.id} item={item} selectedIds={selectedIds} highlight={highlight} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
