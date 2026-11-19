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
