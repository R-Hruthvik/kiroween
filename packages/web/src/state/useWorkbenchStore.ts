import { useSyncExternalStore } from "react";
import {
  BUILTIN_REGISTRY,
  applyFlags,
  commit,
  computeAuditFlags,
  coordinatesMentioned,
  createWorkbenchState,
  flattenNodes,
  parseDocument,
  buildAuditedExport,
  rebuildDocument,
  replacePresent,
  runLine,
  serializeTree,
  splitPipeline,
  type DocumentTree,
  type LogEntry,
  type ReviewMarks,
  type WorkbenchState,
} from "@augeron/core";
import { FIXTURES, isFixtureName } from "../fixtures";
import { isLlmConfigured, llmEndpoint, reviewAudit, setLlmKey } from "../adapters/optionalLlmAdapter";
import { THEMES, applyTheme, isThemeName, savedTheme, type ThemeName } from "../theme";
import { playCue, setAudioEnabled, type Cue } from "../audio/soundscape";

const STORAGE_KEY = "augeron.workbench.v1";
const HIGHLIGHT_MS = 1200;
const UI_ONLY_ACTIONS = new Set(["Edit.Source", "Edit.Done"]);
/** Commands the web layer handles itself, outside the core registry. */
const WEB_ONLY_TOKENS = [
  "Doc.Load",
  "AI.Config",
  "Edit.Source",
  "Edit.Done",
  "View.Theme",
  "Exhume.Workbench",
  "System.Veil",
  "Audio.On",
  "Audio.Off",
] as const;
const VEIL_KEY = "augeron.veil.seen";
const RUNNABLE_TOKENS: ReadonlySet<string> = new Set([...BUILTIN_REGISTRY.keys(), ...WEB_ONLY_TOKENS]);

/** True when `Module.Action` names a command that can actually run, so other text never renders as a button. */
export function isRunnableToken(moduleAction: string): boolean {
  return RUNNABLE_TOKENS.has(moduleAction);
}
const LOAD_TOKEN = /^Doc\.Load\(([^)]*)\)$/;
const CONFIG_TOKEN = /^AI\.Config\(([^)]*)\)$/;
const CONFIG_ARG = /AI\.Config\([^)]*\)/g;
const THEME_TOKEN = /^View\.Theme\(([^)]*)\)$/;
export const EXPORT_FILENAME = "augeron-audited-spec.md";

/** Pulse color: crimson for injected flaws or contradictions, teal for rewrites, amber otherwise. */
export type PulseTone = "default" | "danger" | "tighten";

export interface Pulse {
  /** Coordinate of the primary target node, or null when nothing is selected. */
  source: string | null;
  /** DOM id of the invoked command token, used for pulse targeting. */
  commandId: string | null;
  /** Coordinates that the command output mentions. */
  affected: string[];
  tone: PulseTone;
  /** Pipeline stages of the command that produced this pulse, e.g. ["Spec.Audit"]. */
  stages: string[];
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
  /**
   * True once Spec.Audit has run on the current document. While true, text-changing commands
   * re-apply the audit so flag strips do not silently disappear. Doc.Load resets it.
   */
  auditActive: boolean;
  /** Coordinates highlighted after a command. Cleared after HIGHLIGHT_MS. */
  highlight: ReadonlySet<string>;
  /** Pulse nonce of the last successful Spec.Audit run. Each run replays the flag drop-in. */
  auditNonce: number;
  /** True while the Threshold Veil entry chamber covers the workbench. */
  veilOpen: boolean;
  /** True when procedural WebAudio cues are on. Off by default and never persisted. */
  audioOn: boolean;
  /** The active theme. Set by View.Theme(name), and by the saved choice on load. */
  theme: ThemeName;
}

const EMPTY_HIGHLIGHT: ReadonlySet<string> = new Set<string>();

/** Time each log entry was added, keyed by the entry object. Not persisted. */
export const loggedAt = new WeakMap<LogEntry, number>();

/**
 * Every pad text shipped before the grouped layout. A saved pad equal to one of them was never
 * edited, so it is upgraded to the new default. An edited pad is kept as is.
 */
