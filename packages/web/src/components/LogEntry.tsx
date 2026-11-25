import { useState, type JSX, type KeyboardEvent, type MouseEvent } from "react";
import { formatLogBody, summarizeLogEntry, type LogEntry as LogRecord } from "@augeron/core";
import { loggedAt } from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";

function clock(at: number | undefined): string {
  if (at === undefined) return "";
  return new Date(at).toLocaleTimeString("en-GB", { hour12: false });
}

/**
 * One run in System.Log: a single line (time, command, summary such as "3 flags on 2 nodes") that expands
 * to the full output on click. States: collapsed, expanded, error (redline title and summary). The summary
 * and output keep § addresses live, so a reader can jump from the log to the paragraph.
 */
export function LogEntry({
  entry,
  index,
  onPlainClick,
}: {
  entry: LogRecord;
  index: number;
  onPlainClick: (command: string) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const prefix = `log-${index}`;
  const body = formatLogBody(entry);
  const summary = summarizeLogEntry(entry);
  const toggle = (): void => setOpen((value) => !value);
  // A command token in the title keeps its own click (run on Ctrl/Cmd, hint on plain click). Only the rest of the line toggles.
  const onHeadClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target instanceof Element && event.target.closest("[data-cmd-id], .coord-ref")) return;
    toggle();
  };
  const onHeadKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };
  return (
    <article className={entry.error ? "log-entry log-entry--error" : "log-entry"}>
      <div
        className="log-entry__head"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        data-tip={open ? "Collapse this entry" : "Expand this entry"}
        onClick={onHeadClick}
        onKeyDown={onHeadKeyDown}
      >
        <span className="log-entry__time">{clock(loggedAt.get(entry))}</span>
        <span className="log-entry__title">
          <OberonTextRenderer text={entry.title} idPrefix={`${prefix}-title`} plainClickRuns={false} onPlainClick={onPlainClick} />
        </span>
        <span className="log-entry__summary">{summary}</span>
        <span className="log-entry__caret" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </div>
      {open && body.length > 0 ? (
        <pre className="log-entry__body">
          <OberonTextRenderer text={body} idPrefix={`${prefix}-body`} plainClickRuns={false} onPlainClick={onPlainClick} />
        </pre>
      ) : null}
    </article>
  );
}
