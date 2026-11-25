import { useEffect, useMemo, useRef, useState, type JSX, type KeyboardEvent, type MouseEvent } from "react";
import {
  hiddenSummary,
  isReviewed,
  projectTree,
  flattenNodes,
  type DocNode,
  type DocumentTree,
  type FlagType,
  type ProjectedNode,
  type ReviewMarks,
} from "@augeron/core";
import {
  cancelSourceEdit,
  clearSelection,
  dispatchLine,
  getState,
  setSelection,
  setSourceDraft,
  useWorkbench,
} from "../state/useWorkbenchStore";
import { BriefView } from "./BriefView";
import { HiddenFooter } from "./HiddenFooter";
import { prefersReducedMotion } from "./motion";
import { MarkdownBlock } from "./MarkdownBlock";
import { OberonTextRenderer } from "./OberonTextRenderer";
import { FlagLeader, RedlineCallout } from "./RedlineCallout";

const ROLE_TAGS: Partial<Record<DocNode["role"], string>> = {
  Requirement: "REQ",
  Claim: "CLAIM",
  Evidence: "EVID",
  Assumption: "ASSUMP",
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Callout labels. Each one is text, so a flag type never depends on colour alone. */
const FLAG_LABELS: Record<FlagType, string> = {
  UNVERIFIED_CLAIM: "UNVERIFIED",
  CONTRADICTION: "CONTRADICTION",
  AMBIGUOUS_TERM: "AMBIGUOUS",
  BROKEN_REF: "BROKEN REF",
};

/**
 * Text a node shows. Headings drop their # marks and render inline. Body text is the projector's display
 * text, which marks each hidden run as [+Nw]. HTML comments are stripped by MarkdownBlock.
 */
function displayContent(item: ProjectedNode): string {
  if (item.node.role === "Heading") return item.node.rawText.replace(/^#+\s*/, "");
  return item.displayText;
}

/**
 * The review control for one body paragraph. Unreviewed, it is a text label that shows only while the row
 * is hovered or focused. Reviewed, a small check stays visible, with the word "reviewed" for screen readers.
 * It runs Review.Mark or Review.Clear on a plain click, which is the only plain click that runs a command
 * outside System.Tool.
 */
function ReviewMark({ coord, reviewed }: { coord: string; reviewed: boolean }): JSX.Element {
  const command = reviewed ? `Review.Clear(${coord})` : `Review.Mark(${coord})`;
  return (
    <button
      type="button"
      className={reviewed ? "review-mark review-mark--done" : "review-mark"}
      data-tip={reviewed ? `${command} · the text has not changed since it was marked` : `${command} · mark this paragraph reviewed`}
      aria-label={reviewed ? `${coord} reviewed. Clear the mark.` : `Mark ${coord} reviewed`}
      // A click here must not also select the node under the mark.
      onMouseUp={(event) => event.stopPropagation()}
      onClick={() => void dispatchLine(command, { sourceCoord: coord })}
    >
      {reviewed ? (
        <>
          <span aria-hidden="true">✓</span>
          <span className="visually-hidden"> reviewed</span>
        </>
      ) : (
        "mark reviewed"
      )}
    </button>
  );
}

/** Flag slots: the order each flag appears in the document, used for the audit stagger. */
function flagSlots(items: readonly ProjectedNode[], counter = { n: 0 }, out = new Map<string, number>()): Map<string, number> {
  for (const item of items) {
    if (item.node.flags.length > 0) out.set(item.node.id, counter.n);
    counter.n += item.node.flags.length;
    flagSlots(item.children, counter, out);
  }
  return out;
}

/** Spec.Audit flags drop in one after another, 30ms apart, and the stagger stops at 12 slots. */
const STAGGER_MS = 30;
const STAGGER_CAP = 12;
const LEADER_AFTER_MS = 180;

function slotDelay(slot: number): number {
  return Math.min(slot, STAGGER_CAP) * STAGGER_MS;
}

/** Shared motion inputs for every node. */
interface Motion {
  auditNonce: number;
  slots: ReadonlyMap<string, number>;
  fadeIds: ReadonlySet<string>;
  undoRun: number;
  /** True while paragraphs fold out before a view change. Headings never fold. */
  folding: boolean;
}

function NodeTree({
  item,
  selectedIds,
  highlight,
  reviews,
  motion,
}: {
  item: ProjectedNode;
  selectedIds: readonly string[];
  highlight: ReadonlySet<string>;
  reviews: ReviewMarks;
  motion: Motion;
}): JSX.Element {
  const node = item.node;
  const isHeading = node.role === "Heading";
  const selected = selectedIds.includes(node.id);
  const classes = [
    "node",
    isHeading ? `node--heading node--depth-${Math.min(node.depth, 3)}` : "node--body",
    motion.folding && !isHeading ? "node--fold" : "",
    selected ? "node--selected" : "",
    highlight.has(node.coordinate) ? "node--highlight" : "",
    node.flags.length > 0 ? "node--flagged" : "",
  ]
    .filter((part) => part.length > 0)
    .join(" ");
  const tag = ROLE_TAGS[node.role] ?? "";
  // Headings render as real h1..h6 so assistive tech gets the outline. Body paragraphs are block Markdown.
  const headingTag: HeadingTag = `h${Math.min(Math.max(node.depth, 1), 6)}` as HeadingTag;
  const onRowKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    // Only the row itself: Enter on a command token or § link inside it keeps its own meaning.
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleNode(node.id);
    }
  };
  const text = displayContent(item);
  // An undo or redo replays the text fade. Keying the text on the run nonce makes React remount it once.
  const fading = motion.undoRun > 0 && motion.fadeIds.has(node.id);
  const slot = motion.slots.get(node.id) ?? 0;
  const firstDelay = slotDelay(slot);
  return (
    <section className={classes} data-coord={node.coordinate} data-node-id={node.id}>
      <div
        className="node__row"
        tabIndex={0}
        role="group"
        aria-label={`${node.coordinate} ${node.role}${selected ? ", selected" : ""}`}
        onKeyDown={onRowKeyDown}
      >
        {node.flags.length > 0 ? (
          <FlagLeader key={`leader-${motion.auditNonce}`} delayMs={firstDelay + LEADER_AFTER_MS} />
        ) : null}
        <div className="node__side">
          <span className="node__gutter">{node.coordinate}</span>
          {tag ? <span className="node__role">{tag}</span> : null}
          {isHeading ? null : <ReviewMark coord={node.coordinate} reviewed={isReviewed(node, reviews)} />}
        </div>
        <div className="node__body">
          {isHeading ? (
            <HeadingText tag={headingTag} text={text} idPrefix={`node-${node.id}`} coord={node.coordinate} />
          ) : (
            <div key={fading ? `fade-${motion.undoRun}` : "base"} className={fading ? "node__text node__text--fade" : "node__text"}>
              <MarkdownBlock
                text={text}
                idPrefix={`node-${node.id}`}
                plainClickRuns={false}
                sourceCoord={node.coordinate}
              />
            </div>
          )}
        </div>
        <div className="node__margin">
          {node.flags.map((flag, index) => (
            <RedlineCallout
              key={`margin-${motion.auditNonce}-${flag.type}-${index}`}
              label={FLAG_LABELS[flag.type]}
              sourceCoord={node.coordinate}
              delayMs={slotDelay(slot + index)}
            >
              <OberonTextRenderer text={flag.message} idPrefix={`flag-${node.id}-${index}`} plainClickRuns={false} sourceCoord={node.coordinate} />
            </RedlineCallout>
          ))}
        </div>
      </div>
      {item.children.length > 0 ? (
        <div className="node__children">
          {item.children.map((child) => (
            <NodeTree key={child.node.id} item={child} selectedIds={selectedIds} highlight={highlight} reviews={reviews} motion={motion} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/** A heading node. Its tag is h1 to h6, and its inline text keeps commands and § addresses live. */
function HeadingText({ tag: Tag, text, idPrefix, coord }: { tag: HeadingTag; text: string; idPrefix: string; coord: string }): JSX.Element {
  return (
    <Tag className="node__text node__text--heading">
      <OberonTextRenderer text={text} idPrefix={idPrefix} plainClickRuns={false} sourceCoord={coord} />
    </Tag>
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
 * The node whose own content is under the point: its text line boxes, its § gutter, its role tag, or one
 * of its margin callouts. Whitespace beside a short line, indentation, and gaps between nodes hit nothing,
 * so a click there clears the selection instead of selecting the enclosing section.
 */
function nodeAtPoint(target: EventTarget | null, x: number, y: number): string | null {
  if (!(target instanceof Element)) return null;
  const row = target.closest<HTMLElement>(".node__row");
  const owner = row?.parentElement;
  const id = owner?.dataset.nodeId;
  if (!row || !id) return null;

  for (const el of row.querySelectorAll<HTMLElement>(".node__gutter, .node__role, .redline")) {
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

function countNodes(tree: DocumentTree): number {
  return flattenNodes(tree).length;
}

/**
 * The Document Track sheet: registration marks at the corners, a small header with the node count and
 * Edit.Source, and the document body in three columns (address, text, redline margin).
 */
/** Paragraphs fold out for this long before the new view replaces them. Matches --dur-slow. */
const FOLD_MS = 280;

export function NlsDocumentPane(): JSX.Element {
  const tree = useWorkbench((s) => s.wb.history.present);
  const view = useWorkbench((s) => s.wb.activeViewSpec);
  const level = useWorkbench((s) => s.wb.activeLevel);
  const brief = useWorkbench((s) => s.wb.activeBrief);
  const reviews = useWorkbench((s) => s.wb.reviews);
  const selectedIds = useWorkbench((s) => s.wb.selectedNodeIds);
  const highlight = useWorkbench((s) => s.highlight);
  const sourceEdit = useWorkbench((s) => s.sourceEdit);
  const sourceDraft = useWorkbench((s) => s.sourceDraft);
  const pulse = useWorkbench((s) => s.pulse);
  const auditNonce = useWorkbench((s) => s.auditNonce);
  const projected = useMemo(() => projectTree(tree, view, level), [tree, view, level]);
  const hidden = useMemo(() => hiddenSummary(tree, { view, level, brief }), [tree, view, level, brief]);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // View fold: when the view changes, the outgoing paragraphs fold out for FOLD_MS, then the new view mounts.
  const viewKey = `${view}|${level ?? ""}`;
  const viewKeyRef = useRef(viewKey);
  const shownRef = useRef(projected);
  const foldTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [leaving, setLeaving] = useState<ProjectedNode[] | null>(null);
  useEffect(() => {
    const before = shownRef.current;
    shownRef.current = projected;
    if (viewKeyRef.current === viewKey) return;
    viewKeyRef.current = viewKey;
    if (prefersReducedMotion() || before.length === 0) return;
    setLeaving(before);
    clearTimeout(foldTimer.current);
    foldTimer.current = setTimeout(() => setLeaving(null), FOLD_MS);
  });
  useEffect(() => () => clearTimeout(foldTimer.current), []);

  // Undo and redo fade the paragraphs whose text changed. The fade replays on each run.
  const textRef = useRef<Map<string, string>>(new Map());
  const fadeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of flattenNodes(tree)) {
      const before = textRef.current.get(node.id);
      if (before !== undefined && before !== node.rawText) ids.add(node.id);
    }
    return ids;
  }, [tree]);
  useEffect(() => {
    const texts = new Map<string, string>();
    for (const node of flattenNodes(tree)) texts.set(node.id, node.rawText);
    textRef.current = texts;
  }, [tree]);
  const undoRun = pulse !== null && pulse.stages.some((stage) => stage === "System.Undo" || stage === "System.Redo") ? pulse.nonce : 0;

  const rows = leaving ?? projected;
  const slots = useMemo(() => flagSlots(rows), [rows]);
  const motion: Motion = { auditNonce, slots, fadeIds, undoRun, folding: leaving !== null };

  return (
    <div className="doc-pane">
      <span className="reg reg--tl" aria-hidden="true" />
      <span className="reg reg--tr" aria-hidden="true" />
      <span className="reg reg--bl" aria-hidden="true" />
      <span className="reg reg--br" aria-hidden="true" />

      <header className="sheet-head">
        <span className="sheet-head__meta">{countNodes(tree)} nodes</span>
        <OberonTextRenderer text="Edit.Source" idPrefix="doc-edit" plainClickRuns={true} />
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
          ref={bodyRef}
          className={leaving ? "doc-body doc-body--folding" : "doc-body"}
          onMouseUp={onDocMouseUp}
          onKeyUp={onDocKeyUp}
          role="region"
          aria-label="NLS document"
        >
          {brief !== undefined ? (
            <BriefView tree={tree} perSection={brief} />
          ) : projected.length === 0 ? (
            countNodes(tree) === 0 ? (
              <div className="doc-empty">
                <p>This document is empty. Write Markdown with Edit.Source, or load a sample:</p>
                <p className="doc-empty__actions">
                  <OberonTextRenderer text="Doc.Load(rfc)" idPrefix="doc-empty-rfc" plainClickRuns={true} />{" "}
                  <OberonTextRenderer text="Doc.Load(brief)" idPrefix="doc-empty-brief" plainClickRuns={true} />{" "}
                  <OberonTextRenderer text="Doc.Load(prd)" idPrefix="doc-empty-prd" plainClickRuns={true} />
                </p>
              </div>
            ) : level !== undefined ? (
              <p className="doc-empty">
                Nothing at level ≤ {level}. Run <OberonTextRenderer text="View.Spec(a)" idPrefix="doc-empty-a" plainClickRuns={true} /> to clear the level clip.
              </p>
            ) : view === "a" ? (
              <p className="doc-empty">Nothing to show.</p>
            ) : (
              <p className="doc-empty">
                Nothing in this view. Run <OberonTextRenderer text="View.Spec(a)" idPrefix="doc-empty-a" plainClickRuns={true} /> for the full document.
              </p>
            )
          ) : (
            rows.map((item) => (
              <NodeTree
                key={item.node.id}
                item={item}
                selectedIds={selectedIds}
                highlight={highlight}
                reviews={reviews}
                motion={motion}
              />
            ))
          )}
          <HiddenFooter summary={hidden} />
        </div>
      )}
    </div>
  );
}
