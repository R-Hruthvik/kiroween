import type { CommandContext, CommandHandler, DocumentTree, LevelClip, ReviewMarks, RunOptions, ViewSpecCode } from "../types.js";
import { commit, createHistory, redo, replacePresent, undo, type History } from "../history/stack.js";
import { formatCommand, parseCommand, splitPipeline } from "./tokenizer.js";
import type { ParsedCommand } from "../types.js";

export type ControlOp = "undo" | "redo" | "clearLog" | "history";

export interface CommandEntry {
  readonly token: string;
  readonly mutatesTree: boolean;
  readonly scope: string;
  readonly description: string;
  /** What the argument means, for Help.Show, for example "one of a, h, f, u, r". Omitted when the command takes none. */
  readonly argument?: string;
  /** A working example token for Help.Show, for example "View.Spec(u)". Defaults to the bare token. */
  readonly example?: string;
  readonly handler?: CommandHandler;
  /** History and log commands are handled by the dispatcher because they need state the handler cannot see. */
  readonly control?: ControlOp;
  /** True when the command keeps state only the browser holds, such as review marks. The MCP server does not run it. */
  readonly needsWorkbench?: boolean;
}

export type CommandRegistry = ReadonlyMap<string, CommandEntry>;

export function createRegistry(entries: readonly CommandEntry[]): CommandRegistry {
  const map = new Map<string, CommandEntry>();
  for (const entry of entries) {
    if (map.has(entry.token)) throw new Error(`Duplicate command token: ${entry.token}`);
    map.set(entry.token, entry);
  }
  return map;
}

export interface LogEntry {
  readonly title: string;
  readonly body: string;
  readonly error?: string;
}

export interface WorkbenchState {
  readonly history: History<DocumentTree>;
  readonly activeViewSpec: ViewSpecCode;
  /** View.Level clip. Undefined means every level is shown. */
  readonly activeLevel?: LevelClip;
  /** View.Brief sentence count. Undefined means the brief is off. */
  readonly activeBrief?: number;
  readonly selectedNodeIds: readonly string[];
  readonly selectedText: string;
  /** Review marks by § address. Kept beside the history, so undo never touches them and the text never changes. */
  readonly reviews: ReviewMarks;
  /** Core commands that ran without error this session, one per entry, in the Module.Action(arg) form. System.History lists them. */
  readonly commandHistory: readonly string[];
  readonly log: readonly LogEntry[];
  readonly welcome: LogEntry;
}

export const WELCOME_ENTRY: LogEntry = {
  title: "Augeron",
  body:
    "Augeron reads a spec by § address and treats command text as live controls. " +
    "Middle-click or Ctrl/Cmd-click any command in the pad on the right to run it.",
};

export function createWorkbenchState(tree: DocumentTree): WorkbenchState {
  return {
    history: createHistory(tree),
    activeViewSpec: "a",
    selectedNodeIds: [],
    selectedText: "",
    reviews: {},
    commandHistory: [],
    log: [WELCOME_ENTRY],
    welcome: WELCOME_ENTRY,
  };
}

interface StageResult {
  state: WorkbenchState;
  section: string;
  error?: string;
}

