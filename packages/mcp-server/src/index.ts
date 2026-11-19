#!/usr/bin/env node
/**
 * Augeron stdio MCP server. Every tool is a thin wrapper over @augeron/core and returns JSON text.
 * stdout carries the JSON-RPC stream, so all diagnostics go to stderr.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  BUILTIN_REGISTRY,
  coordinatesMentioned,
  createWorkbenchState,
  flattenNodes,
  parseDocument,
  projectTree,
  runLine,
  serializeTree,
  verifyAudit,
  type CommandOutcome,
  type DocumentTree,
  type ProjectedNode,
  type ViewSpecCode,
} from "@augeron/core";

const MAX_MARKDOWN_CHARS = 1_000_000;

const markdownSchema = z
  .string()
  .max(MAX_MARKDOWN_CHARS)
  .describe("NLS Markdown source. Headings become § coordinates, and body paragraphs get letter suffixes.");

const viewSpecSchema = z
  .enum(["a", "h", "f", "u", "r"])
  .describe("a = all, h = headings, f = first sentence, u = unverified claims, r = requirements and issues.");

function asText(payload: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

function errorResult(message: string) {
  return asText({ error: message }, true);
}

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

function findNode(tree: DocumentTree, coordinate: string) {
  const id = tree.indexByCoord[coordinate];
  if (!id) return null;
  return flattenNodes(tree).find((node) => node.id === id) ?? null;
}

const server = new McpServer({ name: "augeron", version: "0.1.0" });

server.registerTool(
  "augeron_parse_document",
  {
    title: "Parse NLS document",
    description:
      "Parse Markdown into an Augeron DocumentTree. Returns each node's § coordinate, semantic role, depth, citations, flags, and the indexByCoord map.",
    inputSchema: { markdown: markdownSchema },
  },
  ({ markdown }) => asText(parseDocument(markdown)),
);

server.registerTool(
  "augeron_project_viewspec",
  {
    title: "Project a View-Spec",
    description:
      "Apply one non-destructive View-Spec (a, h, f, u, or r) to a document. Returns the visible nodes as a tree. The source text is not changed.",
    inputSchema: { markdown: markdownSchema, viewSpec: viewSpecSchema },
  },
  ({ markdown, viewSpec }) => {
    const tree = parseDocument(markdown);
    const code: ViewSpecCode = viewSpec;
    const projected = projectTree(tree, code);
    const total = flattenNodes(tree).length;
    const visibleIds = new Set<string>();
    const collect = (nodes: readonly ProjectedNode[]): void => {
      for (const node of nodes) {
        visibleIds.add(node.node.id);
        collect(node.children);
      }
    };
    collect(projected);
    return asText({
      viewSpec: code,
      totalNodeCount: total,
      visibleNodeCount: visibleIds.size,
      nodes: simplify(projected),
    });
  },
);

server.registerTool(
  "augeron_run_pipeline",
  {
    title: "Run an Oberon pipeline",
    description:
      "Run an Oberon command chain such as 'Spec.Audit -> Outline.ExtractTasks' against a document. Returns the CommandOutcome: updated tree, log output, affected coordinates, and any error. Browser-only tokens (Doc.Load, AI.Config, Edit.Source, Edit.Done) are not available here.",
    inputSchema: {
      markdown: markdownSchema,
      pipeline: z
        .string()
        .min(1)
        .max(2_000)
        .describe("One or more Module.Action tokens separated by ->, for example View.Spec(u) -> Cite.Verify."),
      targetCoord: z
        .string()
        .optional()
        .describe("Optional § coordinate to select before the pipeline runs, for example §2.1b."),
    },
  },
  async ({ markdown, pipeline, targetCoord }) => {
    const tree = parseDocument(markdown);
    let state = createWorkbenchState(tree);

    if (targetCoord !== undefined) {
      const node = findNode(tree, targetCoord);
      if (!node) return errorResult(`${targetCoord} is not in this document's coordinate index.`);
      state = { ...state, selectedNodeIds: [node.id], selectedText: node.rawText };
    }

    const before = serializeTree(tree);
    const next = await runLine(state, pipeline, BUILTIN_REGISTRY);
    const entry = next.log[next.log.length - 1];
    const updatedTree = next.history.present;
    const logBody = entry?.body ?? "";
    const outcome: CommandOutcome = {
      updatedTree,
      nextViewSpec: next.activeViewSpec,
      logTitle: entry?.title ?? pipeline.trim(),
      logBody,
      affectedCoordinates: coordinatesMentioned(logBody, updatedTree.indexByCoord),
      mutated: serializeTree(updatedTree) !== before,
      ...(entry?.error !== undefined ? { error: entry.error } : {}),
    };
    return asText(outcome, outcome.error !== undefined);
  },
);

server.registerTool(
  "augeron_verify_audit",
  {
    title: "Verify an audit",
    description:
      "Check coordinate bijection (each node has one unique § coordinate, and indexByCoord maps back to it). Also returns every CONTRADICTION and BROKEN_REF flag from a Spec.Audit pass, as JSON.",
    inputSchema: { markdown: markdownSchema },
  },
  ({ markdown }) => asText(verifyAudit(parseDocument(markdown))),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("augeron MCP server ready on stdio");
}

main().catch((error: unknown) => {
  console.error("augeron MCP server failed to start:", error);
  process.exit(1);
});
