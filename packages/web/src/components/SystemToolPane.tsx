import { useEffect, useRef, useState, type JSX, type MouseEvent } from "react";
import { BUILTIN_REGISTRY, commandLineAt, pipelineError } from "@augeron/core";
import { dispatchLine, setToolText, useWorkbench } from "../state/useWorkbenchStore";
import { OberonTextRenderer } from "./OberonTextRenderer";
import { usePaneNudge } from "./usePaneNudge";

/** A pad line that is one command followed by a description: "Spec.Audit  flags contradictions". */
const COMMAND_WITH_NOTE = /^(\S+)\s{2,}(\S.*)$/;
const TOKEN_LIKE = /^[A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*(\([^)]*\))?$/;

/**
 * The inline error for a "->" line with a stage that is not a registered command. Such a line runs nothing:
 * clicking its tokens logs the same message in System.Log.
 */
function chainProblem(line: string): JSX.Element | null {
  if (!line.includes("->")) return null;
  const message = pipelineError(line, BUILTIN_REGISTRY);
  if (message === null) return null;
  return (
    <div className="tool-pane__error" role="alert">
      Not run: {message}
    </div>
  );
}

/** One pad line. A command followed by a note renders with the note in lead colour, on the same line. */
function PadLine({ line, index, onPlainClick }: { line: string; index: number; onPlainClick: (command: string) => void }): JSX.Element {
  const note = COMMAND_WITH_NOTE.exec(line);
  const blank = line.trim().length === 0;
  if (note && TOKEN_LIKE.test(note[1] ?? "") && !line.includes("->")) {
    return (
      <div className="tool-pane__line tool-pane__line--note">
        <OberonTextRenderer
          text={note[1] ?? ""}
          idPrefix={`tool-${index}`}
          plainClickRuns={false}
          pipelines={true}
          onPlainClick={onPlainClick}
        />
        <span className="tool-pane__note">{note[2]}</span>
      </div>
    );
  }
  return (
    <div>
      <OberonTextRenderer
        text={line}
        idPrefix={`tool-${index}`}
        plainClickRuns={false}
        pipelines={true}
        onPlainClick={onPlainClick}
        className={blank ? "tool-pane__line tool-pane__line--blank" : "tool-pane__line"}
      />
      {chainProblem(line)}
    </div>
  );
}

/**
 * System.Tool is the command pad under the command line. Two modes. The rendered mode keeps every token live,
 * grouped by what the command does, with a one-line note after each command. A click on blank space or on a
 * line without a token switches to the editor. Blur switches back. Lines starting with "#" are group headings.
 */
export function SystemToolPane(): JSX.Element {
  const text = useWorkbench((s) => s.toolText);
  const [editing, setEditing] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const { nudge, showNudge, flash } = usePaneNudge();

  useEffect(() => {
    if (editing) areaRef.current?.focus();
  }, [editing]);

  const onRenderedClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-cmd-id], button")) return;
    setEditing(true);
  };

  return (
    <div className="tool-pane">
      <header className="pane-header">
        <span className="pane-title">System.Tool</span>
        <span className={nudge ? "pane-hint pane-hint--nudge" : "pane-hint"} role="status" aria-live="polite">
          {nudge ?? "Middle-click or Ctrl/Cmd-click a command. Ctrl/Cmd+Enter runs the line at the cursor."}
        </span>
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
            if (event.key === "Escape") {
              event.currentTarget.blur();
              return;
            }
            // Ctrl/Cmd+Enter runs the line at the cursor, as a click on its token would. It never inserts a newline.
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              const line = commandLineAt(text, event.currentTarget.selectionStart);
              if (line === null) flash("Ctrl/Cmd+Enter: no command on this line.");
              else void dispatchLine(line);
            }
          }}
        />
      ) : (
        <div className="tool-pane__rendered" onClick={onRenderedClick} role="presentation">
          <div className="tool-pane__text">
            {text.split("\n").map((line, index) =>
              line.trimStart().startsWith("#") ? (
                <h3 key={index} className="tool-pane__group">
                  {line.replace(/^\s*#+\s*/, "")}
                </h3>
              ) : (
                <PadLine key={index} line={line} index={index} onPlainClick={showNudge} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
