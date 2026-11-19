import { useSyncExternalStore } from "react";
import {
  BUILTIN_REGISTRY,
  commit,
  coordinatesMentioned,
  createWorkbenchState,
  flattenNodes,
  parseDocument,
  rebuildDocument,
  runLine,
  serializeTree,
  splitPipeline,
  type DocumentTree,
  type LogEntry,
  type WorkbenchState,
} from "@augeron/core";
import { FIXTURES, isFixtureName } from "../fixtures";
import { isLlmConfigured, llmEndpoint, reviewAudit, setLlmKey } from "../adapters/optionalLlmAdapter";

const STORAGE_KEY = "augeron.workbench.v1";
const HIGHLIGHT_MS = 1200;
const UI_ONLY_ACTIONS = new Set(["Edit.Source", "Edit.Done"]);
const LOAD_TOKEN = /^Doc\.Load\(([^)]*)\)$/;
const CONFIG_TOKEN = /^AI\.Config\(([^)]*)\)$/;
const CONFIG_ARG = /AI\.Config\([^)]*\)/g;

export interface Pulse {
  /** Coordinate of the primary target node, or null when nothing is selected. */
  source: string | null;
  /** DOM id of the invoked command token, used for pulse targeting. */
  commandId: string | null;
  /** Coordinates that the command output mentions. */
  affected: string[];
  nonce: number;
}

export interface UiState {
  wb: WorkbenchState;
  /** Coordinate pinned in the split companion pane, or null when closed. */
  splitCoord: string | null;
  /** True while the Document Track shows raw Markdown. */
  sourceEdit: boolean;
  /** Raw Markdown in the editor while sourceEdit is true. */
  sourceDraft: string;
  /** Text of the System.Tool pad. */
  toolText: string;
  pulse: Pulse | null;
  /** Coordinates highlighted after a command. Cleared after HIGHLIGHT_MS. */
  highlight: ReadonlySet<string>;
}

const EMPTY_HIGHLIGHT: ReadonlySet<string> = new Set<string>();

/** Time each log entry was added, keyed by the entry object. Not persisted. */
export const loggedAt = new WeakMap<LogEntry, number>();

export const DEFAULT_TOOL_TEXT = [
  "View.Spec(a)  View.Spec(h)  View.Spec(f)  View.Spec(u)  View.Spec(r)",
  "Spec.Audit",
  "Spec.Tighten",
  "Cite.Verify",
  "Outline.ExtractTasks",
  "Spec.Audit -> Outline.ExtractTasks",
  "Cite.Verify -> View.Spec(u)",
  "Doc.InjectFlaw -> Spec.Audit -> Outline.ExtractTasks",
  "Doc.Load(rfc)  Doc.Load(brief)  Doc.Load(prd)",
  "System.Undo  System.Redo  System.Export  System.ClearLog",
].join("\n");

interface Persisted {
  markdown: string;
  toolText: string;
}

function readPersisted(): Persisted | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "markdown" in parsed &&
      "toolText" in parsed &&
      typeof parsed.markdown === "string" &&
      typeof parsed.toolText === "string"
    ) {
      return { markdown: parsed.markdown, toolText: parsed.toolText };
    }
    return null;
  } catch {
    return null;
  }
}

function persist(state: UiState): void {
  const payload: Persisted = {
    markdown: serializeTree(state.wb.history.present),
    // A key typed into AI.Config must not be written to localStorage.
    toolText: state.toolText.replace(CONFIG_ARG, "AI.Config()"),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be full or blocked. The session keeps working without persistence.
  }
}

function initialState(): UiState {
  const saved = readPersisted();
  const tree: DocumentTree = parseDocument(saved?.markdown ?? FIXTURES.rfc.markdown);
  const wb = createWorkbenchState(tree);
  return {
    wb,
    splitCoord: null,
    sourceEdit: false,
    sourceDraft: "",
    toolText: saved?.toolText ?? DEFAULT_TOOL_TEXT,
    pulse: null,
    highlight: EMPTY_HIGHLIGHT,
  };
}

let state: UiState = initialState();
const listeners = new Set<() => void>();

export function getState(): UiState {
  return state;
}

