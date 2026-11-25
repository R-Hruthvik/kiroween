export type SemanticRole =
  | 'Heading'
  | 'Requirement'
  | 'Claim'
  | 'Evidence'
  | 'Assumption'
  | 'Prose';

export type ViewSpecCode = 'a' | 'h' | 'f' | 'u' | 'r';

export type FlagType =
  | 'UNVERIFIED_CLAIM'
  | 'CONTRADICTION'
  | 'AMBIGUOUS_TERM'
  | 'BROKEN_REF';

export interface NodeFlag {
  type: FlagType;
  message: string;
  relatedCoordinate?: string;
}

export interface DocNode {
  id: string;
  coordinate: string;          // e.g., "§2.1b"
  depth: number;               // 1..6 for Headings; parent.depth + 1 for body nodes
  role: SemanticRole;
  rawText: string;             // Canonical source text (never altered by ViewSpecs)
  firstSentence: string;       // Precomputed opening sentence for 'f' ViewSpec
  hiddenWordCount: number;     // Word count omitted in 'f' ViewSpec
  citations: string[];         // Extracted [1], URLs, or §coords
  flags: NodeFlag[];
  children: DocNode[];
}

export interface DocumentTree {
  id: string;
  title: string;
  version: number;
  rootNodes: DocNode[];
  indexByCoord: Record<string, string>; // "§2.1b" -> DocNode.id
}

export interface ProjectedNode {
  node: DocNode;
  displayText: string;
  collapsed: boolean;
  truncated: boolean;
  children: ProjectedNode[];
}

export interface ParsedCommand {
  raw: string;                 // e.g., "View.Spec(u)"
  module: string;              // "View"
  action: string;              // "Spec"
  arg?: string;                // "u"
}

/**
 * Heading depth limit set by View.Level(n). A positive integer. Undefined means no level clip.
 * It is a separate projection dimension from ViewSpecCode, and it layers on top of the active view.
 */
export type LevelClip = number;

/**
 * Sentence count per section set by View.Brief(n). A positive integer. Undefined means the brief is off.
 * Like LevelClip, it is a projection setting, so it never changes the tree.
 */
export type BriefCount = number;

export interface CommandContext {
  tree: DocumentTree;
  selectedNodeIds: string[];
  selectedText: string;
  activeViewSpec: ViewSpecCode;
  activeLevel?: LevelClip;
  activeBrief?: BriefCount;
  /** Review marks. Undefined means none, as for a stateless caller such as the MCP server. */
  reviews?: ReviewMarks;
  /** System.Tool text. Undefined outside the browser, so Tool.Check refuses to run there. */
  padText?: string;
}

/** Options for runLine. padText is the System.Tool text, which only Tool.Check reads. */
export interface RunOptions {
  padText?: string;
}

/** A paragraph or heading address with a short excerpt of its text. Used by Find.Look and Link.Back. */
export interface AddressExcerpt {
  coordinate: string;
  excerpt: string;
}

/** One command stage of a System.Tool line, as Tool.Check reads it. */
export interface ToolCheckStage {
  /** The stage as written, for example "View.Spec(u)". */
  token: string;
  /** Catalog scope of the command, for example "Full Doc". Null when the stage names no known command. */
  reads: string | null;
  /** True when the command changes the document tree. */
  mutates: boolean;
  /** What is wrong with this stage, or null when it parses and names a known command. */
  error: string | null;
}

/** One checked System.Tool line. Blank lines and "#" group headings are not checked. */
export interface ToolCheckLine {
  /** 1-based line number in the pad, so it matches the editor. */
  lineNumber: number;
  text: string;
  stages: ToolCheckStage[];
  /** What is wrong with the whole line, such as a line with no command. Null when the line is valid. */
  error: string | null;
  /** True when a valid stage of this line changes the document tree. */
  mutates: boolean;
}

export interface ToolCheckReport {
  lines: ToolCheckLine[];
  /** Number of lines with a line error or a stage error. */
  errorLines: number;
}

