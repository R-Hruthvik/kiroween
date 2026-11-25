import { describe, it, expect } from "vitest";
import {
  parseDocument,
  flattenNodes,
  buildBrief,
  renderBrief,
  parseSentenceCount,
  createWorkbenchState,
  runLine,
  BUILTIN_REGISTRY,
  FOOTER_TEXT,
} from "../src/index.js";

const SPEC = `# Billing

The service MUST respond within 30 s. Billing runs nightly. The team has a lunch room. Fine.

It is worth noting that retries MAY be limited to 3 times. This keeps load predictable.

# Retention

Logs are kept for 30 days. Records MUST be deleted when the account closes.
`;

function kept(brief: ReturnType<typeof buildBrief>, heading: string): string[] {
  const section = brief.sections.find((s) => s.heading?.text === heading);
  return (section?.sentences ?? []).map((s) => s.text);
}

describe("View.Brief argument", () => {
  it("accepts positive integers only", () => {
    expect(parseSentenceCount("1")).toBe(1);
    expect(parseSentenceCount("12")).toBe(12);
    for (const bad of ["", "0", "-1", "1.5", "x", " 2"]) expect(parseSentenceCount(bad)).toBeNull();
  });

  it("rejects an invalid count with a clear error and no output", async () => {
    const state = createWorkbenchState(parseDocument(SPEC));
    for (const command of ["View.Brief(0)", "View.Brief()", "View.Brief(two)"]) {
      const next = await runLine(state, command, BUILTIN_REGISTRY);
      const entry = next.log.at(-1);
      expect(entry?.error).toMatch(/View\.Brief expects a positive integer sentence count/);
      expect(next.activeBrief).toBeUndefined();
    }
  });

  it("defaults to 2 sentences per section when no count is given", async () => {
    const state = createWorkbenchState(parseDocument(SPEC));
    const bare = await runLine(state, "View.Brief", BUILTIN_REGISTRY);
    const two = await runLine(state, "View.Brief(2)", BUILTIN_REGISTRY);
    expect(bare.activeBrief).toBe(2);
    // runLine puts the command as typed in the first line of the body, so compare what follows it.
    const bodyOf = (body: string | undefined): string => (body ?? "").split("\n").slice(1).join("\n");
    expect(bodyOf(bare.log.at(-1)?.body)).toBe(bodyOf(two.log.at(-1)?.body));
  });

  it("turns the brief off when a View-Spec or View.Level runs", async () => {
    const state = await runLine(createWorkbenchState(parseDocument(SPEC)), "View.Brief(3)", BUILTIN_REGISTRY);
    expect(state.activeBrief).toBe(3);
    expect((await runLine(state, "View.Spec(u)", BUILTIN_REGISTRY)).activeBrief).toBeUndefined();
    expect((await runLine(state, "View.Level(1)", BUILTIN_REGISTRY)).activeBrief).toBeUndefined();
  });
});

describe("View.Brief selection", () => {
  it("keeps sentences with RFC 2119 keywords before other sentences", () => {
    const brief = buildBrief(parseDocument(SPEC), 1);
    expect(kept(brief, "Billing")).toEqual(["The service MUST respond within 30 s."]);
    expect(kept(brief, "Retention")).toEqual(["Records MUST be deleted when the account closes."]);
  });

  it("ranks numbers and definitions above heading overlap, and ties keep source order", () => {
    const tree = parseDocument("# Cache\n\nThe cache is fast. Entries live 30 days. The cache holds entries.\n");
    expect(kept(buildBrief(tree, 1), "Cache")).toEqual(["Entries live 30 days."]);
    const plain = parseDocument("# Notes\n\nOne fact here. Another fact there. A third fact.\n");
    expect(kept(buildBrief(plain, 2), "Notes")).toEqual(["One fact here.", "Another fact there."]);
  });

  it("keeps at least one sentence in every section that has text", () => {
    const brief = buildBrief(parseDocument(SPEC), 1);
    expect(brief.sections.length).toBe(2);
    for (const section of brief.sections) expect(section.sentences.length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the previous sentence when a kept sentence starts with this, it, or such", () => {
    const tree = parseDocument("# Limits\n\nThe queue holds 100 items. It MUST drop the oldest item when full.\n");
    const brief = buildBrief(tree, 1);
    const section = brief.sections[0];
    expect(section?.sentences.map((s) => [s.text, s.context])).toEqual([
      ["The queue holds 100 items.", true],
      ["It MUST drop the oldest item when full.", false],
    ]);
  });

  it("gives each kept sentence the § address of its paragraph, and that address exists", () => {
    const tree = parseDocument(SPEC);
    const brief = buildBrief(tree, 2);
    for (const section of brief.sections) {
      for (const sentence of section.sentences) {
        expect(Object.hasOwn(tree.indexByCoord, sentence.coordinate)).toBe(true);
      }
    }
  });

  it("returns the same output on every run", () => {
    const tree = parseDocument(SPEC);
    expect(buildBrief(tree, 2)).toEqual(buildBrief(tree, 2));
    expect(renderBrief(buildBrief(tree, 2))).toBe(renderBrief(buildBrief(tree, 2)));
  });

  it("rejects an invalid count in core too", () => {
    expect(() => buildBrief(parseDocument(SPEC), 0)).toThrow(RangeError);
  });
});

describe("View.Brief output", () => {
  it("has the footer line with word counts before and after", () => {
    const brief = buildBrief(parseDocument(SPEC), 1);
    expect(brief.footer.startsWith(FOOTER_TEXT)).toBe(true);
    expect(brief.footer).toContain(`Words: ${brief.wordsBefore} before, ${brief.wordsAfter} after`);
    expect(brief.wordsAfter).toBeLessThan(brief.wordsBefore);
  });

  it("passes the protected-word and verbatim guard for every kept sentence", () => {
    expect(buildBrief(parseDocument(SPEC), 2).guardFailures).toEqual([]);
  });

  it("shows each kept sentence exactly as it is in its paragraph", () => {
    const tree = parseDocument(SPEC);
    const texts = flattenNodes(tree).map((node) => node.rawText.replace(/\s+/g, " "));
    for (const section of buildBrief(tree, 3).sections) {
      for (const sentence of section.sentences) {
        expect(texts.some((text) => text.includes(sentence.text))).toBe(true);
      }
    }
  });

  it("never changes the tree", async () => {
    const tree = parseDocument(SPEC);
    const snapshot = JSON.parse(JSON.stringify(tree)) as typeof tree;
    const next = await runLine(createWorkbenchState(tree), "View.Brief(2)", BUILTIN_REGISTRY);
    expect(next.history.present).toEqual(snapshot);
    expect(next.log.at(-1)?.error).toBeUndefined();
    expect(next.history.past).toHaveLength(0);
  });
});
