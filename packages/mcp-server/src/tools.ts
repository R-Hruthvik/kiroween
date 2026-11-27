/**
 * Tool logic for the Augeron MCP server. Pure functions over @augeron/core, with no SDK or stdio
 * imports, so tests can call them directly. index.ts registers these functions with the SDK.
 */
import { z } from "zod";
import {
  BUILTIN_REGISTRY,
  checkPipeline,
  createWorkbenchState,
  flattenNodes,
  parseDocument,
  projectTree,
  runPipeline,
  serializeTree,
  verifyAudit,
  type CommandEntry,
  type CommandRegistry,
  type DocumentTree,
  type ProjectedNode,
  type ViewSpecCode,
} from "@augeron/core";

export const MAX_MARKDOWN_CHARS = 1_000_000;

export interface ToolResult {
  payload: unknown;
  isError: boolean;
}

// ---------------------------------------------------------------------------
// Command metadata derived from the core registry
// ---------------------------------------------------------------------------

/** Display hints for commands that take an argument. The registry has no argument metadata. */
const ARG_HINTS: Readonly<Record<string, string>> = {
  "View.Spec": "(a|h|f|u|r)",
  "View.Brief": "(n)",
  "Spec.Ledger": "(n)",
  "Find.Look": "(text)",
  "Link.Back": "(§x)",
  "Help.Show": "(Module.Action)",
};

/** A command runs here when it has a handler. Control commands need browser history or log state. */
function isServerCommand(entry: CommandEntry): boolean {
  return entry.control === undefined && entry.handler !== undefined && !entry.needsWorkbench;
}

/** A command honors targetCoord when its catalog scope includes the selection. */
function honorsTargetCoord(entry: CommandEntry): boolean {
  return isServerCommand(entry) && entry.scope.includes("Selection");
}

function commandCatalog(registry: CommandRegistry): string {
  const entries = [...registry.values()];
  const lines = entries.filter(isServerCommand).map((entry) => {
    const token = `${entry.token}${ARG_HINTS[entry.token] ?? ""}`;
    const mutates = entry.mutatesTree ? "yes" : "no";
    return `- ${token}: ${entry.description} Mutates tree: ${mutates}. Scope: ${entry.scope}.`;
  });
  const unavailable = entries.filter((entry) => !isServerCommand(entry)).map((entry) => entry.token);
  return [
    "Commands available in this server:",
    ...lines,
    `Not available here (they need browser history or log state): ${unavailable.join(", ")}.`,
    "Browser-only tokens (Doc.Load, AI.Config, Edit.Source, Edit.Done) are not available here either.",
  ].join("\n");
}

function targetCoordNote(registry: CommandRegistry): string {
  const honoring = [...registry.values()].filter(honorsTargetCoord).map((entry) => entry.token);
  return `Honored by: ${honoring.join(", ")}. Other commands ignore it.`;
}

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const markdownSchema = z
  .string()
  .max(MAX_MARKDOWN_CHARS)
  .describe("NLS Markdown source. Headings become § coordinates, and body paragraphs get letter suffixes.");

const viewSpecSchema = z
  .enum(["a", "h", "f", "u", "r"])
  .describe("a = all, h = headings, f = first sentence, u = unverified claims, r = requirements and issues.");

export const parseDocumentInput = {
  markdown: markdownSchema,
};

export const projectViewSpecInput = {
  markdown: markdownSchema,
  viewSpec: viewSpecSchema,
};

export const runPipelineInput = {
  markdown: markdownSchema,
  pipeline: z
    .string()
    .min(1)
    .max(2_000)
    .describe("One or more Module.Action tokens separated by ->, for example View.Spec(u) -> Cite.Verify."),
  targetCoord: z
    .string()
    .optional()
    .describe(`Optional § coordinate to select before the pipeline runs, for example §2.1b. ${targetCoordNote(BUILTIN_REGISTRY)}`),
  includeTree: z
    .boolean()
    .optional()
    .describe("Set to true to include updatedTree (the full DocumentTree) in the response. Defaults to false."),
};

export const verifyAuditInput = {
  markdown: markdownSchema,
};

export type RunPipelineInput = z.infer<z.ZodObject<typeof runPipelineInput>>;

// ---------------------------------------------------------------------------
// Tool descriptions
// ---------------------------------------------------------------------------

export const PARSE_DOCUMENT_DESCRIPTION =
  "Parse Markdown into an Augeron DocumentTree. Returns each node's § coordinate, semantic role, depth, citations, flags, and the indexByCoord map.";

export const PROJECT_VIEW_SPEC_DESCRIPTION =
  "Apply one non-destructive View-Spec (a, h, f, u, or r) to a document. Returns the visible nodes as a tree. The source text is not changed.";

export const RUN_PIPELINE_DESCRIPTION =
  "Run an Oberon command chain such as 'Spec.Audit -> Outline.ExtractTasks' against a document. " +
  "All stages are validated first. Stages run left to right, and the first error stops the chain. " +
  "Returns logTitle, logBody, affectedCoordinates (the coordinates each handler reported, deduplicated across stages in first-seen order), mutated, nextViewSpec, and error when a stage fails. " +
  "A command that reports no coordinates adds none, even when its output mentions nodes (for example System.Export). " +
  "The full updatedTree is returned only with includeTree: true. " +
  "Browser-only tokens (Doc.Load, AI.Config, Edit.Source, Edit.Done) are not available here.\n\n" +
  commandCatalog(BUILTIN_REGISTRY);

