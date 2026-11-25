import type { JSX, ReactNode } from "react";
import { BUILTIN_REGISTRY, REF_PATTERN, asPipeline, scanCommandTokens } from "@augeron/core";
import { isRunnableToken, openSplit } from "../state/useWorkbenchStore";
import { CommandToken } from "./CommandToken";

interface Props {
  text: string;
  /** Prefix for data-cmd-id values. Must be unique per pane so each token gets a stable id. */
  idPrefix: string;
  /** When true, a plain click dispatches the token. Used in System.Log. Other panes need Ctrl/Cmd or middle-click. */
  plainClickRuns: boolean;
  /**
   * When true, a token on a line made only of core commands joined by "->" runs the whole chain.
   * Used in System.Tool only. Everywhere else a token runs alone. Web-only commands (Doc.Load,
   * AI.Config, Edit.*) never form a chain, because core pipelines cannot run them.
   */
  pipelines?: boolean;
  /** Called on a plain click that does not run the token, so the pane can show a hint. */
  onPlainClick?: (command: string) => void;
  /** Coordinate of the node that owns this text, used as the Link.Back target when a token runs. */
  sourceCoord?: string;
  className?: string;
  /**
   * When true (default), inline Markdown renders: `code`, **strong**, *emphasis* and [links](target).
   * Code spans turn markup off for their contents, but commands and § addresses stay live.
   */
  markup?: boolean;
}

/**
 * The text a token runs. In System.Tool, a token on a "->" line runs the whole line, so a line with a bad
 * stage is refused by core before any stage runs. Other lines run the token alone.
 */
function commandFor(text: string, tokenStart: number, tokenRaw: string, pipelines: boolean): string {
  if (!pipelines) return tokenRaw;
  const line = lineAtIndex(text, tokenStart);
  if (!line.includes("->")) return tokenRaw;
  return asPipeline(line, BUILTIN_REGISTRY) ?? line.trim();
}

function lineAtIndex(text: string, index: number): string {
  const start = text.lastIndexOf("\n", index - 1) + 1;
  const end = text.indexOf("\n", index);
  return text.slice(start, end === -1 ? text.length : end);
}

type SegmentKind = "cmd" | "coord" | "link" | "code" | "strong" | "em";

interface Segment {
  kind: SegmentKind;
  start: number;
  /** The matched source text. The segment is replaced by this text in the rendered output. */
  raw: string;
  /** Link text and target, for kind "link". */
  label?: string;
  target?: string;
  /** Inner text, for code, strong and em. */
  inner?: string;
}

