import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  BUILTIN_REGISTRY,
  createWorkbenchState,
  flattenNodes,
  parseDocument,
  runLine,
  type DocumentTree,
} from "@augeron/core";
import {
  RUN_PIPELINE_DESCRIPTION,
  projectViewSpecInput,
  parseDocumentInput,
  parseDocumentTool,
  projectViewSpecTool,
  runPipelineInput,
  runPipelineTool,
  verifyAuditInput,
  verifyAuditTool,
} from "../src/tools.js";
import { SPEC_FIXTURE } from "./fixtures.js";

const runSchema = z.object(runPipelineInput);
const projectSchema = z.object(projectViewSpecInput);
const parseSchema = z.object(parseDocumentInput);
const verifySchema = z.object(verifyAuditInput);

const COMPACT_KEYS = ["affectedCoordinates", "logBody", "logTitle", "mutated", "nextViewSpec"];

/** Runs the pipeline through core's runLine, which is the reference behavior for the MCP runner. */
async function referenceRun(markdown: string, line: string) {
  const tree = parseDocument(markdown);
  const state = await runLine(createWorkbenchState(tree), line, BUILTIN_REGISTRY);
  const entry = state.log[state.log.length - 1];
  return { tree: state.history.present, body: entry?.body ?? "", error: entry?.error };
}

async function pipeline(pipelineText: string, extra: { targetCoord?: string; includeTree?: boolean } = {}) {
  const result = await runPipelineTool({ markdown: SPEC_FIXTURE, pipeline: pipelineText, ...extra });
  return { ...result, payload: result.payload as Record<string, unknown> };
}

function coordinatesWithFlag(tree: DocumentTree, types: readonly string[]): string[] {
  return flattenNodes(tree)
    .filter((node) => node.flags.some((flag) => types.includes(flag.type)))
    .map((node) => node.coordinate);
}

describe("augeron_parse_document", () => {
  it("returns the coordinate index for every node", () => {
    const { payload, isError } = parseDocumentTool({ markdown: SPEC_FIXTURE });
    const tree = payload as DocumentTree;
    expect(isError).toBe(false);
    expect(Object.keys(tree.indexByCoord)).toContain("§1.1a");
    expect(Object.keys(tree.indexByCoord)).toHaveLength(flattenNodes(tree).length);
  });

  it("rejects markdown longer than the 1,000,000 character cap", () => {
    const result = parseSchema.safeParse({ markdown: "a".repeat(1_000_001) });
    expect(result.success).toBe(false);
  });

  it("rejects non-string markdown", () => {
    expect(parseSchema.safeParse({ markdown: 42 }).success).toBe(false);
  });
});

describe("augeron_project_viewspec", () => {
  it("shows only headings for view h and leaves the source tree unchanged", () => {
    const { payload, isError } = projectViewSpecTool({ markdown: SPEC_FIXTURE, viewSpec: "h" });
    const result = payload as { totalNodeCount: number; visibleNodeCount: number; viewSpec: string };
    expect(isError).toBe(false);
    expect(result.viewSpec).toBe("h");
    expect(result.visibleNodeCount).toBeLessThan(result.totalNodeCount);
    expect(result.totalNodeCount).toBe(flattenNodes(parseDocumentTool({ markdown: SPEC_FIXTURE }).payload as DocumentTree).length);
  });

  it("rejects a view code outside a, h, f, u, r", () => {
    expect(projectSchema.safeParse({ markdown: SPEC_FIXTURE, viewSpec: "z" }).success).toBe(false);
  });
});

