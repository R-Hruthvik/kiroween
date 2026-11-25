import { useMemo, useState, type JSX, type KeyboardEvent } from "react";
import { dispatchLine } from "../state/useWorkbenchStore";
import { parseCommandLine } from "../state/slashCommands";

const HINT_ID = "command-line-hint";

/**
 * The command line over System.Tool. It takes a slash form (/audit, /view u, /find legal hold) or a
 * Module.Action token. The expansion shows inline under the field: "runs Spec.Audit". An unknown slash name
 * lists the three closest names as text the reader can click. No popup, no menu. Enter runs, Escape clears.
 */
export function CommandLine(): JSX.Element {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => parseCommandLine(text), [text]);

  const submit = (): void => {
    if (parsed.kind !== "run" || busy) return;
    const line = parsed.line;
    setBusy(true);
    dispatchLine(line).then(
      () => {
        setBusy(false);
        setText("");
      },
      () => setBusy(false),
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      setText("");
    }
  };

  const onChange = (value: string): void => setText(value);

  return (
    <section className="command-line" aria-label="Command line">
      <div className="command-line__field">
        <input
          className="command-line__input"
          type="text"
          value={text}
          placeholder="Type / for commands"
          spellCheck={false}
          autoComplete="off"
          aria-label="Command line. Type a slash command or a Module.Action token."
          aria-describedby={HINT_ID}
          aria-invalid={parsed.kind === "error" ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div id={HINT_ID} className="command-line__hint" role="status" aria-live="polite">
        {busy ? <span className="command-line__running">Running…</span> : null}
        {/* Keyed on the expansion, so each change fades the new text in. */}
        {!busy && parsed.kind === "run" ? (
          <span key={parsed.expansion} className="command-line__expansion">
            {parsed.expansion}
          </span>
        ) : null}
        {!busy && parsed.kind === "error" ? (
          <span className="command-line__error">
            {parsed.message}
            {parsed.suggestions.length > 0 ? (
              <>
                {" "}
                Closest:{" "}
                {parsed.suggestions.map((suggestion, index) => (
                  <span key={suggestion}>
                    {index > 0 ? ", " : null}
                    <button type="button" className="command-line__suggestion" onClick={() => onChange(suggestion)}>
                      {suggestion}
                    </button>
                  </span>
                ))}
              </>
            ) : null}
          </span>
        ) : null}
        {!busy && parsed.kind === "empty" ? (
          <span className="command-line__idle">Enter runs it. /help lists every command.</span>
        ) : null}
      </div>
    </section>
  );
}