const CORE_PAD = [
  "Spec.Audit",
  "Spec.Tighten",
  "Cite.Verify",
  "Outline.ExtractTasks",
  "Spec.Audit -> Outline.ExtractTasks",
  "Cite.Verify -> View.Spec(u)",
  "Doc.InjectFlaw -> Spec.Audit -> Outline.ExtractTasks",
];
const VIEWS = "View.Spec(a)  View.Spec(h)  View.Spec(f)  View.Spec(u)  View.Spec(r)";
const LOADS = "Doc.Load(rfc)  Doc.Load(brief)  Doc.Load(prd)";
const THEMES_LINE = "View.Theme(light)  View.Theme(dark)";
const SYSTEM = "System.Undo  System.Redo  System.Export  System.ClearLog";
/** The default pad before Find.Look, Link.Back, Help.Show, Tool.Check, and System.History were added. */
const PREVIOUS_DEFAULT_TOOL_TEXT = [
  "# X-RAY VIEWS",
  "View.Spec(a)  View.Spec(h)  View.Spec(f)  View.Spec(u)  View.Spec(r)",
  "View.Level(1)  View.Level(2)",
  "View.Brief(2)",
  "Cite.Verify -> View.Spec(u)",
  "",
  "# DISSECT & REFINE",
  "Spec.Audit  Spec.Tighten  Cite.Verify  Outline.ExtractTasks  Spec.Ledger",
  "Spec.Audit -> Outline.ExtractTasks",
  "Doc.InjectFlaw -> Spec.Audit -> Outline.ExtractTasks",
  "",
  "# ARCHIVE & REALM",
  "Doc.Load(rfc)  Doc.Load(brief)  Doc.Load(prd)",
  "System.Undo  System.Redo  System.Export  System.ClearLog",
  "View.Theme(exhumed)  View.Theme(paper)",
  "Audio.On  Audio.Off  System.Veil",
].join("\n");
/** The default pad before the grouped, annotated layout. A saved pad equal to it is upgraded. */
const PRE_REDESIGN_TOOL_TEXT = [
  "# X-RAY VIEWS",
  "View.Spec(a)  View.Spec(h)  View.Spec(f)  View.Spec(u)  View.Spec(r)",
  "View.Level(1)  View.Level(2)",
  "View.Brief(2)",
  "Cite.Verify -> View.Spec(u)",
  "",
  "# DISSECT & REFINE",
  "Spec.Audit  Spec.Tighten  Cite.Verify  Outline.ExtractTasks  Spec.Ledger",
  "Spec.Audit -> Outline.ExtractTasks",
  "Doc.InjectFlaw -> Spec.Audit -> Outline.ExtractTasks",
  "",
  "# FIND & TRACE",
  "Find.Look(retention)  Link.Back(§4.3a)  Help.Show(Find.Look)",
  "",
  "# CHECK & HISTORY",
  "Tool.Check  System.History",
  "",
  "# ARCHIVE & REALM",
  "Doc.Load(rfc)  Doc.Load(brief)  Doc.Load(prd)",
  "System.Undo  System.Redo  System.Export  System.ClearLog",
  "View.Theme(exhumed)  View.Theme(paper)",
  "Audio.On  Audio.Off  System.Veil",
].join("\n");

/**
 * The default pad. Lines starting with "#" are group headings, named by what the command does. A line of
 * one command followed by two spaces and a note shows the note in lead colour. Neither headings nor notes hold live tokens.
 */
const DEFAULT_TOOL_LINES = [
  "# Start here",
  "Spec.Audit  check this document for contradictions, broken references and vague terms",
  "View.Brief(2)  the two key sentences of each section, with their addresses",
  "Doc.Load(brief)  load a different sample. Your text stays in System.Undo.",
  "",
  "# Read, changes no text",
  "View.Spec(a)  the full document",
  "View.Spec(h)  headings only",
  "View.Spec(f)  first sentence of each paragraph, plus flagged sentences",
  "View.Spec(u)  claims and assumptions with no citation",
  "View.Spec(r)  requirements and flagged paragraphs",
  "Find.Look(retention)  paragraphs that contain a word, with their addresses",
  "Link.Back(§4.3a)  paragraphs that refer to one address",
  "Spec.Ledger  every sentence with a modal keyword",
  "Help.Show  list every command",
  "",
  "# Check",
  "Cite.Verify  check § references and citations",
  "Outline.ExtractTasks  turn SHALL and MUST paragraphs into a task list",
  "Tool.Check  check every line of this pad",
  "",
  "# Change text, undoable",
  "Spec.Tighten  strip filler and rewrite passive phrasing as EARS",
  "Doc.InjectFlaw  demo: add a conflict and a broken reference",
  "System.Undo  restore the previous text",
  "System.Redo  reapply the text you undid",
  "",
  "# History and files",
  "System.History  list the commands run this session",
  "System.Export  download the audited Markdown",
  "System.ClearLog  clear System.Log",
  "View.Theme(light)  light sheet, the default",
  "View.Theme(dark)  night sheet",
  "View.Theme(halloween)  night sheet with moonlit ink and pumpkin redline",
  "Audio.On  soundscape on",
  "Audio.Off  soundscape off",
  "System.Veil  return to the entry page",
];

