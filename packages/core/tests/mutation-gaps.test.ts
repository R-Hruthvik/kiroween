import { describe, it, expect, vi } from "vitest";
import {
  parseDocument,
  projectTree,
  flattenProjected,
  createWorkbenchState,
  runLine,
  createRegistry,
  BUILTIN_REGISTRY,
  type CommandEntry,
  type WorkbenchState,
} from "../src/index.js";
import type { DocNode, DocumentTree } from "../src/types.js";

// Tests for mutants M1, M2, and M13 in docs/audit/answers-core.md (K6 mutation table).

function coordinatesOf(tree: DocumentTree, code: "a" | "h" | "f" | "u" | "r"): string[] {
  return flattenProjected(projectTree(tree, code)).map((item) => item.node.coordinate);
}

describe("M1: View.Spec(h) promotes visible descendants of a hidden node", () => {
  it("keeps a heading nested under a heading in the h projection", () => {
    const tree = parseDocument("## A\n\n### B\n\nBody text under B.\n");
    expect(coordinatesOf(tree, "h")).toEqual(["§1", "§1.1"]);
    const top = projectTree(tree, "h");
    expect(top.map((item) => item.node.coordinate)).toEqual(["§1"]);
    expect(top[0]?.children.map((item) => item.node.coordinate)).toEqual(["§1.1"]);
  });

  it("moves a heading under a hidden prose node up to the root instead of dropping it", () => {
    // Parsed Markdown never gives a body paragraph children, so this tree is built by hand.
    // projectTree is pure and accepts any DocumentTree, which makes this the only way to reach the
    // hidden-with-visible-descendant branch.
    const inner: DocNode = {
      id: "n2",
      coordinate: "§1.1",
      depth: 2,
      role: "Heading",
      rawText: "## Inner heading",
      firstSentence: "## Inner heading",
      hiddenWordCount: 0,
      citations: [],
      flags: [],
      children: [],
    };
    const prose: DocNode = {
      id: "n1",
      coordinate: "§1",
      depth: 1,
      role: "Prose",
      rawText: "Intro prose that h hides.",
      firstSentence: "Intro prose that h hides.",
      hiddenWordCount: 0,
      citations: [],
      flags: [],
      children: [inner],
    };
    const tree: DocumentTree = {
      id: "hand-built",
      title: "Hand built",
      version: 1,
      rootNodes: [prose],
      indexByCoord: { "§1": "n1", "§1.1": "n2" },
    };

    const projected = projectTree(tree, "h");
    expect(projected.map((item) => item.node.coordinate)).toEqual(["§1.1"]);
    expect(projected[0]?.displayText).toBe("## Inner heading");
  });
});

describe("M2: View.Spec(u) hides cited claims and assumptions", () => {
  // "§1.2a" is a § reference. It counts as a citation without making the node Evidence, so the node
  // keeps the Claim role and only the citation rule decides whether u shows it.
  const SPEC = [
    "# Caching",
    "",
    "## Targets",
    "",
    "Caches cut cost by 40% in production, see §1.2a.",
    "",
    "Caches cut cost by 50% in staging.",
    "",
    "## Notes",
    "",
    "We assume the traffic stays flat for a year.",
    "",
    "We assume the logs are kept, as noted in §1.2a.",
    "",
  ].join("\n");

  it("shows an uncited claim and omits the cited claim with the same shape", () => {
    const tree = parseDocument(SPEC);
    const shown = flattenProjected(projectTree(tree, "u")).map((item) => item.node.rawText);
    expect(shown).toContain("Caches cut cost by 50% in staging.");
    expect(shown.some((text) => text.includes("see §1.2a"))).toBe(false);
  });

  it("omits a cited assumption and keeps an uncited one", () => {
    const tree = parseDocument(SPEC);
    const shown = flattenProjected(projectTree(tree, "u")).map((item) => item.node.rawText);
    expect(shown).toContain("We assume the traffic stays flat for a year.");
    expect(shown.some((text) => text.includes("as noted in §1.2a"))).toBe(false);
  });
});

describe("M13: a failed pipeline stage stops the chain", () => {
  function freshState(): WorkbenchState {
    return createWorkbenchState(parseDocument("# A\n\nBody text.\n"));
  }

  it("does not run View.Spec(h) or View.Spec(f) after View.Spec(z) fails", async () => {
    const before = freshState();
    const after = await runLine(before, "View.Spec(z) -> View.Spec(h) -> View.Spec(f)", BUILTIN_REGISTRY);

    expect(after.activeViewSpec).toBe("a");
    expect(after.log).toHaveLength(before.log.length + 1);
    const entry = after.log.at(-1);
    expect(entry?.error).toContain('View.Spec expects one of a, h, f, u, r. Got "z".');
    expect(entry?.body).toContain("View.Spec(z)");
    expect(entry?.body).not.toContain("View.Spec(h)");
    expect(entry?.body).not.toContain("View.Spec(f)");
  });

  it("does not call a later stage's handler after an earlier stage returns an error", async () => {
    const later = vi.fn(() => ({
      updatedTree: parseDocument("# Changed\n"),
      nextViewSpec: "h" as const,
      logTitle: "Test.Later",
      logBody: "later ran",
      affectedCoordinates: [],
      mutated: true,
    }));
    const registry = createRegistry([
      {
        token: "Test.Fail",
        mutatesTree: false,
        scope: "Full Doc",
        description: "Always fails.",
        handler: (ctx) => ({
          updatedTree: ctx.tree,
          logTitle: "Test.Fail",
          logBody: "",
          affectedCoordinates: [],
          mutated: false,
          error: "boom",
        }),
      },
      { token: "Test.Later", mutatesTree: true, scope: "Full Doc", description: "Spy.", handler: later },
    ] satisfies CommandEntry[]);

    const before = freshState();
    const after = await runLine(before, "Test.Fail -> Test.Later", registry);

    expect(later).not.toHaveBeenCalled();
    expect(after.activeViewSpec).toBe("a");
    expect(after.history.present).toBe(before.history.present);
    expect(after.log.at(-1)?.body).not.toContain("later ran");
    expect(after.log.at(-1)?.error).toBe("boom");
  });
});
