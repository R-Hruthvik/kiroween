// Display helpers for System.Log. Pure text in, text out. The web log shows these instead of raw bodies.
import type { LogEntry } from "./registry.js";

/** One Spec.Audit flag line: "- §1.1a [UNVERIFIED_CLAIM] message". */
const FLAG_LINE = /^- (§\S+) \[([A-Z_]+)\] (.*)$/;
const SECTION_MARK = /^### /;
const MAX_SUMMARY = 140;

interface FlagGroup {
  types: string[];
  messages: string[];
}

type OutputLine = { kind: "text"; text: string } | { kind: "group"; coord: string; group: FlagGroup };

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function firstLine(text: string): string {
  const line = text.split("\n").map((part) => part.trim()).find((part) => part.length > 0) ?? "";
  return line.length > MAX_SUMMARY ? `${line.slice(0, MAX_SUMMARY - 1)}…` : line;
}

/**
 * Collapses flag lines to one line per node. The node's flag types and distinct messages are joined,
 * so "- §5.1b [CONTRADICTION] a" and "- §5.1b [CONTRADICTION] a" become one line. Other lines are kept in order.
 */
export function groupFlagLines(text: string): string {
  const out: OutputLine[] = [];
  const groups = new Map<string, FlagGroup>();
  for (const line of text.split("\n")) {
    const match = FLAG_LINE.exec(line);
    if (!match) {
      out.push({ kind: "text", text: line });
      continue;
    }
    const coord = match[1] ?? "";
    const type = match[2] ?? "";
    const message = match[3] ?? "";
    let group = groups.get(coord);
    if (group === undefined) {
      group = { types: [], messages: [] };
      groups.set(coord, group);
      out.push({ kind: "group", coord, group });
    }
    if (!group.types.includes(type)) group.types.push(type);
    if (!group.messages.includes(message)) group.messages.push(message);
  }
  return out
    .map((item) =>
      item.kind === "text"
        ? item.text
        : `- ${item.coord} [${item.group.types.join(", ")}] ${item.group.messages.join(" · ")}`,
    )
    .join("\n");
}

/**
 * The body as the log shows it: no "### " section markers, no line that repeats the entry's error
 * (the summary shows the error once), and one line per flagged node.
 */
export function formatLogBody(entry: LogEntry): string {
  const own = `### ${entry.title}\n`;
  const rest = entry.body.startsWith(own) ? entry.body.slice(own.length) : entry.body;
  const errorLine = entry.error === undefined ? null : `ERROR: ${entry.error}`;
  const lines = rest
    .split("\n")
    .filter((line) => line !== errorLine)
    .map((line) => line.replace(SECTION_MARK, ""));
  return groupFlagLines(lines.join("\n")).replace(/\s+$/, "");
}

/**
 * One line for the collapsed log entry. An error shows its message. A body with flags shows the flag
 * count and node count. Any other body shows its first line.
 */
export function summarizeLogEntry(entry: LogEntry): string {
  if (entry.error !== undefined) return `error: ${firstLine(entry.error)}`;
  const flagNodes = new Set<string>();
  let flags = 0;
  for (const line of entry.body.split("\n")) {
    const match = FLAG_LINE.exec(line);
    if (!match) continue;
    flags += 1;
    flagNodes.add(match[1] ?? "");
  }
  if (flags > 0) return `${plural(flags, "flag")} on ${plural(flagNodes.size, "node")}`;
  const text = firstLine(formatLogBody(entry));
  return text.length > 0 ? text : "no output";
}