function setState(patch: Partial<UiState>): void {
  state = { ...state, ...patch };
  persist(state);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribes a component to a slice of the store. The selector must return stable values. */
export function useWorkbench<T>(selector: (s: UiState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export function coordOfNodeId(tree: DocumentTree, nodeId: string): string | null {
  return flattenNodes(tree).find((node) => node.id === nodeId)?.coordinate ?? null;
}

/** Coordinates in text that exist in the document. The scan lives in core. */
export function coordsIn(text: string, tree: DocumentTree): string[] {
  return coordinatesMentioned(text, tree.indexByCoord);
}

export function appendLog(entry: LogEntry): void {
  loggedAt.set(entry, Date.now());
  setState({ wb: { ...state.wb, log: [...state.wb.log, entry] } });
}

/** Sets the active selection. Called from the Document Track on mouseup and keyup, never from System.Tool. */
export function setSelection(nodeIds: string[], selectedText: string): void {
  const wb = state.wb;
  const same =
    wb.selectedText === selectedText &&
    wb.selectedNodeIds.length === nodeIds.length &&
    wb.selectedNodeIds.every((id, i) => id === nodeIds[i]);
  if (same) return;
  setState({ wb: { ...wb, selectedNodeIds: nodeIds, selectedText } });
}

export function setToolText(text: string): void {
  setState({ toolText: text });
}

export function openSplit(coord: string): void {
  if (!Object.hasOwn(state.wb.history.present.indexByCoord, coord)) {
    appendLog({
      title: "BROKEN_REF",
      body: `${coord} is not in this document's coordinate index.`,
      error: `${coord} does not resolve.`,
    });
    return;
  }
  setState({ splitCoord: coord });
}

export function closeSplit(): void {
  setState({ splitCoord: null });
}

export function startSourceEdit(): void {
  setState({
    sourceEdit: true,
    sourceDraft: serializeTree(state.wb.history.present),
  });
}

export function setSourceDraft(text: string): void {
  setState({ sourceDraft: text });
}

/** Re-parses the edited Markdown through core and records one history snapshot. */
export function finishSourceEdit(): void {
  if (!state.sourceEdit) return;
  const next = rebuildDocument(state.wb.history.present, state.sourceDraft);
  const wb: WorkbenchState = { ...state.wb, history: commit(state.wb.history, next) };
  const entry: LogEntry = {
    title: "Edit.Done",
    body: `Re-parsed ${flattenNodes(next).length} node(s).`,
  };
  loggedAt.set(entry, Date.now());
  setState({
    wb: { ...wb, log: [...wb.log, entry] },
    sourceEdit: false,
    sourceDraft: "",
    splitCoord: null,
  });
}

export function cancelSourceEdit(): void {
  setState({ sourceEdit: false, sourceDraft: "" });
}

function primaryTargetCoord(wb: WorkbenchState): string | null {
  const first = wb.selectedNodeIds[0];
  return first ? coordOfNodeId(wb.history.present, first) : null;
}

let queue: Promise<void> = Promise.resolve();
let highlightTimer: ReturnType<typeof setTimeout> | undefined;
let nonce = 0;

function stamp(entry: LogEntry): LogEntry {
  loggedAt.set(entry, Date.now());
  return entry;
}

/** Replaces the document with a showcase fixture. This is one history snapshot, so System.Undo restores the previous text. */
function loadFixture(arg: string): void {
  const title = `Doc.Load(${arg})`;
  if (!isFixtureName(arg)) {
    appendLog({ title, body: "", error: `Doc.Load expects rfc, brief, or prd. Got "${arg}".` });
    return;
  }
  const fixture = FIXTURES[arg];
  const tree = parseDocument(fixture.markdown);
  const wb = state.wb;
  const entry = stamp({
    title,
    body: `${fixture.title}. ${flattenNodes(tree).length} node(s) loaded. System.Undo restores the previous document.`,
  });
  setState({
    wb: {
      ...wb,
      history: commit(wb.history, tree),
      selectedNodeIds: [],
      selectedText: "",
      log: [...wb.log, entry],
    },
    splitCoord: null,
    sourceEdit: false,
    sourceDraft: "",
    highlight: EMPTY_HIGHLIGHT,
  });
}

/** Sets or clears the BYOK key. The key is never placed in the log, and the log title omits it. */
function configureAi(arg: string): void {
  setLlmKey(arg);
  const body = isLlmConfigured()
    ? `AI review is on for this session. Spec.Audit will send the document to ${llmEndpoint() ?? "the configured endpoint"}. The key is kept in memory only, so a reload clears it.`
    : "AI review is off. Deterministic analyzers only.";
  appendLog(stamp({ title: "AI.Config", body }));
}

/** Adds the advisory review after a Spec.Audit run. The deterministic flags are already in the log. */
async function appendAiReview(markdown: string, report: string): Promise<void> {
  const result = await reviewAudit(markdown, report);
  const body = result.ok
    ? `Advisory only. The flags above are unchanged.\n\n${result.text}`
    : result.reason;
  appendLog(stamp({ title: "AI.Review", body }));
}

/**
 * Runs one Oberon line through core. Runs are queued, so overlapping clicks execute in order.
 * sourceCoord is the coordinate that was clicked, and commandId is the DOM id of the token.
 */
export function dispatchLine(line: string, options: { commandId?: string; sourceCoord?: string } = {}): Promise<void> {
  const trimmed = line.trim();
  if (UI_ONLY_ACTIONS.has(trimmed)) {
    if (trimmed === "Edit.Source") startSourceEdit();
    if (trimmed === "Edit.Done") finishSourceEdit();
    return Promise.resolve();
  }
  const load = LOAD_TOKEN.exec(trimmed);
  if (load) {
    const arg = (load[1] ?? "").trim();
    queue = queue.then(() => loadFixture(arg));
    return queue;
  }
  const config = CONFIG_TOKEN.exec(trimmed);
  if (config) {
    const arg = (config[1] ?? "").trim();
    queue = queue.then(() => configureAi(arg));
    return queue;
  }
  queue = queue.then(async () => {
    const before = state.wb;
    const next = await runLine(before, trimmed, BUILTIN_REGISTRY);
    const entry = next.log.at(-1);
    if (entry) loggedAt.set(entry, Date.now());
    const auditRan = splitPipeline(trimmed).includes("Spec.Audit");
    if (auditRan && entry && !entry.error && isLlmConfigured()) {
      void appendAiReview(serializeTree(next.history.present), entry.body);
    }
    const affected = entry ? coordsIn(entry.body, next.history.present) : [];
    nonce += 1;
    const source = options.sourceCoord ?? primaryTargetCoord(next);
    setState({
      wb: next,
      pulse: {
        source,
        commandId: options.commandId ?? null,
        affected,
        nonce,
      },
      highlight: affected.length > 0 ? new Set(affected) : state.highlight,
    });
    if (affected.length > 0) {
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(() => setState({ highlight: EMPTY_HIGHLIGHT }), HIGHLIGHT_MS);
    }
  });
  return queue;
}

/** Returns the full text line that contains position `index` in `text`. */
export function lineAt(text: string, index: number): string {
  const start = text.lastIndexOf("\n", index - 1) + 1;
  const end = text.indexOf("\n", index);
  return text.slice(start, end === -1 ? text.length : end);
}