/** Inline code span: a run of backticks, its content, and the same run closing it. */
const CODE_SPAN = /(`+)([^\n]*?)\1/g;
/** Strong: **text** with no space just inside the stars. */
const STRONG = /\*\*(?=\S)([^\n]*?\S)\*\*/g;
/** Emphasis: *text* with no space just inside the stars and no word character touching them. */
const EMPHASIS = /(?<![*\w])\*(?=\S)([^*\n]*?\S)\*(?![*\w])/g;
/** Markdown inline link "[label](target)". */
const MD_LINK = /\[([^\]\n]*)\]\(([^)\n]*)\)/g;

function inRanges(index: number, ranges: readonly { start: number; end: number }[]): boolean {
  return ranges.some((range) => index >= range.start && index < range.end);
}

/** Markup segments. Matches inside a code span are dropped, so code text is never reparsed as emphasis or a link. */
function markupSegments(text: string): Segment[] {
  const codeMatches = [...text.matchAll(CODE_SPAN)];
  const codeRanges = codeMatches.map((match) => {
    const start = match.index ?? 0;
    return { start, end: start + match[0].length };
  });
  const out: Segment[] = codeMatches.map((match) => ({
    kind: "code" as const,
    start: match.index ?? 0,
    raw: match[0],
    inner: match[2] ?? "",
  }));
  for (const match of text.matchAll(STRONG)) {
    const start = match.index ?? 0;
    if (inRanges(start, codeRanges)) continue;
    out.push({ kind: "strong", start, raw: match[0], inner: match[1] ?? "" });
  }
  for (const match of text.matchAll(EMPHASIS)) {
    const start = match.index ?? 0;
    if (inRanges(start, codeRanges)) continue;
    out.push({ kind: "em", start, raw: match[0], inner: match[1] ?? "" });
  }
  for (const match of text.matchAll(MD_LINK)) {
    const start = match.index ?? 0;
    if (inRanges(start, codeRanges)) continue;
    out.push({ kind: "link", start, raw: match[0], label: match[1] ?? "", target: match[2] ?? "" });
  }
  return out;
}

function findSegments(text: string, markup: boolean): Segment[] {
  const segments: Segment[] = scanCommandTokens(text)
    .filter((token) => isRunnableToken(`${token.command.module}.${token.command.action}`))
    .map((token) => ({ kind: "cmd" as const, start: token.start, raw: token.raw }));
  for (const match of text.matchAll(REF_PATTERN)) {
    if (match.index === undefined) continue;
    segments.push({ kind: "coord", start: match.index, raw: match[0] });
  }
  if (markup) segments.push(...markupSegments(text));
  // Sorting by start means a markup span wins over tokens it contains, which then render inside it.
  return segments.sort((a, b) => a.start - b.start || b.raw.length - a.raw.length);
}

/** An https or http link is followed in a new tab. Anything else stays text, so no javascript: links can appear. */
function safeHref(target: string): string | null {
  return /^https?:\/\//i.test(target) ? target : null;
}

/**
 * Renders text with live Module.Action tokens, § coordinates, and inline Markdown.
 * Only registered commands become live tokens. They run on middle-click (button 1), on Ctrl/Cmd-click,
 * or on a plain click when plainClickRuns is set. Coordinates open the split pane on click.
 */
export function OberonTextRenderer({
  text,
  idPrefix,
  plainClickRuns,
  pipelines = false,
  onPlainClick,
  sourceCoord,
  className,
  markup = true,
}: Props): JSX.Element {
  const segments = findSegments(text, markup);
  const nodes: ReactNode[] = [];
  let cursor = 0;

  segments.forEach((segment, index) => {
    if (segment.start < cursor) return;
    if (segment.start > cursor) nodes.push(text.slice(cursor, segment.start));
    const end = segment.start + segment.raw.length;
    const key = `${segment.kind}-${index}-${segment.start}`;
    const childPrefix = `${idPrefix}-${index}`;

    switch (segment.kind) {
      case "cmd": {
        const command = commandFor(text, segment.start, segment.raw, pipelines);
        nodes.push(
          <CommandToken
            key={key}
            label={segment.raw}
            command={command}
            commandId={childPrefix}
            chain={command !== segment.raw}
            plainClickRuns={plainClickRuns}
            sourceCoord={sourceCoord}
            onPlainClick={onPlainClick}
          />,
        );
        break;
      }
      case "coord": {
        const coord = segment.raw;
        nodes.push(
          <button
            key={key}
            type="button"
            className="coord-ref"
            data-coord-ref={coord}
            data-tip={`Open ${coord} in the split pane`}
            onClick={(event) => {
              event.stopPropagation();
              openSplit(coord);
            }}
          >
            {coord}
          </button>,
        );
        break;
      }
      case "link": {
        const href = safeHref(segment.target ?? "");
        nodes.push(
          href ? (
            <a key={key} className="md-link" href={href} target="_blank" rel="noopener noreferrer">
              {segment.label}
            </a>
          ) : (
            <span key={key} className="md-link md-link--inert" title={segment.target}>
              {segment.label}
            </span>
          ),
        );
        break;
      }
      case "code":
        nodes.push(
          <code key={key} className="md-code">
            <OberonTextRenderer
              text={segment.inner ?? ""}
              idPrefix={childPrefix}
              plainClickRuns={plainClickRuns}
              pipelines={false}
              onPlainClick={onPlainClick}
              sourceCoord={sourceCoord}
              markup={false}
            />
          </code>,
        );
        break;
      case "strong":
      case "em": {
        const inner = (
          <OberonTextRenderer
            text={segment.inner ?? ""}
            idPrefix={childPrefix}
            plainClickRuns={plainClickRuns}
            pipelines={false}
            onPlainClick={onPlainClick}
            sourceCoord={sourceCoord}
            markup={true}
          />
        );
        nodes.push(segment.kind === "strong" ? <strong key={key}>{inner}</strong> : <em key={key}>{inner}</em>);
        break;
      }
    }
    cursor = end;
  });

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <span className={className}>{nodes}</span>;
}
