import type { CSSProperties, JSX, MouseEvent, ReactNode } from "react";
import { dispatchLine } from "../state/useWorkbenchStore";

interface Props {
  /** Text label such as UNVERIFIED or BROKEN REF. Status is never shown by colour alone. */
  label: string;
  /** The reason, as text. Commands and § addresses inside it stay live. */
  children: ReactNode;
  /** Address of the paragraph the flag belongs to. Ctrl/Cmd-click runs Link.Back on it. */
  sourceCoord?: string;
  /** Delay before the callout drops in, from the Spec.Audit stagger. */
  delayMs?: number;
}

/**
 * A reviewer's flag in the margin: a label and a reason. The leader line to the paragraph is drawn by
 * FlagLeader in the row, not here. Hovering the callout highlights the paragraph through a :has() rule in
 * index.css. Ctrl/Cmd-click runs Link.Back on the paragraph, because core has no Explain.Flag command yet.
 */
export function RedlineCallout({ label, children, sourceCoord, delayMs = 0 }: Props): JSX.Element {
  const onClick = (event: MouseEvent<HTMLElement>): void => {
    if (!sourceCoord || !(event.ctrlKey || event.metaKey)) return;
    event.stopPropagation();
    void dispatchLine(`Link.Back(${sourceCoord})`, { sourceCoord });
  };
  const style = { animationDelay: `${delayMs}ms` } as CSSProperties;
  return (
    <aside
      className="redline redline--drop"
      style={style}
      aria-label={`${label} flag`}
      data-tip={sourceCoord ? `Ctrl/Cmd-click to run Link.Back(${sourceCoord})` : undefined}
      onClick={onClick}
    >
      <p className="redline__label">{label}</p>
      <p className="redline__reason">{children}</p>
    </aside>
  );
}

/**
 * The leader from a paragraph's first line to its flag. It is a hairline in the gap between the text column
 * and the margin, on the first line's baseline. The row positions it absolutely, so it adds no vertical space.
 * The line is drawn left to right after the callout lands. The callout's label sits on the same baseline.
 */
export function FlagLeader({ delayMs }: { delayMs: number }): JSX.Element {
  const style = { "--leader-delay": `${delayMs}ms` } as CSSProperties;
  return (
    <div className="flag-leader" aria-hidden="true">
      <span className="flag-leader__line" style={style} />
      <span className="flag-leader__dot" style={style} />
    </div>
  );
}