describe("augeron_run_pipeline payload shape", () => {
  it("omits updatedTree by default", async () => {
    const { payload, isError } = await pipeline("Spec.Audit");
    expect(isError).toBe(false);
    expect(Object.keys(payload).sort()).toEqual(COMPACT_KEYS);
  });

  it("includes updatedTree only when includeTree is true", async () => {
    const compact = await pipeline("Spec.Audit");
    const full = await pipeline("Spec.Audit", { includeTree: true });
    expect(Object.keys(full.payload).sort()).toEqual([...COMPACT_KEYS, "updatedTree"].sort());
    expect(full.payload.logBody).toBe(compact.payload.logBody);
    expect(full.payload.affectedCoordinates).toEqual(compact.payload.affectedCoordinates);
    expect(full.payload.mutated).toBe(compact.payload.mutated);
  });

  it("returns a compact payload well under the size of the includeTree payload", async () => {
    const compact = JSON.stringify((await pipeline("Spec.Audit")).payload);
    const full = JSON.stringify((await pipeline("Spec.Audit", { includeTree: true })).payload);
    expect(compact.length).toBeLessThan(full.length / 2);
  });

  it("accepts includeTree only as a boolean", () => {
    expect(runSchema.safeParse({ markdown: SPEC_FIXTURE, pipeline: "Spec.Audit", includeTree: "yes" }).success).toBe(false);
    expect(runSchema.safeParse({ markdown: SPEC_FIXTURE, pipeline: "Spec.Audit", includeTree: true }).success).toBe(true);
  });
});

describe("augeron_run_pipeline matches core runLine", () => {
  const lines = [
    "Spec.Audit",
    "Spec.Audit -> Outline.ExtractTasks",
    "Cite.Verify",
    "Spec.Tighten",
    "System.Export",
    "View.Spec(u)",
    "Doc.InjectFlaw -> Spec.Audit",
    "Spec.Tighten -> View.Spec(z)",
  ];

  for (const line of lines) {
    it(`agrees with runLine on "${line}"`, async () => {
      const ours = await pipeline(line, { includeTree: true });
      const reference = await referenceRun(SPEC_FIXTURE, line);
      expect(ours.payload.logBody).toBe(reference.body);
      expect(ours.payload.error).toBe(reference.error);
      expect(ours.payload.updatedTree).toEqual(reference.tree);
    });
  }
});

describe("augeron_run_pipeline affectedCoordinates", () => {
  it("returns the nodes Cite.Verify flags, not every node in the log text", async () => {
    const { payload } = await pipeline("Cite.Verify");
    expect(payload.affectedCoordinates).toEqual(["§1.1b", "§1.3b", "§1.3c"]);
    const tree = (await pipeline("Cite.Verify", { includeTree: true })).payload.updatedTree as DocumentTree;
    expect(payload.affectedCoordinates).toEqual(coordinatesWithFlag(tree, ["BROKEN_REF", "UNVERIFIED_CLAIM"]));
  });

  it("returns no coordinates for System.Export even though its log lists every anchor", async () => {
    const { payload } = await pipeline("System.Export");
    expect(payload.logBody).toContain("<!-- §1.1a -->");
    expect(payload.affectedCoordinates).toEqual([]);
  });

  it("deduplicates across stages and keeps first-seen order", async () => {
    const audit = (await pipeline("Spec.Audit")).payload.affectedCoordinates as string[];
    const verify = (await pipeline("Cite.Verify")).payload.affectedCoordinates as string[];
    const combined = (await pipeline("Spec.Audit -> Cite.Verify")).payload.affectedCoordinates as string[];
    expect(combined).toEqual([...new Set([...audit, ...verify])]);
    expect(new Set(combined).size).toBe(combined.length);
  });

  it("reports the nodes Spec.Tighten changed", async () => {
    const { payload } = await pipeline("Spec.Tighten");
    expect(payload.affectedCoordinates).toEqual(["§1.3b"]);
    expect(payload.mutated).toBe(true);
  });
});

