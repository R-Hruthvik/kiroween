import type { JSX } from "react";
import type { ViewSpecCode } from "@augeron/core";
import type { ThemeName } from "../theme";
import { coordOfNodeId, clearSelection, dispatchLine, openSplit, useWorkbench } from "../state/useWorkbenchStore";
import { ViewChip } from "./ViewChip";

const VIEWS: readonly { code: ViewSpecCode; label: string; tip: string }[] = [
  { code: "a", label: "all", tip: "View.Spec(a) · the full document" },
  { code: "h", label: "headings", tip: "View.Spec(h) · headings only" },
  { code: "f", label: "first sentence", tip: "View.Spec(f) · first sentence of each paragraph, plus flagged sentences" },
  { code: "u", label: "unverified", tip: "View.Spec(u) · claims and assumptions with no citation" },
  { code: "r", label: "requirements", tip: "View.Spec(r) · requirements and flagged paragraphs" },
];

/** The three themes. Each chip runs its View.Theme command. The tip says what the theme looks like. */
const THEME_CHOICES: readonly { name: ThemeName; tip: string }[] = [
  { name: "light", tip: "View.Theme(light) · drafting film, the default" },
  { name: "dark", tip: "View.Theme(dark) · night sheet" },
  { name: "halloween", tip: "View.Theme(halloween) · night sheet with moonlit ink and pumpkin redline" },
];

/** Brief sentence count used when the status line starts a brief. Matches View.Brief with no argument. */
const DEFAULT_BRIEF = 2;

/**
 * The status line above both tracks: the wordmark, the document title, the view chips (each one a command),
 * the focused address, the scope that the next command acts on, and the undo and redo depth.
 * Every label is a plain word, so no bare code stands without its meaning.
 */
export function StatusLine(): JSX.Element {
  const tree = useWorkbench((s) => s.wb.history.present);
  const view = useWorkbench((s) => s.wb.activeViewSpec);
  const level = useWorkbench((s) => s.wb.activeLevel);
  const brief = useWorkbench((s) => s.wb.activeBrief);
  const selectedIds = useWorkbench((s) => s.wb.selectedNodeIds);
  const splitCoord = useWorkbench((s) => s.splitCoord);
  const undoDepth = useWorkbench((s) => s.wb.history.past.length);
  const redoDepth = useWorkbench((s) => s.wb.history.future.length);
  const theme = useWorkbench((s) => s.theme);

  const selectedCoord = selectedIds[0] !== undefined ? coordOfNodeId(tree, selectedIds[0]) : null;
  const focus = splitCoord ?? selectedCoord;
  const count = selectedIds.length;

  return (
    <header className="status-line" aria-label="Status">
      <button
        type="button"
        className="status-line__mark"
        data-tip="System.Veil · return to the entry page"
        onClick={() => void dispatchLine("System.Veil")}
      >
        Augeron
      </button>
      <span className="status-line__doc" title={tree.title}>
        {tree.title}
      </span>

      <span className="status-line__group" aria-label="View">
        <span className="status-line__label">View</span>
        {VIEWS.map(({ code, label, tip }) => (
          <ViewChip
            key={code}
            code={code}
            label={label}
            command={`View.Spec(${code})`}
            active={brief === undefined && code === view}
            tip={tip}
          />
        ))}
        <ViewChip
          label={brief !== undefined ? `brief ${brief}` : "brief"}
          command={`View.Brief(${brief ?? DEFAULT_BRIEF})`}
          active={brief !== undefined}
          tip={`View.Brief(${brief ?? DEFAULT_BRIEF}) · the key sentences of each section, with addresses`}
        />
        {level !== undefined && brief === undefined ? (
          <span className="status-line__note">headings to level {level}</span>
        ) : null}
      </span>

      <span className="status-line__group" aria-label="Focus">
        <span className="status-line__label">Focus</span>
        {focus !== null ? (
          <button
            type="button"
            className="status-item status-item--coord"
            data-tip={splitCoord !== null ? `${focus} is open in the split pane` : `Open ${focus} in the split pane`}
            onClick={() => openSplit(focus)}
          >
            {focus}
          </button>
        ) : (
          <span className="status-line__note">none</span>
        )}
      </span>

      <span className="status-line__group" aria-label="Scope">
        <span className="status-line__label">Scope</span>
        {count > 0 ? (
          <>
            <span className="status-line__scope">
              {count === 1 && selectedCoord !== null ? `selection ${selectedCoord}` : `selection, ${count} paragraphs`}
            </span>
            <button
              type="button"
              className="status-item"
              data-tip="Clear the selection. Spec.Tighten and Outline.ExtractTasks then act on the whole document. Esc does the same."
              onClick={clearSelection}
            >
              clear
            </button>
          </>
        ) : (
          <span className="status-line__scope">whole document</span>
        )}
      </span>

      <span className="status-line__group" aria-label="Theme">
        <span className="status-line__label">Theme</span>
        {THEME_CHOICES.map(({ name, tip }) => (
          <ViewChip key={name} label={name} command={`View.Theme(${name})`} active={theme === name} tip={tip} />
        ))}
      </span>

      <span className="status-line__group status-line__group--end" aria-label="History">
        <button
          type="button"
          className="status-item"
          data-tip="System.Undo · restore the previous text"
          onClick={() => void dispatchLine("System.Undo")}
        >
          undo {undoDepth}
        </button>
        {redoDepth > 0 ? (
          <button
            type="button"
            className="status-item"
            data-tip="System.Redo · reapply the text you undid"
            onClick={() => void dispatchLine("System.Redo")}
          >
            redo {redoDepth}
          </button>
        ) : null}
      </span>
    </header>
  );
}
