import type { JSX, KeyboardEvent, MouseEvent } from "react";
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
  clearSelection,
  coordOfNodeId,
  dispatchLine,
  getState,
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
  const selected = selectedIds.includes(node.id);
  // Headings render as real h1..h6 so assistive tech gets the outline. Body paragraphs stay <p>.
  const TextTag = isHeading ? (`h${Math.min(Math.max(node.depth, 1), 6)}` as "h1") : "p";
  const onRowKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    // Only the row itself: Enter on a command token or § link inside it keeps its own meaning.
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleNode(node.id);
    }
  };
  return (
    <section className={classes} data-coord={node.coordinate} data-node-id={node.id}>
      <div
        className="node__row"
        tabIndex={0}
        role="group"
        aria-label={`${node.coordinate} ${node.role}${selected ? ", selected" : ""}`}
        onKeyDown={onRowKeyDown}
      >
        <span className="node__gutter">{node.coordinate}</span>
        <div className="node__body">
          <TextTag className={isHeading ? "node__text node__text--heading" : "node__text"}>
            <OberonTextRenderer
              text={displayContent(item)}
              idPrefix={`node-${node.id}`}
              plainClickRuns={false}
              sourceCoord={node.coordinate}
            />
            {item.truncated ? <span className="badge-words">[+{node.hiddenWordCount}w]</span> : null}
          </TextTag>
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

const HIT_SLOP_PX = 2;

function within(rect: DOMRect, x: number, y: number): boolean {
  return (
    x >= rect.left - HIT_SLOP_PX &&
    x <= rect.right + HIT_SLOP_PX &&
    y >= rect.top - HIT_SLOP_PX &&
    y <= rect.bottom + HIT_SLOP_PX
  );
}

/**
 * The node whose own content is under the point: its text line boxes, its § gutter, its role tag,
 * or one of its flag strips. Whitespace beside a short line, indentation, and gaps between nodes
 * hit nothing, so a click there clears the selection instead of selecting the enclosing section.
 */
function nodeAtPoint(target: EventTarget | null, x: number, y: number): string | null {
  if (!(target instanceof Element)) return null;
  const row = target.closest<HTMLElement>(".node__row");
  const owner = row?.parentElement;
  const id = owner?.dataset.nodeId;
  if (!row || !id) return null;

  for (const el of row.querySelectorAll<HTMLElement>(".node__gutter, .node__role, .flag-strip")) {
    if (el.textContent && within(el.getBoundingClientRect(), x, y)) return id;
  }
  const text = row.querySelector(".node__text");
  if (text) {
    const range = document.createRange();
    range.selectNodeContents(text);
    for (const rect of range.getClientRects()) {
      if (within(rect, x, y)) return id;
    }
  }
  return null;
}

/** Maps a non-collapsed browser selection to the node ids it touches. */
function captureRange(container: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  const ids: string[] = [];
  // Test each node's own row, not the section: a section also contains its children, so testing it
  // would add every ancestor heading of the dragged text to the selection.
  container.querySelectorAll<HTMLElement>("[data-node-id]").forEach((el) => {
    const id = el.dataset.nodeId;
    const row = el.querySelector(":scope > .node__row");
    if (id && row && range.intersectsNode(row)) ids.push(id);
  });
  setSelection(ids, selection.toString());
  return true;
}

/**
 * Plain left clicks set the selection. Middle-clicks and Ctrl/Cmd-clicks run commands, and § links
 * open the split pane, so those never change it. Clicking the only selected node again clears it.
 */
function onDocMouseUp(event: MouseEvent<HTMLDivElement>): void {
  if (event.button !== 0 || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof Element && event.target.closest("[data-coord-ref]")) return;
  if (captureRange(event.currentTarget)) return;

  const hit = nodeAtPoint(event.target, event.clientX, event.clientY);
  const current = getState().wb.selectedNodeIds;
  if (hit === null || (current.length === 1 && current[0] === hit)) {
    clearSelection();
    return;
  }
  setSelection([hit], "");
}

/** Keyboard text selection (Shift+arrows) maps to nodes the same way as a mouse drag. */
function onDocKeyUp(event: KeyboardEvent<HTMLDivElement>): void {
  captureRange(event.currentTarget);
}

/** Keyboard select: Enter or Space on a focused row selects it, or clears it when it is the only selection. */
function toggleNode(id: string): void {
  const current = getState().wb.selectedNodeIds;
  if (current.length === 1 && current[0] === id) clearSelection();
  else setSelection([id], "");
}

/** Header text naming what Spec.Tighten and Outline.ExtractTasks will act on. */
function scopeLabel(tree: DocumentTree, selectedIds: readonly string[]): string {
  if (selectedIds.length === 0) return "Scope: Full doc";
  const first = coordOfNodeId(tree, selectedIds[0] ?? "") ?? "?";
  const more = selectedIds.length > 1 ? ` + ${selectedIds.length - 1} more` : "";
  return `Scope: ${first}${more} (Esc to clear)`;
}

function countNodes(tree: DocumentTree): number {
  return flattenNodes(tree).length;
}

export function NlsDocumentPane(): JSX.Element {
  const tree = useWorkbench((s) => s.wb.history.present);
  const view = useWorkbench((s) => s.wb.activeViewSpec);
  const level = useWorkbench((s) => s.wb.activeLevel);
  const selectedIds = useWorkbench((s) => s.wb.selectedNodeIds);
  const highlight = useWorkbench((s) => s.highlight);
  const sourceEdit = useWorkbench((s) => s.sourceEdit);
  const sourceDraft = useWorkbench((s) => s.sourceDraft);
  const projected = projectTree(tree, view, level);

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
          <span
            className={selectedIds.length > 0 ? "doc-scope doc-scope--active" : "doc-scope"}
            role="status"
            aria-live="polite"
            title="Spec.Tighten and Outline.ExtractTasks act on the scope. Spec.Audit and Cite.Verify always check the full document."
          >
            {scopeLabel(tree, selectedIds)}
          </span>{" "}
          {level !== undefined ? <>· level ≤ {level} </> : null}· {countNodes(tree)} nodes ·{" "}
          <OberonTextRenderer text="Edit.Source" idPrefix="doc-edit" plainClickRuns={true} />
        </span>
      </header>

      <p className="doc-colophon">AUGERON · EXHUMED FROM 1968 NLS &amp; 1986 OBERON</p>

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
          onMouseUp={onDocMouseUp}
          onKeyUp={onDocKeyUp}
          role="region"
          aria-label="NLS document"
        >
          {projected.length === 0 ? (
            countNodes(tree) === 0 ? (
              <p className="doc-empty">
                This document is empty. Run{" "}
                <OberonTextRenderer text="Edit.Source" idPrefix="doc-empty-edit" plainClickRuns={true} /> to add
                Markdown, or load a sample with Doc.Load in System.Tool.
              </p>
            ) : level !== undefined ? (
              <p className="doc-empty">
                Nothing at level ≤ {level}. Run <kbd>View.Spec(a)</kbd> to clear the level clip.
              </p>
            ) : view === "a" ? (
              <p className="doc-empty">Nothing to show.</p>
            ) : (
              <p className="doc-empty">
                Nothing in this view. Press <kbd>a</kbd> for the full document.
              </p>
            )
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
