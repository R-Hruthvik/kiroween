import { useState, type JSX, type KeyboardEvent, type MouseEvent } from "react";
import { dispatchLine } from "../state/useWorkbenchStore";

interface Props {
  /** Text shown in the document or pad, as written. */
  label: string;
  /** The Oberon line that runs. Equals the label for one token, or the whole chain for a pipeline. */
  command: string;
  commandId: string;
  /** True when the token runs a "->" chain. Shown with a longer underline. */
  chain?: boolean;
  /** When true, a plain click runs the command (System.Log and the Edit controls). Otherwise a plain click calls onPlainClick. */
  plainClickRuns: boolean;
  sourceCoord?: string;
  onPlainClick?: (command: string) => void;
}

/**
 * A live Oberon command. States: rest (ink, dotted underline), hover and focus-visible (solid underline and a
 * 4px ring), running (the underline fills while the line executes). Middle-click and Ctrl/Cmd-click always run.
 * A plain click runs only when plainClickRuns is set, so System.Tool and the document never run by accident.
 */
export function CommandToken({
  label,
  command,
  commandId,
  chain = false,
  plainClickRuns,
  sourceCoord,
  onPlainClick,
}: Props): JSX.Element {
  const [running, setRunning] = useState(false);

  const run = (): void => {
    setRunning(true);
    dispatchLine(command, { commandId, sourceCoord }).then(
      () => setRunning(false),
      () => setRunning(false),
    );
  };

  const onMouseDown = (event: MouseEvent<HTMLButtonElement>): void => {
    if (event.button === 1) {
      // Block the browser's middle-click auto-scroll, then run.
      event.preventDefault();
      run();
    }
  };
  const onAuxClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (event.button === 1) event.preventDefault();
  };
  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (event.metaKey || event.ctrlKey || plainClickRuns) {
      event.stopPropagation();
      run();
      return;
    }
    onPlainClick?.(command);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    // Enter runs with or without the plain-click rule. Preventing the default stops a second click event.
    if (event.key === "Enter") {
      event.preventDefault();
      run();
    }
  };

  const how = plainClickRuns ? "Click" : "Middle-click or Ctrl/Cmd-click";
  const tip = chain ? `${how} to run the chain ${command}` : `${how} to run ${command}`;
  const classes = ["cmd-token", chain ? "cmd-token--chain" : "", running ? "cmd-token--running" : ""]
    .filter((part) => part.length > 0)
    .join(" ");

  return (
    <button
      type="button"
      data-cmd-id={commandId}
      data-tip={tip}
      aria-label={running ? `${label}, running` : undefined}
      className={classes}
      onMouseDown={onMouseDown}
      onAuxClick={onAuxClick}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {label}
    </button>
  );
}
