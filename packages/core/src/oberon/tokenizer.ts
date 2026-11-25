import type { ParsedCommand } from "../types.js";

// Whole-token form, from SPEC.md section 2.3.
const TOKEN_FULL = /^([A-Z][a-zA-Z0-9]*)\.([A-Z][a-zA-Z0-9]*)(?:\(([^)]*)\))?$/;

// Scanning form for finding tokens inside free text, from BUILD_PLAN.md section 3.3.
const TOKEN_SCAN = /\b([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*)(?:\(([^)]*)\))?/g;

/** Parses one whole token such as "View.Spec(u)". Returns null when the text is not a token. */
export function parseCommand(raw: string): ParsedCommand | null {
  const match = TOKEN_FULL.exec(raw);
  if (!match) return null;
  const module = match[1] ?? "";
  const action = match[2] ?? "";
  const arg = match[3];
  // arg is omitted when there are no parentheses, and "" for an empty "()".
  return arg === undefined
    ? { raw, module, action }
    : { raw, module, action, arg };
}

/** Inverse of parseCommand. */
export function formatCommand(command: Pick<ParsedCommand, "module" | "action" | "arg">): string {
  return command.arg === undefined
    ? `${command.module}.${command.action}`
    : `${command.module}.${command.action}(${command.arg})`;
}

export interface ScannedToken {
  raw: string;
  start: number;
  end: number;
  command: ParsedCommand;
}

/** Finds every command token inside free text, in order of appearance. */
export function scanCommandTokens(text: string): ScannedToken[] {
  const tokens: ScannedToken[] = [];
  for (const match of text.matchAll(TOKEN_SCAN)) {
    const raw = match[0];
    const command = parseCommand(raw);
    if (!command || match.index === undefined) continue;
    tokens.push({ raw, start: match.index, end: match.index + raw.length, command });
  }
  return tokens;
}

/** Splits a pipeline on "->". Each stage is trimmed. Empty stages are kept so the caller can reject them. */
export function splitPipeline(line: string): string[] {
  return line.split("->").map((stage) => stage.trim());
}

/**
 * The line that Ctrl/Cmd+Enter runs, for a caret at `caret` in pad text. A "->" line runs whole, so core
 * can refuse a bad stage. A line with one command runs that command. A line with several commands runs the
 * one under the caret, or the nearest one before it. Returns null for blank lines, "#" group headings,
 * and lines with no command.
 */
export function commandLineAt(text: string, caret: number): string | null {
  const at = Math.min(Math.max(caret, 0), text.length);
  const start = at === 0 ? 0 : text.lastIndexOf("\n", at - 1) + 1;
  const newline = text.indexOf("\n", at);
  const raw = text.slice(start, newline === -1 ? text.length : newline);
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.startsWith("#")) return null;
  if (trimmed.includes("->")) return trimmed;
  const tokens = scanCommandTokens(raw);
  const first = tokens[0];
  if (first === undefined) return null;
  if (tokens.length === 1) return first.raw;
  const offset = at - start;
  const under = tokens.find((token) => offset >= token.start && offset <= token.end);
  if (under) return under.raw;
  const before = tokens.filter((token) => token.start < offset).at(-1);
  return (before ?? first).raw;
}
