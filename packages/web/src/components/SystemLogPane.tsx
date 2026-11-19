import { useEffect, useRef, type JSX } from "react";
import type { LogEntry } from "@augeron/core";
import { loggedAt, useWorkbench } from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";

function clock(at: number | undefined): string {
  if (at === undefined) return "--:--:--";
  return new Date(at).toLocaleTimeString("en-GB", { hour12: false });
}

/** Strips the "### " heading markers that core adds to each command section. */
function bodyText(body: string): string {
  return body.replace(/^### /gm, "");
}

function Entry({ entry, index }: { entry: LogEntry; index: number }): JSX.Element {
  const prefix = `log-${index}`;
  return (
    <article className={entry.error ? "log-entry log-entry--error" : "log-entry"}>
      <header className="log-entry__head">
        <span className="log-entry__time">{clock(loggedAt.get(entry))}</span>
        <span className="log-entry__title">
          <OberonTextRenderer text={entry.title} idPrefix={`${prefix}-title`} plainClickRuns={true} />
        </span>
      </header>
      {entry.body.length > 0 ? (
        <pre className="log-entry__body">
          <OberonTextRenderer text={bodyText(entry.body)} idPrefix={`${prefix}-body`} plainClickRuns={true} />
        </pre>
      ) : null}
      {entry.error ? <p className="log-entry__error">{entry.error}</p> : null}
    </article>
  );
}

export function SystemLogPane(): JSX.Element {
  const log = useWorkbench((s) => s.wb.log);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [log.length]);

  return (
    <div className="log-pane">
      <header className="pane-header">
        <span className="pane-title">System.Log</span>
        <span className="pane-hint">append-only</span>
      </header>
      <div className="log-pane__stream" role="log" aria-live="polite">
        {log.map((entry, index) => (
          <Entry key={`${index}-${entry.title}`} entry={entry} index={index} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
