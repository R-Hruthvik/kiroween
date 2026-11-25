import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  BUILTIN_REGISTRY,
  createWorkbenchState,
  flattenNodes,
  isReviewed,
  parseDocument,
  reviewFingerprint,
  runLine,
  serializeTree,
  type WorkbenchState,
} from "../src/index.js";

const SPEC = [
  "# Billing",
  "",
  "The service MUST respond within 30 s. Billing runs nightly.",
  "",
  "It is worth noting that retries are basically limited to 3 times.",
  "",
  "# Retention",
  "",
  "Logs are kept for 30 days.",
].join("\n");

function nodeAt(state: WorkbenchState, coord: string) {
  const node = flattenNodes(state.history.present).find((n) => n.coordinate === coord);
  if (!node) throw new Error(`no node ${coord}`);
  return node;
}

describe("Review.Mark and Review.Clear", () => {
  it("marks a paragraph, and the mark reads back as reviewed", async () => {
    const start = createWorkbenchState(parseDocument(SPEC));
    const marked = await runLine(start, "Review.Mark(§1a)", BUILTIN_REGISTRY);
    expect(isReviewed(nodeAt(marked, "§1a"), marked.reviews)).toBe(true);
    expect(isReviewed(nodeAt(marked, "§1b"), marked.reviews)).toBe(false);
    expect(marked.log.at(-1)?.error).toBeUndefined();
  });

  it("never changes the text, the coordinate index, or the history", async () => {
    const start = createWorkbenchState(parseDocument(SPEC));
    const marked = await runLine(start, "Review.Mark(§1a)", BUILTIN_REGISTRY);
    expect(serializeTree(marked.history.present)).toBe(serializeTree(start.history.present));
    expect(marked.history.present.indexByCoord).toEqual(start.history.present.indexByCoord);
    expect(marked.history.past).toHaveLength(start.history.past.length);
  });

  it("clears a mark, and says so when there was none", async () => {
    const start = createWorkbenchState(parseDocument(SPEC));
    const marked = await runLine(start, "Review.Mark(§1a)", BUILTIN_REGISTRY);
    const cleared = await runLine(marked, "Review.Clear(§1a)", BUILTIN_REGISTRY);
    expect(isReviewed(nodeAt(cleared, "§1a"), cleared.reviews)).toBe(false);
    expect(cleared.log.at(-1)?.body).toContain("Cleared the review mark on §1a");
    const again = await runLine(cleared, "Review.Clear(§1a)", BUILTIN_REGISTRY);
    expect(again.log.at(-1)?.body).toContain("§1a had no review mark.");
  });

  it("rejects a missing, malformed, or unknown address without changing marks", async () => {
    const start = createWorkbenchState(parseDocument(SPEC));
    for (const line of ["Review.Mark", "Review.Mark()", "Review.Mark(x)", "Review.Mark(§9.9z)", "Review.Clear(1a)"]) {
      const next = await runLine(start, line, BUILTIN_REGISTRY);
      expect(next.log.at(-1)?.error, line).toBeDefined();
      expect(next.reviews, line).toEqual({});
    }
  });

  it("is kept outside undo: System.Undo does not clear a mark", async () => {
    const start = createWorkbenchState(parseDocument(SPEC));
    const marked = await runLine(start, "Review.Mark(§1a)", BUILTIN_REGISTRY);
    const edited = await runLine(marked, "Doc.InjectFlaw", BUILTIN_REGISTRY);
    const undone = await runLine(edited, "System.Undo", BUILTIN_REGISTRY);
    expect(undone.reviews).toEqual(marked.reviews);
  });

  it("stops counting once the marked paragraph changes its text", async () => {
    const start = createWorkbenchState(parseDocument(SPEC));
    const marked = await runLine(start, "Review.Mark(§1b)", BUILTIN_REGISTRY);
    expect(isReviewed(nodeAt(marked, "§1b"), marked.reviews)).toBe(true);
    // Spec.Tighten removes the filler in §1b, so the paragraph no longer reads the same.
    const tightened = await runLine(marked, "Spec.Tighten", BUILTIN_REGISTRY);
    expect(nodeAt(tightened, "§1b").rawText).not.toBe(nodeAt(marked, "§1b").rawText);
    expect(isReviewed(nodeAt(tightened, "§1b"), tightened.reviews)).toBe(false);
  });

  it("is never changed by a random sequence of marks and clears (INV-1 for review state)", async () => {
    const tree = parseDocument(SPEC);
    const coords = flattenNodes(tree).map((node) => node.coordinate);
    await fc.assert(
      fc.asyncProperty(fc.array(fc.tuple(fc.boolean(), fc.constantFrom(...coords)), { maxLength: 6 }), async (ops) => {
        let state = createWorkbenchState(tree);
        for (const [mark, coord] of ops) {
          state = await runLine(state, `${mark ? "Review.Mark" : "Review.Clear"}(${coord})`, BUILTIN_REGISTRY);
        }
        expect(state.history.present).toBe(tree);
        expect(serializeTree(state.history.present)).toBe(serializeTree(tree));
      }),
      { numRuns: 40 },
    );
  });
});

describe("review fingerprint", () => {
  it("ignores whitespace runs and is stable", () => {
    expect(reviewFingerprint("A  b\n c")).toBe(reviewFingerprint("A b c"));
    expect(reviewFingerprint("A b c")).toBe(reviewFingerprint("A b c"));
    expect(reviewFingerprint("A b c")).not.toBe(reviewFingerprint("A b d"));
    expect(reviewFingerprint("x")).toMatch(/^[0-9a-f]{8}$/);
  });
});
