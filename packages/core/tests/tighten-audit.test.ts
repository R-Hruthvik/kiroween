import { describe, it, expect } from "vitest";
import {
  BUILTIN_REGISTRY,
  applyFlags,
  computeAuditFlags,
  createWorkbenchState,
  flattenNodes,
  parseDocument,
  runLine,
} from "../src/index.js";
import { specTighten } from "../src/oberon/commands.js";
import type { DocNode, DocumentTree } from "../src/types.js";

// Spec.Tighten re-parses the tree. Parsing sets only BROKEN_REF and UNVERIFIED_CLAIM, so the
// audit-only flags (CONTRADICTION, AMBIGUOUS_TERM) must be recomputed after a rewrite that
// follows an audit. A never-audited document must not gain them.

const FILLER_SPEC =
  "# S\n\nIt is important to note that the cache SHALL keep latency under 50 ms.\n\nThe cache SHALL keep latency at 200 ms.\n";

const UNAUDITED_SPEC = `${FILLER_SPEC}\nThe cache SHALL be fast.\n`;

function nodeAt(tree: DocumentTree, coordinate: string): DocNode {
  const node = flattenNodes(tree).find((candidate) => candidate.coordinate === coordinate);
  if (node === undefined) throw new Error(`No node at ${coordinate}`);
  return node;
}

function flagTypesAt(tree: DocumentTree, coordinate: string): string[] {
  return nodeAt(tree, coordinate).flags.map((flag) => flag.type);
}

/** The distinct audit-only flag types present anywhere in the tree, sorted. */
function auditOnlyTypesIn(tree: DocumentTree): string[] {
  const types = new Set(
    flattenNodes(tree)
      .flatMap((node) => node.flags.map((flag) => flag.type))
      .filter((type) => type === "CONTRADICTION" || type === "AMBIGUOUS_TERM"),
  );
  return [...types].sort();
}

describe("Spec.Tighten keeps audit flags after a rewrite", () => {
  it("keeps CONTRADICTION on both requirements through Spec.Audit -> Spec.Tighten, and removes the filler", async () => {
    const state = createWorkbenchState(parseDocument(FILLER_SPEC));
    const after = await runLine(state, "Spec.Audit -> Spec.Tighten", BUILTIN_REGISTRY);

    expect(after.log.at(-1)?.error).toBeUndefined();
    expect(after.log.at(-1)?.body).toContain("Tightened 1 node(s): §1a.");
    const tree = after.history.present;
    expect(nodeAt(tree, "§1a").rawText).toBe("The cache SHALL keep latency under 50 ms.");
    expect(flagTypesAt(tree, "§1a")).toContain("CONTRADICTION");
    expect(flagTypesAt(tree, "§1b")).toContain("CONTRADICTION");
  });

  it("keeps CONTRADICTION when specTighten runs on an audited tree with no selection", async () => {
    const tree = parseDocument(FILLER_SPEC);
    const audited = applyFlags(tree, computeAuditFlags(tree));
    const outcome = await specTighten({
      tree: audited,
      selectedNodeIds: [],
      selectedText: "",
      activeViewSpec: "a",
    });

    expect(outcome.error).toBeUndefined();
    expect(outcome.mutated).toBe(true);
    expect(nodeAt(outcome.updatedTree, "§1a").rawText).toBe("The cache SHALL keep latency under 50 ms.");
    expect(flagTypesAt(outcome.updatedTree, "§1a")).toContain("CONTRADICTION");
    expect(flagTypesAt(outcome.updatedTree, "§1b")).toContain("CONTRADICTION");
  });

  it("adds no CONTRADICTION or AMBIGUOUS_TERM when Spec.Tighten runs alone on an unaudited document", async () => {
    const tree = parseDocument(UNAUDITED_SPEC);
    // The document really has both problems, so the empty result below is not a vacuous pass.
    expect(auditOnlyTypesIn(applyFlags(tree, computeAuditFlags(tree)))).toEqual(
      expect.arrayContaining(["AMBIGUOUS_TERM", "CONTRADICTION"]),
    );

    const after = await runLine(createWorkbenchState(tree), "Spec.Tighten", BUILTIN_REGISTRY);

    expect(after.log.at(-1)?.error).toBeUndefined();
    expect(nodeAt(after.history.present, "§1a").rawText).toBe("The cache SHALL keep latency under 50 ms.");
    expect(auditOnlyTypesIn(after.history.present)).toEqual([]);
  });
});

describe("Doc.InjectFlaw does not count a § reference inside a code fence", () => {
  it("injects one latency pair when the only § reference is in a fence", async () => {
    const tree = parseDocument("# A\n\n```md\nSee §99.\n```\n");
    const after = await runLine(createWorkbenchState(tree), "Doc.InjectFlaw", BUILTIN_REGISTRY);

    const copies = flattenNodes(after.history.present).filter((node) => node.rawText.includes("under 50 ms"));
    expect(copies).toHaveLength(1);
  });
});
