// Tool.Check: a static check of System.Tool text. It parses every line and names the command each stage runs.
import type { ToolCheckLine, ToolCheckReport, ToolCheckStage } from "../types.js";
import type { CommandRegistry } from "./registry.js";
import { formatCommand, parseCommand, scanCommandTokens, splitPipeline } from "./tokenizer.js";

/**
 * Tokens that only the browser runs (see packages/web/src/state/useWorkbenchStore.ts). The pad may name
 * them, so Tool.Check accepts them. Mutation follows the code: Edit.Done replaces the tree, Edit.Source only opens the editor.
 */
export const BROWSER_TOKENS: readonly { token: string; mutatesTree: boolean }[] = [
  { token: "Doc.Load", mutatesTree: true },
  { token: "Edit.Source", mutatesTree: false },
  { token: "Edit.Done", mutatesTree: true },
  { token: "AI.Config", mutatesTree: false },
  { token: "View.Theme", mutatesTree: false },
  { token: "Audio.On", mutatesTree: false },
  { token: "Audio.Off", mutatesTree: false },
  { token: "System.Veil", mutatesTree: false },
  { token: "Exhume.Workbench", mutatesTree: false },
];

const BROWSER_SCOPE = "Browser only";

/** Checks one stage: the text between "->" marks, or one token. `text` must already be trimmed. */
function checkStage(text: string, registry: CommandRegistry): ToolCheckStage {
  const command = parseCommand(text);
  if (command === null) {
    const error = text === "" ? "Empty stage around \"->\"." : `Not a command token: "${text}".`;
    return { token: text, reads: null, mutates: false, error };
  }
  const name = `${command.module}.${command.action}`;
  const token = formatCommand(command);
  const entry = registry.get(name);
  if (entry !== undefined) {
    return { token, reads: entry.scope, mutates: entry.mutatesTree, error: null };
  }
  const browser = BROWSER_TOKENS.find((candidate) => candidate.token === name);
  if (browser !== undefined) {
    return { token, reads: BROWSER_SCOPE, mutates: browser.mutatesTree, error: null };
  }
  return { token, reads: null, mutates: false, error: `Unknown command: ${name}.` };
}

/** Checks one pad line. A line with "->" is one pipeline. Any other line is a list of tokens. */
function checkLine(lineNumber: number, text: string, registry: CommandRegistry): ToolCheckLine {
  const pipeline = text.includes("->");
  const stages: ToolCheckStage[] = [];
  let error: string | null = null;
  if (pipeline) {
    for (const stage of splitPipeline(text)) stages.push(checkStage(stage, registry));
  } else {
    const tokens = scanCommandTokens(text);
    if (tokens.length === 0) {
      error = "No command on this line.";
    }
    for (const token of tokens) {
      const stage = checkStage(token.raw, registry);
      // scanCommandTokens stops before "(" when the ")" is missing, so an open paren after a token is an error.
      const unclosed = text.charAt(token.end) === "(";
      stages.push(unclosed ? { ...stage, error: `Missing ")" after ${token.raw}.` } : stage);
    }
  }
  const mutates = stages.some((stage) => stage.error === null && stage.mutates);
  return { lineNumber, text, stages, error, mutates };
}

/**
 * Checks every line of System.Tool text. Blank lines and "#" group headings are skipped, and line
 * numbers count every line, so they match the editor. Nothing runs.
 */
export function checkToolText(text: string, registry: CommandRegistry): ToolCheckReport {
  const lines: ToolCheckLine[] = [];
  text.split("\n").forEach((raw, index) => {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;
    lines.push(checkLine(index + 1, trimmed, registry));
  });
  const errorLines = lines.filter(
    (line) => line.error !== null || line.stages.some((stage) => stage.error !== null),
  ).length;
  return { lines, errorLines };
}

/**
 * The log text for a Tool.Check report. The first line is the summary. Each checked line follows, with
 * one row per stage: what it reads and whether it mutates the tree. Problems are shown with their line number.
 */
export function renderToolCheck(report: ToolCheckReport): string {
  const mutating = report.lines.filter((line) => line.mutates).map((line) => line.lineNumber);
  const summary =
    report.errorLines === 0
      ? `All ${report.lines.length} checked lines parse and name known commands.`
      : `${report.errorLines} of ${report.lines.length} checked lines have a problem. A pipeline with a bad stage runs nothing.`;
  const changes =
    mutating.length === 0 ? "No line changes the document tree." : `Lines that change the document tree: ${mutating.join(", ")}.`;
  const body = report.lines.flatMap((line) => {
    const head = `Line ${line.lineNumber}: ${line.text}`;
    if (line.error !== null) return [head, `  ERROR line ${line.lineNumber}: ${line.error}`];
    const rows = line.stages.map((stage) =>
      stage.error !== null
        ? `  ERROR line ${line.lineNumber}: ${stage.error}`
        : `  ${stage.token} reads ${stage.reads ?? "nothing"}. Mutates tree: ${stage.mutates ? "yes" : "no"}.`,
    );
    return [head, ...rows];
  });
  return [summary, changes, "", ...body].join("\n");
}
