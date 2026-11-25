import type { JSX } from "react";
import { dispatchLine } from "../state/useWorkbenchStore";

interface Props {
  /** The View-Spec letter, shown in mono. Omitted for chips that have no letter. */
  code?: string;
  /** Plain-words label after the code. */
  label: string;
  /** The command the chip runs, such as View.Spec(h). */
  command: string;
  /** Current view. A current chip is filled ink with paper text. */
  active: boolean;
  tip: string;
}

/**
 * A view switch in the status line. Rest, hover, focus-visible and current states. Clicking runs the
 * command, so the chip is a text command with a label, not an icon.
 */
export function ViewChip({ code, label, command, active, tip }: Props): JSX.Element {
  return (
    <button
      type="button"
      className={active ? "view-chip view-chip--active" : "view-chip"}
      aria-pressed={active}
      data-tip={tip}
      onClick={() => void dispatchLine(command)}
    >
      {code ? <span className="view-chip__code">{code}</span> : null}
      <span className="view-chip__label">{label}</span>
    </button>
  );
}