describe("augeron_run_pipeline targetCoord", () => {
  it("scopes Spec.Tighten to the target node", async () => {
    const { payload } = await pipeline("Spec.Tighten", { targetCoord: "§1.3b" });
    expect(payload.affectedCoordinates).toEqual(["§1.3b"]);
    expect(payload.mutated).toBe(true);
  });

  it("ignores targetCoord for Spec.Audit, as the tool description says", async () => {
    const full = await pipeline("Spec.Audit");
    const scoped = await pipeline("Spec.Audit", { targetCoord: "§1.1a" });
    expect(scoped.payload.logBody).toBe(full.payload.logBody);
  });

  it("returns an error result for a coordinate that is not in the document", async () => {
    const { payload, isError } = await pipeline("Spec.Audit", { targetCoord: "§99.9z" });
    expect(isError).toBe(true);
    expect(payload.error).toContain("§99.9z is not in this document's coordinate index");
  });
});

describe("augeron_run_pipeline invalid input", () => {
  it("rejects an empty pipeline at the schema", () => {
    expect(runSchema.safeParse({ markdown: SPEC_FIXTURE, pipeline: "" }).success).toBe(false);
  });

  it("returns an error for a token that is not a command", async () => {
    const { payload, isError } = await pipeline("not a command");
    expect(isError).toBe(true);
    expect(payload.error).toBe('Not a command token: "not a command"');
  });

  it("returns an error for an unknown command", async () => {
    const { payload, isError } = await pipeline("Bogus.Thing");
    expect(isError).toBe(true);
    expect(payload.error).toBe("Unknown command: Bogus.Thing");
  });

  it("validates every stage before running any of them", async () => {
    const { payload, isError } = await pipeline("Spec.Tighten -> Bogus.Thing", { includeTree: true });
    expect(isError).toBe(true);
    expect(payload.error).toBe("Unknown command: Bogus.Thing");
    expect(payload.mutated).toBe(false);
    expect(payload.logBody).toBe("");
  });

  it("rejects browser history commands", async () => {
    const { payload, isError } = await pipeline("System.Undo");
    expect(isError).toBe(true);
    expect(payload.error).toContain("System.Undo is not available in augeron_run_pipeline");
  });

  it("returns the error from a failing stage and keeps earlier stage changes", async () => {
    const { payload, isError } = await pipeline("Spec.Tighten -> View.Spec(z)");
    expect(isError).toBe(true);
    expect(payload.error).toBe('View.Spec expects one of a, h, f, u, r. Got "z".');
    expect(payload.mutated).toBe(true);
  });
});

describe("augeron_run_pipeline tool description", () => {
  const serverTokens = [...BUILTIN_REGISTRY.values()]
    .filter((entry) => entry.control === undefined)
    .map((entry) => entry.token);

  it("lists every command that runs in this server, taken from the registry", () => {
    for (const token of serverTokens) {
      expect(RUN_PIPELINE_DESCRIPTION).toContain(token);
    }
  });

  it("names the history commands as unavailable", () => {
    expect(RUN_PIPELINE_DESCRIPTION).toContain("System.Undo, System.Redo, System.ClearLog");
  });

  it("states which commands honor targetCoord", () => {
    const description = runPipelineInput.targetCoord.description ?? "";
    expect(description).toContain("Honored by: Spec.Tighten, Outline.ExtractTasks.");
  });
});

describe("augeron_verify_audit", () => {
  it("reports the contradiction and broken references on the fixture", () => {
    const { payload, isError } = verifyAuditTool({ markdown: SPEC_FIXTURE });
    const result = payload as {
      ok: boolean;
      contradictions: { coordinate: string }[];
      brokenReferences: { coordinate: string }[];
    };
    expect(isError).toBe(false);
    expect(result.ok).toBe(false);
    expect(result.contradictions.map((item) => item.coordinate)).toEqual(["§1.2a", "§1.3a"]);
    expect(result.brokenReferences.map((item) => item.coordinate)).toEqual(["§1.1b", "§1.3b", "§1.3c"]);
  });

  it("rejects markdown over the cap", () => {
    expect(verifySchema.safeParse({ markdown: "a".repeat(1_000_001) }).success).toBe(false);
  });
});