async function runStage(
  state: WorkbenchState,
  command: ParsedCommand,
  entry: CommandEntry,
  padText: string | undefined,
): Promise<StageResult> {
  const title = formatCommand(command);

  if (entry.control === "history") {
    const body =
      state.commandHistory.length === 0 ? "No commands have run this session." : state.commandHistory.join("\n");
    return { state, section: `### ${title}\n${body}` };
  }

  if (entry.control === "undo" || entry.control === "redo") {
    const history = entry.control === "undo" ? undo(state.history) : redo(state.history);
    const changed = history !== state.history;
    const message =
      changed
        ? entry.control === "undo"
          ? "Restored the previous snapshot."
          : "Reapplied the undone snapshot."
        : entry.control === "undo"
          ? "Nothing to undo."
          : "Nothing to redo.";
    return { state: { ...state, history }, section: `### ${title}\n${message}` };
  }

  if (entry.control === "clearLog") {
    return {
      state: { ...state, log: [state.welcome] },
      section: `### ${title}\nLog cleared. Welcome block kept.`,
    };
  }

  if (!entry.handler) {
    const error = `${entry.token} has no handler.`;
    return { state, section: `### ${title}\nERROR: ${error}`, error };
  }

  const ctx: CommandContext = {
    tree: state.history.present,
    selectedNodeIds: [...state.selectedNodeIds],
    selectedText: state.selectedText,
    activeViewSpec: state.activeViewSpec,
    activeLevel: state.activeLevel,
    activeBrief: state.activeBrief,
    reviews: state.reviews,
    padText,
  };
  const outcome = await entry.handler(ctx, command.arg);

  if (outcome.error) {
    return {
      state,
      section: `### ${outcome.logTitle}\nERROR: ${outcome.error}`,
      error: outcome.error,
    };
  }

  const history = outcome.mutated
    ? commit(state.history, outcome.updatedTree)
    : replacePresent(state.history, outcome.updatedTree);

  return {
    state: {
      ...state,
      history,
      activeViewSpec: outcome.nextViewSpec ?? state.activeViewSpec,
      activeLevel: outcome.nextLevel === undefined ? state.activeLevel : (outcome.nextLevel ?? undefined),
      activeBrief: outcome.nextBrief === undefined ? state.activeBrief : (outcome.nextBrief ?? undefined),
      reviews: outcome.nextReviews ?? state.reviews,
    },
    section: `### ${outcome.logTitle}\n${outcome.logBody}`,
  };
}

/**
 * Returns the normalized pipeline when `line` is two or more registered commands joined by "->",
 * otherwise null. Prose that happens to contain "->", or a chain with an unregistered stage, is not
 * a pipeline, so callers can fall back to running a single token.
 */
export function asPipeline(line: string, registry: CommandRegistry): string | null {
  const stages = splitPipeline(line);
  if (stages.length < 2) return null;
  for (const stage of stages) {
    const command = parseCommand(stage);
    if (!command || !registry.has(`${command.module}.${command.action}`)) return null;
  }
  return stages.join(" -> ");
}

/**
 * The first problem with a line's stages, or the resolved stages when every stage is a registered command.
 * Nothing runs from this check, so callers can use it to refuse a whole line before any stage runs.
 */
export function checkPipeline(
  line: string,
  registry: CommandRegistry,
): { error: string } | { stages: { command: ParsedCommand; entry: CommandEntry }[] } {
  const stages: { command: ParsedCommand; entry: CommandEntry }[] = [];
  for (const stage of splitPipeline(line)) {
    const command = parseCommand(stage);
    if (!command) return { error: `Not a command token: "${stage}"` };
    const token = `${command.module}.${command.action}`;
    const entry = registry.get(token);
    if (!entry) return { error: `Unknown command: ${token}` };
    stages.push({ command, entry });
  }
  return { stages };
}

/** The message for a line with a bad stage, or null when every stage is a registered command. */
export function pipelineError(line: string, registry: CommandRegistry): string | null {
  const checked = checkPipeline(line, registry);
  return "error" in checked ? checked.error : null;
}

/**
 * Runs one line of Oberon text, which may hold a "->" pipeline.
 * Every stage is validated before any stage runs. Stages run left to right, and the first error stops the chain.
 * Output goes to one combined log entry.
 */
export async function runLine(
  state: WorkbenchState,
  line: string,
  registry: CommandRegistry,
  options: RunOptions = {},
): Promise<WorkbenchState> {
  const checked = checkPipeline(line, registry);
  if ("error" in checked) {
    return { ...state, log: [...state.log, { title: line.trim(), body: "", error: checked.error }] };
  }
  const { stages } = checked;

  let current = state;
  const sections: string[] = [];
  let error: string | undefined;
  for (const { command, entry } of stages) {
    const result = await runStage(current, command, entry, options.padText);
    current = result.state;
    sections.push(result.section);
    if (result.error) {
      error = result.error;
      break;
    }
    // Only core commands that succeed are recorded. System.History is not, so it never lists itself.
    if (entry.control !== "history") {
      current = { ...current, commandHistory: [...current.commandHistory, formatCommand(command)] };
    }
  }

  const combined: LogEntry = error
    ? { title: line.trim(), body: sections.join("\n\n"), error }
    : { title: line.trim(), body: sections.join("\n\n") };
  return { ...current, log: [...current.log, combined] };
}
