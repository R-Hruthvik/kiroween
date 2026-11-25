import { useEffect, useRef, type JSX } from "react";
import { useWorkbench } from "../state/useWorkbenchStore";
import { LogEntry } from "./LogEntry";
import { OberonTextRenderer } from "./OberonTextRenderer";
import { usePaneNudge } from "./usePaneNudge";

/**
 * System.Log: append-only, one line per run. Each line shows the command, its summary, and any § addresses
 * as live links. An empty log says what to do instead of showing a blank pane.
 */
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
          {nudge ?? "Append-only. Click a line to expand it."}
        </span>
      </header>
      <div className="log-pane__stream" role="log" aria-live="polite">
        {log.length === 0 ? (
          <p className="log-pane__empty">
            Commands you run appear here. Try <OberonTextRenderer text="Spec.Audit" idPrefix="log-empty" plainClickRuns={true} />.
          </p>
        ) : (
          log.map((entry, index) => (
            <LogEntry key={`${index}-${entry.title}`} entry={entry} index={index} onPlainClick={showNudge} />
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
