import { describe, it, expect } from "vitest";
import { parseDocument, flattenNodes, letterSuffix } from "../src/index.js";
import { appendMarkdown, openFenceMarker } from "../src/ast/parser.js";

describe("code fences (K3/G11)", () => {
  it("never parses # lines inside a backtick fence as headings", () => {
    const tree = parseDocument("# Install\n\n```bash\n# install deps\nnpm i\n```\n\nDone.\n");
    const nodes = flattenNodes(tree);
    expect(nodes.filter((n) => n.role === "Heading").map((n) => n.rawText)).toEqual(["# Install"]);
    expect(nodes.map((n) => n.coordinate)).toEqual(["§1", "§1a", "§1b"]);
    expect(nodes[1]?.rawText).toBe("```bash\n# install deps\nnpm i\n```");
  });

  it("treats tilde fences the same way and keeps blank lines inside one block", () => {
    const tree = parseDocument("# A\n\n~~~\n# one\n\n# two\n~~~\n");
    const nodes = flattenNodes(tree);
    expect(nodes.map((n) => n.coordinate)).toEqual(["§1", "§1a"]);
    expect(nodes[1]?.rawText).toBe("~~~\n# one\n\n# two\n~~~");
  });

  it("does not let a shorter closing run end a longer fence", () => {
    const tree = parseDocument("# A\n\n````\n```\n# still code\n````\n\nAfter.\n");
    expect(flattenNodes(tree).map((n) => n.coordinate)).toEqual(["§1", "§1a", "§1b"]);
  });

  it("closes an open fence before appended text, so injected paragraphs stay outside code", () => {
    const tree = parseDocument("# A\n\n```\nunterminated");
    expect(openFenceMarker("```\nunterminated")).toBe("```");
    const appended = appendMarkdown(tree, "Appended paragraph.");
    const reparsed = parseDocument(appended);
    expect(flattenNodes(reparsed).map((n) => n.rawText)).toContain("Appended paragraph.");
  });
});

describe("base-26 body letters beyond z (mutation gap)", () => {
  it("maps index 25 to z, 26 to aa, and 701 to zz, then 702 to aaa", () => {
    expect(letterSuffix(25)).toBe("z");
    expect(letterSuffix(26)).toBe("aa");
    expect(letterSuffix(51)).toBe("az");
    expect(letterSuffix(52)).toBe("ba");
    expect(letterSuffix(701)).toBe("zz");
    expect(letterSuffix(702)).toBe("aaa");
  });

  it("gives the 27th and 28th paragraphs under one heading the suffixes aa and ab", () => {
    const body = Array.from({ length: 28 }, (_, i) => `Paragraph ${i + 1} is plain.`).join("\n\n");
    const tree = parseDocument(`# A\n\n${body}\n`);
    const coords = flattenNodes(tree).map((n) => n.coordinate);
    expect(coords).toContain("§1z");
    expect(coords).toContain("§1aa");
    expect(coords).toContain("§1ab");
    expect(new Set(coords).size).toBe(coords.length);
  });
});
