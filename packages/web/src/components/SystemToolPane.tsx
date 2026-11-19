import { useEffect, useRef, useState, type JSX, type MouseEvent } from "react";
import { setToolText, useWorkbench } from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";

/**
 * System.Tool is a plain-text command pad with two modes. The rendered mode keeps every token live.
 * A click on blank space or on a line that has no token switches to the editor. Blur switches back.
 */
export function SystemToolPane(): JSX.Element {
  const text = useWorkbench((s) => s.toolText);
  const [editing, setEditing] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) areaRef.current?.focus();
  }, [editing]);

  const onRenderedClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-cmd-id]")) return;
    setEditing(true);
  };

  return (
    <div className="tool-pane">
      <header className="pane-header">
        <span className="pane-title">System.Tool</span>
        <span className="pane-hint">middle-click or Ctrl/Cmd-click a command</span>
      </header>
      {editing ? (
        <textarea
          ref={areaRef}
          className="tool-pane__editor"
          value={text}
          spellCheck={false}
          aria-label="System.Tool command pad"
          onChange={(event) => setToolText(event.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.blur();
          }}
        />
      ) : (
        <div className="tool-pane__rendered" onClick={onRenderedClick} role="presentation">
          <OberonTextRenderer text={text} idPrefix="tool" plainClickRuns={false} className="tool-pane__text" />
        </div>
      )}
    </div>
  );
}
