#!/usr/bin/env node
/**
 * Augeron stdio MCP server. Every tool is a thin wrapper over @augeron/core and returns JSON text.
 * stdout carries the JSON-RPC stream, so all diagnostics go to stderr.
 * Tool logic lives in ./tools.ts so it can be tested without starting the stdio transport.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  PARSE_DOCUMENT_DESCRIPTION,
  PROJECT_VIEW_SPEC_DESCRIPTION,
  RUN_PIPELINE_DESCRIPTION,
  VERIFY_AUDIT_DESCRIPTION,
  parseDocumentInput,
  parseDocumentTool,
  projectViewSpecInput,
  projectViewSpecTool,
  runPipelineInput,
  runPipelineTool,
  verifyAuditInput,
  verifyAuditTool,
  type ToolResult,
} from "./tools.js";

function toContent(result: ToolResult) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result.payload, null, 2) }],
    ...(result.isError ? { isError: true } : {}),
  };
}

const server = new McpServer({ name: "augeron", version: "0.1.0" });

server.registerTool(
  "augeron_parse_document",
  {
    title: "Parse NLS document",
    description: PARSE_DOCUMENT_DESCRIPTION,
    inputSchema: parseDocumentInput,
  },
  (input) => toContent(parseDocumentTool(input)),
);

server.registerTool(
  "augeron_project_viewspec",
  {
    title: "Project a View-Spec",
    description: PROJECT_VIEW_SPEC_DESCRIPTION,
    inputSchema: projectViewSpecInput,
  },
  (input) => toContent(projectViewSpecTool(input)),
);

server.registerTool(
  "augeron_run_pipeline",
  {
    title: "Run an Oberon pipeline",
    description: RUN_PIPELINE_DESCRIPTION,
    inputSchema: runPipelineInput,
  },
  async (input) => toContent(await runPipelineTool(input)),
);

server.registerTool(
  "augeron_verify_audit",
  {
    title: "Verify an audit",
    description: VERIFY_AUDIT_DESCRIPTION,
    inputSchema: verifyAuditInput,
  },
  (input) => toContent(verifyAuditTool(input)),
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
