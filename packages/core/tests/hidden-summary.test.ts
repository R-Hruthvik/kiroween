import { describe, it, expect } from "vitest";
import { flattenNodes, hiddenSummary, parseDocument, projectTree, countProjected } from "../src/index.js";

const FLAT = ["# Alpha", "", "First body.", "", "Second body.", "", "## Beta", "", "Beta body."].join("\n");

const NESTED = ["# Alpha", "", "A body.", "", "## Beta", "", "B body.", "", "### Gamma", "", "G body."].join("\n");

// f keeps sentences with SHALL, MUST, REQUIRED, SHOULD, NEVER, PROHIBITED, MAY, OPTIONAL, or RECOMMENDED.
const SENTENCES = "The service MUST respond. Billing runs nightly for the team. Retries SHALL be limited.";

describe("hiddenSummary for View-Specs", () => {
  it("says nothing is hidden by the full view", () => {
    const tree = parseDocument(FLAT);
    const summary = hiddenSummary(tree, { view: "a" });
    expect(summary.paragraphs).toBe(0);
    expect(summary.headings).toBe(0);
    expect(summary.sentences).toBe(0);
    expect(summary.addresses).toEqual([]);
    expect(summary.text).toBe("Nothing hidden by View.Spec(a).");
  });

  it("counts paragraphs and lists their addresses under h", () => {
    const tree = parseDocument(FLAT);
    const summary = hiddenSummary(tree, { view: "h" });
    expect(summary.paragraphs).toBe(3);
    expect(summary.headings).toBe(0);
    expect(summary.addresses).toEqual(["§1a", "§1b", "§1.1a"]);
    expect(summary.text).toBe("3 paragraphs hidden by View.Spec(h).");
  });

  it("counts the paragraphs and headings that a View.Level clip removes", () => {
    const tree = parseDocument(NESTED);
    const summary = hiddenSummary(tree, { view: "a", level: 1 });
    expect(summary.headings).toBe(2);
    expect(summary.paragraphs).toBe(2);
    expect(summary.addresses).toEqual(["§1.1", "§1.1a", "§1.1.1", "§1.1.1a"]);
    expect(summary.filters).toBe("View.Spec(a), View.Level(1)");
    expect(summary.text).toBe("2 paragraphs, 2 headings hidden by View.Spec(a), View.Level(1).");
  });

  it("counts the sentences that f collapses, with their words", () => {
    const tree = parseDocument(SENTENCES);
    const summary = hiddenSummary(tree, { view: "f" });
    expect(summary.paragraphs).toBe(0);
    expect(summary.sentences).toBe(1);
    expect(summary.words).toBe(6);
    expect(summary.addresses).toEqual(["§0a"]);
    expect(summary.text).toBe("1 sentence (6 words) hidden by View.Spec(f).");
  });

  it("agrees with the projection on how many nodes are shown", () => {
    const tree = parseDocument(NESTED);
    const total = flattenNodes(tree).length;
    const shown = countProjected(projectTree(tree, "h", 2));
    const summary = hiddenSummary(tree, { view: "h", level: 2 });
    expect(summary.paragraphs + summary.headings).toBe(total - shown);
  });
});

describe("hiddenSummary for View.Brief", () => {
  it("counts sentences and words that the brief leaves out", () => {
    const tree = parseDocument("# A\n\nThe service MUST respond. Billing runs nightly. Fine.\n");
    const summary = hiddenSummary(tree, { view: "a", brief: 1 });
    expect(summary.paragraphs).toBe(0);
    expect(summary.sentences).toBe(2);
    expect(summary.words).toBe(4);
    expect(summary.filters).toBe("View.Brief(1)");
    expect(summary.text).toBe("2 sentences (4 words) hidden by View.Brief(1).");
  });

  it("counts a paragraph with no kept sentence as hidden", () => {
    const tree = parseDocument("# A\n\nThe service MUST respond.\n\nBilling runs nightly.\n");
    const summary = hiddenSummary(tree, { view: "a", brief: 1 });
    expect(summary.paragraphs).toBe(1);
    expect(summary.sentences).toBe(0);
    expect(summary.addresses).toEqual(["§1b"]);
    expect(summary.text).toBe("1 paragraph hidden by View.Brief(1).");
  });

  it("ignores the view code and level while a brief is on", () => {
    const tree = parseDocument(NESTED);
    const summary = hiddenSummary(tree, { view: "u", level: 1, brief: 9 });
    expect(summary.filters).toBe("View.Brief(9)");
    expect(summary.headings).toBe(0);
  });
});

describe("hiddenSummary is read-only and deterministic", () => {
  it("does not change the tree and returns the same summary twice", () => {
    const tree = parseDocument(NESTED);
    const before = JSON.stringify(tree);
    const first = hiddenSummary(tree, { view: "u", level: 2 });
    const second = hiddenSummary(tree, { view: "u", level: 2 });
    expect(second).toEqual(first);
    expect(JSON.stringify(tree)).toBe(before);
  });
});
