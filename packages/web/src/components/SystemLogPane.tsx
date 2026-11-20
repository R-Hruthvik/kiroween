import { useEffect, useRef, type JSX } from "react";
import type { LogEntry } from "@augeron/core";
import { loggedAt, useWorkbench } from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";
import { usePaneNudge } from "./usePaneNudge";

function clock(at: number | undefined): string {
  if (at === undefined) return "--:--:--";
  return new Date(at).toLocaleTimeString("en-GB", { hour12: false });
}

/**
 * Strips the "### " heading markers that core adds to each command section. A single-command entry
 * starts with a section named like the entry title, so that line is dropped to avoid showing the
 * command name twice. Pipeline entries keep their per-stage section names.
 */
function bodyText(title: string, body: string): string {
  const own = `### ${title}\n`;
  const rest = body.startsWith(own) ? body.slice(own.length) : body;
  return rest.replace(/^### /gm, "");
}

function Entry({
  entry,
  index,
  onPlainClick,
}: {
  entry: LogEntry;
  index: number;
  onPlainClick: (command: string) => void;
}): JSX.Element {
  const prefix = `log-${index}`;
  return (
    <article className={entry.error ? "log-entry log-entry--error" : "log-entry"}>
      <header className="log-entry__head">
        <span className="log-entry__time">{clock(loggedAt.get(entry))}</span>
        <span className="log-entry__title">
          <OberonTextRenderer text={entry.title} idPrefix={`${prefix}-title`} plainClickRuns={false} onPlainClick={onPlainClick} />
        </span>
      </header>
      {bodyText(entry.title, entry.body).length > 0 ? (
        <pre className="log-entry__body">
          <OberonTextRenderer
            text={bodyText(entry.title, entry.body)}
            idPrefix={`${prefix}-body`}
            plainClickRuns={false}
            onPlainClick={onPlainClick}
          />
        </pre>
      ) : null}
      {entry.error ? <p className="log-entry__error">{entry.error}</p> : null}
    </article>
  );
}

export function SystemLogPane(): JSX.Element {
  const log = useWorkbench((s) => s.wb.log);
  const endRef = useRef<HTMLDivElement | null>(null);
  const { nudge, showNudge } = usePaneNudge();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [log.length]);

  return (
    <div className="log-pane">
      <header className="pane-header">
        <span className="pane-title">System.Log</span>
        <span className={nudge ? "pane-hint pane-hint--nudge" : "pane-hint"} role="status" aria-live="polite">
          {nudge ?? "append-only"}
        </span>
      </header>
      <div className="log-pane__stream" role="log" aria-live="polite">
        {log.map((entry, index) => (
          <Entry key={`${index}-${entry.title}`} entry={entry} index={index} onPlainClick={showNudge} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