export const DEFAULT_TOOL_TEXT = DEFAULT_TOOL_LINES.join("\n");
/** The default pad before the halloween theme. A saved pad equal to it is upgraded to the new default. */
const BEFORE_HALLOWEEN_TOOL_TEXT = DEFAULT_TOOL_LINES.filter((line) => !line.startsWith("View.Theme(halloween)")).join("\n");

const LEGACY_TOOL_TEXTS: ReadonlySet<string> = new Set([
  ...[
    [VIEWS, ...CORE_PAD, SYSTEM],
    [VIEWS, ...CORE_PAD, LOADS, SYSTEM],
    [VIEWS, ...CORE_PAD, LOADS, THEMES_LINE, SYSTEM],
    [VIEWS, "View.Level(1)  View.Level(2)", ...CORE_PAD, LOADS, THEMES_LINE, SYSTEM],
  ].map((lines) => lines.join("\n")),
  PREVIOUS_DEFAULT_TOOL_TEXT,
  PRE_REDESIGN_TOOL_TEXT,
  BEFORE_HALLOWEEN_TOOL_TEXT,
]);


interface Persisted {
  markdown: string;
  toolText: string;
  /** Review marks by § address. Missing in state saved before Review.Mark existed. */
  reviews: ReviewMarks;
}

/** Keeps only well-formed entries: a § address mapped to a fingerprint string. Anything else is dropped. */
function readReviews(value: unknown): ReviewMarks {
  if (typeof value !== "object" || value === null) return {};
  const marks: Record<string, string> = {};
  for (const [coord, print] of Object.entries(value)) {
    if (coord.startsWith("§") && typeof print === "string") marks[coord] = print;
  }
  return marks;
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
      const reviews = "reviews" in parsed ? readReviews(parsed.reviews) : {};
      return { markdown: parsed.markdown, toolText: parsed.toolText, reviews };
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
    reviews: state.wb.reviews,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be full or blocked. The session keeps working without persistence.
  }
}

function veilSeen(): boolean {
  try {
    return window.sessionStorage.getItem(VEIL_KEY) === "1";
  } catch {
    return false;
  }
}

