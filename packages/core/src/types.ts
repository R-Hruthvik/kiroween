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

export interface CommandContext {
  tree: DocumentTree;
  selectedNodeIds: string[];
  selectedText: string;
  activeViewSpec: ViewSpecCode;
  activeLevel?: LevelClip;
}

export interface CommandOutcome {
  updatedTree: DocumentTree;
  nextViewSpec?: ViewSpecCode;
  /** undefined keeps the current level clip, null clears it, a number sets it. */
  nextLevel?: LevelClip | null;
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
