import { describe, it, expect } from "vitest";
import { parseDocument, flattenNodes } from "../src/index.js";

/** Messages of every BROKEN_REF flag the parser attaches to the document. */
function brokenRefMessages(markdown: string): string[] {
  return flattenNodes(parseDocument(markdown))
    .flatMap((node) => node.flags)
    .filter((flag) => flag.type === "BROKEN_REF")
    .map((flag) => flag.message);
}

const UNRESOLVED_KEY_ONE = "Citation [Key05] has no matching entry in the references section.";

describe("references section headings (Bug 1)", () => {
  const headings = [
    "## References",
    "## 9 References",
    "## 9. References",
    "## 14.1. Normative References",
    "## Informative References",
    "## Normative References",
    "# Sources",
    "## Bibliography",
  ];

  for (const heading of headings) {
    it(`treats "${heading}" as a references section`, () => {
      const markdown = `## A\n\nSee [Key05].\n\n${heading}\n\n[Key05] Title of the source.\n`;
      expect(brokenRefMessages(markdown)).toEqual([]);
    });
  }

  it("matches headings case-insensitively", () => {
    expect(brokenRefMessages("## A\n\nSee [Key05].\n\n## REFERENCES\n\n[Key05] Title.\n")).toEqual([]);
  });

  const unrelated = ["## Cross-References in the UI", "## Reference Implementation"];

  for (const heading of unrelated) {
    it(`does not treat "${heading}" as a references section`, () => {
      // The body citation and the "[Key05] Title" entry line are both unresolved.
      const markdown = `## A\n\nSee [Key05].\n\n${heading}\n\n[Key05] Title of the source.\n`;
      expect(brokenRefMessages(markdown)).toEqual([UNRESOLVED_KEY_ONE, UNRESOLVED_KEY_ONE]);
    });
  }
});

describe("reference definitions with the key alone on its line (Bug 2)", () => {
  it("resolves keys whose title is wrapped onto the following lines", () => {
    const markdown = [
      "## A",
      "",
      "See [W3C.REC-html401-19991224] and [GoodDhamijaEtAl05].",
      "",
      "## 16 References",
      "",
      "[W3C.REC-html401-19991224]",
      '   Raggett, D., "HTML 4.01 Specification", December 1999,',
      "   <http://www.w3.org/TR/1999/REC-html401-19991224/>.",
      "",
      "[GoodDhamijaEtAl05]",
      '   Good, N., Dhamija, R., and J. Konstan, "Stopping Spyware",',
      "   2005.",
      "",
    ].join("\n");
    expect(brokenRefMessages(markdown)).toEqual([]);
  });

  it("still flags a key that is missing from the references section", () => {
    const markdown = "## A\n\nSee [GoodDhamijaEtAl05] and [BeckTews09].\n\n## References\n\n[GoodDhamijaEtAl05]\n   Good, N., 2005.\n";
    expect(brokenRefMessages(markdown)).toEqual([
      "Citation [BeckTews09] has no matching entry in the references section.",
    ]);
  });

  it("does not treat a bare bracketed key outside a references section as a definition", () => {
    // The body citation and the bare "[Key05]" paragraph are both unresolved.
    const markdown = "## A\n\nSee [Key05].\n\n[Key05]\n\n## Notes\n\nNothing here.\n";
    expect(brokenRefMessages(markdown)).toEqual([UNRESOLVED_KEY_ONE, UNRESOLVED_KEY_ONE]);
  });
});