function initialState(): UiState {
  const saved = readPersisted();
  const tree: DocumentTree = parseDocument(saved?.markdown ?? FIXTURES.rfc.markdown);
  // Review marks come from localStorage, not from the document, so they survive a reload and never touch rawText.
  const wb: WorkbenchState = { ...createWorkbenchState(tree), reviews: saved?.reviews ?? {} };
  return {
    wb,
    splitCoord: null,
    sourceEdit: false,
    sourceDraft: "",
    toolText:
      saved === null || LEGACY_TOOL_TEXTS.has(saved.toolText)
        ? DEFAULT_TOOL_TEXT
        : saved.toolText
            .replaceAll("View.Theme(exhumed)", "View.Theme(dark)")
            .replaceAll("View.Theme(paper)", "View.Theme(light)"),
    pulse: null,
    auditActive: false,
    highlight: EMPTY_HIGHLIGHT,
    auditNonce: 0,
    veilOpen: !veilSeen(),
    audioOn: false,
    theme: savedTheme(),
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

/** Clears the node selection and any browser text selection, so commands act on the full document. */
export function clearSelection(): void {
  window.getSelection()?.removeAllRanges();
  setSelection([], "");
}

/**
 * Node ids are positional, so after a structural change an old id can name a different paragraph.
 * Keeps the selection only when every selected id still sits at the same coordinate.
 */
function revalidateSelection(before: DocumentTree, after: WorkbenchState): WorkbenchState {
  if (after.selectedNodeIds.length === 0) return after;
  const stable = after.selectedNodeIds.every((id) => {
    const was = coordOfNodeId(before, id);
    return was !== null && was === coordOfNodeId(after.history.present, id);
  });
  return stable ? after : { ...after, selectedNodeIds: [], selectedText: "" };
}

/**
 * True when the tree carries flags that only Spec.Audit sets. Parsing sets BROKEN_REF and
 * UNVERIFIED_CLAIM itself, so those don't count. This catches a flagged snapshot that System.Undo
 * restored after Doc.Load reset auditActive.
 */
function hasAuditFlags(tree: DocumentTree): boolean {
  return flattenNodes(tree).some((node) =>
    node.flags.some((flag) => flag.type === "CONTRADICTION" || flag.type === "AMBIGUOUS_TERM"),
  );
}

/** Re-applies the full audit to the present tree without adding a history snapshot. */
function reaudit(history: WorkbenchState["history"]): WorkbenchState["history"] {
  const tree = history.present;
  return replacePresent(history, applyFlags(tree, computeAuditFlags(tree)));
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

/**
 * Re-parses the edited Markdown through core and records one history snapshot.
 * The selection is cleared because re-parsing reassigns positional node ids.
 */
export function finishSourceEdit(): void {
  if (!state.sourceEdit) return;
  const next = rebuildDocument(state.wb.history.present, state.sourceDraft);
  const committed = commit(state.wb.history, next);
  const wb: WorkbenchState = {
    ...state.wb,
    history: state.auditActive || hasAuditFlags(state.wb.history.present) ? reaudit(committed) : committed,
    selectedNodeIds: [],
    selectedText: "",
  };
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

/** Lowers the Threshold Veil over the workbench. */
export function openVeil(): void {
  setState({ veilOpen: true });
}

/** Lifts the veil and remembers it for this browser session. */
export function closeVeil(): void {
  try {
    window.sessionStorage.setItem(VEIL_KEY, "1");
  } catch {
    // Blocked storage only means the veil shows again on the next load.
  }
  if (state.veilOpen) setState({ veilOpen: false });
}

function setAudioCommand(on: boolean): void {
  setAudioEnabled(on);
  setState({ audioOn: on });
  appendLog(
    stamp({
      title: on ? "Audio.On" : "Audio.Off",
      body: on
        ? "Soundscape on. Procedural WebAudio cues for View-Spec switches, contradictions, and Spec.Tighten."
        : "Soundscape off.",
    }),
  );
}

/** One sound per run, strongest first: a contradiction bell, a tighten chime, then a View-Spec whoosh. */
function cueFor(stages: readonly string[], body: string): Cue | null {
  if (body.includes("[CONTRADICTION]") && (stages.includes("Spec.Audit") || stages.includes("Doc.InjectFlaw"))) return "bell";
  if (stages.includes("Spec.Tighten")) return "chime";
  if (stages.some((stage) => stage.startsWith("View.Spec") || stage.startsWith("View.Level"))) return "whoosh";
  return null;
}

function pulseTone(line: string, body: string): PulseTone {
  const stages = splitPipeline(line);
  if (stages.includes("Doc.InjectFlaw") || body.includes("[CONTRADICTION]")) return "danger";
  if (stages.includes("Spec.Tighten")) return "tighten";
  return "default";
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
    auditActive: false,
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

/**
 * Saves the audited Markdown as a browser download. Returns the confirmation entry for System.Log.
 * The Blob is revoked after a short delay so the download can start.
 */
function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Downloads the audited Markdown and returns a short receipt for System.Log. Core's System.Export
 * puts the whole document into the log body; the web log shows this receipt in its place.
 */
function downloadAuditedSpec(tree: DocumentTree): { markdown: string; receipt: string } {
  const exported = buildAuditedExport(tree);
  const url = URL.createObjectURL(new Blob([exported.markdown], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = EXPORT_FILENAME;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const bytes = new TextEncoder().encode(exported.markdown).length;
  return {
    markdown: exported.markdown,
    receipt: [
      `Downloaded ${EXPORT_FILENAME}`,
      `${exported.nodeCount} nodes · ${exported.flagCount} flag rows · ${formatBytes(bytes)}`,
    ].join("\n"),
  };
}

/** Sets the theme by text command. Logs a short confirmation, or an error for an unknown name. */
function setThemeCommand(arg: string): void {
  const title = `View.Theme(${arg})`;
  if (!isThemeName(arg)) {
    appendLog(stamp({ title, body: "", error: `View.Theme expects ${THEMES.join(" or ")}. Got "${arg}".` }));
    return;
  }
  applyTheme(arg);
  setState({ theme: arg });
  appendLog(stamp({ title, body: `Theme: ${arg}. Saved for your next visit.` }));
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
 * The pad after System.History: the current pad, then a "# HISTORY" heading and one command per line.
 * Each line is a token, so it runs again on a click. The document is not touched.
 */
function appendHistoryBlock(pad: string, commands: readonly string[]): string {
  return [pad.replace(/\s+$/, ""), "", "# HISTORY", ...commands].join("\n");
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
  if (trimmed === "Exhume.Workbench") {
    closeVeil();
    return Promise.resolve();
  }
  if (trimmed === "System.Veil") {
    openVeil();
    return Promise.resolve();
  }
  if (trimmed === "Audio.On" || trimmed === "Audio.Off") {
    const on = trimmed === "Audio.On";
    queue = queue.then(() => setAudioCommand(on));
    return queue;
  }
  const load = LOAD_TOKEN.exec(trimmed);
  if (load) {
    const arg = (load[1] ?? "").trim();
    queue = queue.then(() => loadFixture(arg));
    return queue;
  }
  const theme = THEME_TOKEN.exec(trimmed);
  if (theme) {
    const arg = (theme[1] ?? "").trim();
    queue = queue.then(() => setThemeCommand(arg));
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
    let next = await runLine(before, trimmed, BUILTIN_REGISTRY, { padText: state.toolText });
    const entry = next.log.at(-1);
    if (entry) loggedAt.set(entry, Date.now());
    const auditRan = splitPipeline(trimmed).includes("Spec.Audit");
    // A later stage can fail after Spec.Audit already applied its flags, so look for its section.
    const auditApplied = entry !== undefined && entry.body.includes("### Spec.Audit\n");
    const auditActive = state.auditActive || auditApplied || hasAuditFlags(before.history.present);
    const textChanged =
      next.history.present !== before.history.present &&
      serializeTree(next.history.present) !== serializeTree(before.history.present);
    if (auditActive && textChanged) {
      next = { ...next, history: reaudit(next.history) };
    }
    next = revalidateSelection(before.history.present, next);
    if (auditRan && entry && !entry.error && isLlmConfigured()) {
      void appendAiReview(serializeTree(next.history.present), entry.body);
    }
    const stages = splitPipeline(trimmed);
    const exportAt = stages.indexOf("System.Export");
    if (exportAt >= 0 && entry) {
      // Export the tree as it was at the System.Export stage, not after later stages. Core is pure
      // and deterministic, so re-running the stages up to the export reproduces that tree exactly.
      const upTo =
        exportAt === stages.length - 1
          ? next
          : await runLine(before, stages.slice(0, exportAt + 1).join(" -> "), BUILTIN_REGISTRY, { padText: state.toolText });
      const exportEntry = upTo.log.at(-1);
      if (exportEntry && !exportEntry.error) {
        const { markdown, receipt } = downloadAuditedSpec(upTo.history.present);
        const full = `### System.Export\n${markdown}`;
        if (entry.body.includes(full)) {
          const compact = stamp({ ...entry, body: entry.body.replace(full, `### System.Export\n${receipt}`) });
          next = { ...next, log: [...next.log.slice(0, -1), compact] };
        }
      }
    }
    const affected = entry ? coordsIn(entry.body, next.history.present) : [];
    nonce += 1;
    const source = options.sourceCoord ?? primaryTargetCoord(next);
    const finalBody = next.log.at(-1)?.body ?? "";
    const cue = entry && !entry.error ? cueFor(stages, finalBody) : null;
    if (cue) playCue(cue);
    // System.History lists the commands in the log, and this copies them into the pad as clickable lines.
    const appendHistory = stages.includes("System.History") && !entry?.error && before.commandHistory.length > 0;
    setState({
      wb: next,
      auditActive,
      ...(appendHistory ? { toolText: appendHistoryBlock(state.toolText, before.commandHistory) } : {}),
      pulse: {
        source,
        commandId: options.commandId ?? null,
        affected,
        tone: pulseTone(trimmed, finalBody),
        stages,
        nonce,
      },
      highlight: affected.length > 0 ? new Set(affected) : state.highlight,
      auditNonce: auditRan && entry && !entry.error ? nonce : state.auditNonce,
    });
    if (affected.length > 0) {
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(() => setState({ highlight: EMPTY_HIGHLIGHT }), HIGHLIGHT_MS);
    }
  });
  return queue;
}

