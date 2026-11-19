import type { MouseEvent, KeyboardEvent, ReactNode, JSX } from "react";
import { REF_PATTERN, scanCommandTokens } from "@augeron/core";
import { dispatchLine, lineAt, openSplit } from "../state/useWorkbenchStore";

interface Props {
  text: string;
  /** Prefix for data-cmd-id values. Must be unique per pane so pulse targeting finds the right token. */
  idPrefix: string;
  /** When true, a plain click dispatches the token. Used in System.Log. Other panes need Ctrl/Cmd or middle-click. */
  plainClickRuns: boolean;
  /** Coordinate of the node that owns this text, used as the pulse source. */
  sourceCoord?: string;
  className?: string;
}

/** Full line when it holds a "->" pipeline, otherwise the token alone. */
function commandFor(text: string, tokenStart: number, tokenRaw: string): string {
  const line = lineAt(text, tokenStart);
  if (!line.includes("->")) return tokenRaw;
  return scanCommandTokens(line)
    .map((token) => token.raw)
    .join(" -> ");
}

interface Token {
  kind: "cmd" | "coord";
  start: number;
  raw: string;
}

function findSegments(text: string): Token[] {
  const tokens: Token[] = scanCommandTokens(text).map((token) => ({
    kind: "cmd" as const,
    start: token.start,
    raw: token.raw,
  }));
  for (const match of text.matchAll(REF_PATTERN)) {
    if (match.index === undefined) continue;
    tokens.push({ kind: "coord", start: match.index, raw: match[0] });
  }
  return tokens.sort((a, b) => a.start - b.start);
}

/**
 * Renders text with live Module.Action tokens and § coordinates.
 * Command tokens run on middle-click (button 1), or on Ctrl/Cmd-click, or on a plain click when plainClickRuns is set.
 * Coordinates open the split pane on click.
 */
export function OberonTextRenderer({ text, idPrefix, plainClickRuns, sourceCoord, className }: Props): JSX.Element {
  const segments = findSegments(text);
  const nodes: ReactNode[] = [];
  let cursor = 0;

  segments.forEach((segment, index) => {
    if (segment.start < cursor) return;
    if (segment.start > cursor) nodes.push(text.slice(cursor, segment.start));
    const end = segment.start + segment.raw.length;

    if (segment.kind === "cmd") {
      const commandId = `${idPrefix}-${index}`;
      const command = commandFor(text, segment.start, segment.raw);
      const run = (): void => {
        void dispatchLine(command, { commandId, sourceCoord });
      };
      const onMouseDown = (event: MouseEvent<HTMLSpanElement>): void => {
        if (event.button === 1) {
          // Block the browser's middle-click auto-scroll.
          event.preventDefault();
          run();
        }
      };
      const onAuxClick = (event: MouseEvent<HTMLSpanElement>): void => {
        if (event.button === 1) event.preventDefault();
      };
      const onClick = (event: MouseEvent<HTMLSpanElement>): void => {
        if (event.metaKey || event.ctrlKey || plainClickRuns) {
          event.stopPropagation();
          run();
        }
      };
      const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>): void => {
        if (event.key === "Enter") run();
      };
      nodes.push(
        <span
          key={`${commandId}-${segment.start}`}
          role="button"
          tabIndex={0}
          data-cmd-id={commandId}
          title={`Middle-click or Ctrl/Cmd-click to run ${command}`}
          className="cmd-token"
          onMouseDown={onMouseDown}
          onAuxClick={onAuxClick}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          {segment.raw}
        </span>,
      );
    } else {
      const coord = segment.raw;
      nodes.push(
        <span
          key={`coord-${index}-${segment.start}`}
          role="link"
          tabIndex={0}
          data-coord-ref={coord}
          className="coord-ref"
          onClick={(event) => {
            event.stopPropagation();
            openSplit(coord);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") openSplit(coord);
          }}
        >
          {coord}
        </span>,
      );
    }
    cursor = end;
  });

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <span className={className}>{nodes}</span>;
}