export const VERIFY_AUDIT_DESCRIPTION =
  "Check coordinate bijection (each node has one unique § coordinate, and indexByCoord maps back to it). Also returns every CONTRADICTION and BROKEN_REF flag from a Spec.Audit pass, as JSON.";

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

interface SimpleProjectedNode {
  coordinate: string;
  role: string;
  displayText: string;
  truncated: boolean;
  collapsed: boolean;
  children: SimpleProjectedNode[];
}

function simplify(nodes: readonly ProjectedNode[]): SimpleProjectedNode[] {
  return nodes.map((projected) => ({
    coordinate: projected.node.coordinate,
    role: projected.node.role,
    displayText: projected.displayText,
    truncated: projected.truncated,
    collapsed: projected.collapsed,
    children: simplify(projected.children),
  }));
}

export function parseDocumentTool(input: { markdown: string }): ToolResult {
  return { payload: parseDocument(input.markdown), isError: false };
}

export function projectViewSpecTool(input: { markdown: string; viewSpec: ViewSpecCode }): ToolResult {
  const tree = parseDocument(input.markdown);
  const projected = projectTree(tree, input.viewSpec);
  const visibleIds = new Set<string>();
  const collect = (nodes: readonly ProjectedNode[]): void => {
    for (const node of nodes) {
      visibleIds.add(node.node.id);
      collect(node.children);
    }
  };
  collect(projected);
  return {
    payload: {
      viewSpec: input.viewSpec,
      totalNodeCount: flattenNodes(tree).length,
      visibleNodeCount: visibleIds.size,
      nodes: simplify(projected),
    },
    isError: false,
  };
}

export function verifyAuditTool(input: { markdown: string }): ToolResult {
  return { payload: verifyAudit(parseDocument(input.markdown)), isError: false };
}

export interface PipelineRun {
  updatedTree: DocumentTree;
  nextViewSpec: ViewSpecCode;
  logTitle: string;
  logBody: string;
  affectedCoordinates: string[];
  error?: string;
}

export interface PipelineSelection {
  selectedNodeIds: readonly string[];
  selectedText: string;
  activeViewSpec: ViewSpecCode;
}

/**
 * Runs an Oberon pipeline through core's runPipeline, so validation, ordering and log text match the web app.
 * The MCP server only adds its own policy: stages that need browser state are refused before anything runs.
 */
export async function executePipeline(
  start: DocumentTree,
  line: string,
  selection: PipelineSelection,
  registry: CommandRegistry,
): Promise<PipelineRun> {
  const logTitle = line.trim();
  const failValidation = (error: string): PipelineRun => ({
    updatedTree: start,
    nextViewSpec: selection.activeViewSpec,
    logTitle,
    logBody: "",
    affectedCoordinates: [],
    error,
  });

  const checked = checkPipeline(line, registry);
  if ("error" in checked) return failValidation(checked.error);
  for (const { command, entry } of checked.stages) {
    const token = `${command.module}.${command.action}`;
    if (entry.control !== undefined || entry.needsWorkbench) {
      return failValidation(`${token} is not available in augeron_run_pipeline. It needs browser history or log state.`);
    }
    if (!entry.handler) return failValidation(`${entry.token} has no handler.`);
  }

  const initial = createWorkbenchState(start);
  const state = {
    ...initial,
    activeViewSpec: selection.activeViewSpec,
    selectedNodeIds: [...selection.selectedNodeIds],
    selectedText: selection.selectedText,
  };
  const result = await runPipeline(state, line, registry);
  return {
    updatedTree: result.state.history.present,
    nextViewSpec: result.state.activeViewSpec,
    logTitle,
    logBody: result.sections.join("\n\n"),
    affectedCoordinates: [...result.affectedCoordinates],
    ...(result.error !== undefined ? { error: result.error } : {}),
  };
}

export async function runPipelineTool(input: RunPipelineInput): Promise<ToolResult> {
  const tree = parseDocument(input.markdown);
  const initial = createWorkbenchState(tree);
  let selection: PipelineSelection = {
    selectedNodeIds: initial.selectedNodeIds,
    selectedText: initial.selectedText,
    activeViewSpec: initial.activeViewSpec,
  };

  if (input.targetCoord !== undefined) {
    const id = tree.indexByCoord[input.targetCoord];
    const node = id === undefined ? undefined : flattenNodes(tree).find((candidate) => candidate.id === id);
    if (node === undefined) {
      return {
        payload: { error: `${input.targetCoord} is not in this document's coordinate index.` },
        isError: true,
      };
    }
    selection = { ...selection, selectedNodeIds: [node.id], selectedText: node.rawText };
  }

  const before = serializeTree(tree);
  const run = await executePipeline(tree, input.pipeline, selection, BUILTIN_REGISTRY);
  const payload = {
    logTitle: run.logTitle,
    logBody: run.logBody,
    affectedCoordinates: run.affectedCoordinates,
    mutated: serializeTree(run.updatedTree) !== before,
    nextViewSpec: run.nextViewSpec,
    ...(run.error !== undefined ? { error: run.error } : {}),
    ...(input.includeTree === true ? { updatedTree: run.updatedTree } : {}),
  };
  return { payload, isError: run.error !== undefined };
}