export interface CommandOutcome {
  updatedTree: DocumentTree;
  nextViewSpec?: ViewSpecCode;
  /** undefined keeps the current level clip, null clears it, a number sets it. */
  nextLevel?: LevelClip | null;
  /** undefined keeps the current brief, null turns it off, a number turns it on with that sentence count. */
  nextBrief?: BriefCount | null;
  /** Replaces the review marks when the command sets or clears one. Never changes the text. */
  nextReviews?: ReviewMarks;
  logTitle: string;
  logBody: string;
  affectedCoordinates: string[];
  mutated: boolean;
  error?: string;
}

export type CommandHandler = (
  ctx: CommandContext,
  arg?: string,
) => Promise<CommandOutcome> | CommandOutcome;

/** One sentence of a body paragraph. Headings and code fences have no sentences. */
export interface SourceSentence {
  /** Unique within a tree: the owning node id and the sentence index inside that node. */
  sentenceId: string;
  /** Address of the paragraph that holds the sentence. */
  coordinate: string;
  /** The sentence as written, with whitespace runs collapsed to one space. */
  text: string;
  /** The whole paragraph, with whitespace collapsed. A sentence must be verbatim inside it. */
  paragraph: string;
  /** RFC 2119 keywords in the sentence, in order. Empty when the sentence has none. */
  modals: string[];
  /** The if, when, unless, and except clauses, joined by "; ". Null when there are none. */
  condition: string | null;
}

export interface BriefSentence {
  sentenceId: string;
  coordinate: string;
  text: string;
  /** True when the sentence is kept only because a kept sentence starts with "this", "it", or "such". */
  context: boolean;
}

export interface BriefSection {
  /** The heading's address and text. Null for text before the first heading. */
  heading: { coordinate: string; text: string } | null;
  /** Kept sentences, in source order. */
  sentences: BriefSentence[];
  /** Sentences in the section before the brief. */
  sentenceCount: number;
}

export interface BriefResult {
  perSection: number;
  sections: BriefSection[];
  wordsBefore: number;
  wordsAfter: number;
  /** The footer line, with the word counts. */
  footer: string;
  /** One message per kept sentence that is not verbatim or that changed a protected word. Empty when all pass. */
  guardFailures: string[];
}

export interface LedgerRow {
  sentenceId: string;
  coordinate: string;
  /** RFC 2119 keywords in the sentence, joined by ", ". */
  modal: string;
  condition: string | null;
  text: string;
  /** True when the sentence is kept in the View.Brief output with the same sentence count. */
  inBrief: boolean;
}

export interface LedgerReport {
  perSection: number;
  rows: LedgerRow[];
  inBrief: number;
  omitted: number;
  /** Kept brief sentences that have a modal keyword but no ledger row. Must be 0. */
  unaccounted: number;
  /** Same format as BriefResult.guardFailures, for the ledger rows. */
  guardFailures: string[];
}

/**
 * Review marks, keyed by § address. Each value is the fingerprint of that paragraph's text when it was
 * marked, so a mark stops counting once the paragraph text changes. Marks live outside rawText.
 */
export type ReviewMarks = Readonly<Record<string, string>>;

/** The view state that decides what a view hides. An active brief takes precedence over the view code. */
export interface HiddenViewState {
  view: ViewSpecCode;
  level?: LevelClip;
  brief?: BriefCount;
}

/** What the current view hides, for the footer under the Document Track. */
export interface HiddenSummary {
  /** Body paragraphs that are not shown at all (no sentence of them is shown, in View.Brief). */
  paragraphs: number;
  /** Headings that are not shown. View.Brief does not count headings, because it shows only sentences. */
  headings: number;
  /** Sentences hidden inside paragraphs that are still shown (View-Spec f, and View.Brief). */
  sentences: number;
  /** Words in those hidden sentences. */
  words: number;
  /** § addresses of every hidden paragraph or heading, and every paragraph with hidden sentences, in document order. */
  addresses: string[];
  /** The filters that hide text, for example "View.Spec(f)" or "View.Brief(2), View.Level(2)". */
  filters: string;
  /** One footer line, for example "12 sentences (340 words) hidden by View.Spec(f)." */
  text: string;
}
