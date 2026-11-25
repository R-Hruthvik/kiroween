import { useState, type JSX, type MouseEvent } from "react";
import type { HiddenSummary } from "@augeron/core";
import { OberonTextRenderer } from "./OberonTextRenderer";

/**
 * The line under the document that says what the current view hides. Its counts come from core
 * (hiddenSummary). The button expands the § addresses that are hidden or partly hidden. Each address
 * opens in the split pane, as any § reference does.
 */
export function HiddenFooter({ summary }: { summary: HiddenSummary }): JSX.Element {
  const [open, setOpen] = useState(false);
  const hasList = summary.addresses.length > 0;
  // The footer sits inside the Document Track. A click on it must not clear the node selection.
  const stop = (event: MouseEvent<HTMLElement>): void => event.stopPropagation();
  return (
    <footer className="doc-hidden" onMouseUp={stop} data-filters={summary.filters}>
      {hasList ? (
        <button
          type="button"
          className="doc-hidden__toggle"
          aria-expanded={open}
          data-tip={open ? "Hide the list of addresses" : "List the § addresses that this view hides"}
          onClick={() => setOpen((value) => !value)}
        >
          {summary.text} {open ? "Hide list" : `List ${summary.addresses.length} address${summary.addresses.length === 1 ? "" : "es"}`}
        </button>
      ) : (
        <span>{summary.text}</span>
      )}
      {open && hasList ? (
        <ul className="doc-hidden__list" aria-label="Hidden addresses">
          {summary.addresses.map((coord) => (
            <li key={coord}>
              <OberonTextRenderer text={coord} idPrefix={`hidden-${coord}`} plainClickRuns={false} />
            </li>
          ))}
        </ul>
      ) : null}
    </footer>
  );
}
