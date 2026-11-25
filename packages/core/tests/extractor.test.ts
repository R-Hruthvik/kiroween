import { describe, it, expect } from "vitest";
import { parseDocument, buildTaskChecklist, flattenNodes, tightenText } from "../src/index.js";
import { splitSentences } from "../src/ast/classifier.js";

function taskLines(markdown: string): string[] {
  return buildTaskChecklist(parseDocument(markdown)).split("\n");
}

describe("Outline.ExtractTasks: one task per modal sentence (F3)", () => {
  it("lists every requirement sentence in a paragraph, not only the first sentence", () => {
    const lines = taskLines("## A\n\nThe system MUST NOT store raw card numbers. It SHALL NOT log passwords.\n");
    expect(lines).toEqual([
      "- [ ] **P1** §1a The system MUST NOT store raw card numbers.",
      "- [ ] **P1** §1a It SHALL NOT log passwords.",
    ]);
  });

  it("does not list a non-modal sentence from a requirement paragraph", () => {
    const lines = taskLines("## A\n\nThe system SHALL log each request. It is basically a simple email.\n");
    expect(lines).toEqual(["- [ ] **P1** §1a The system SHALL log each request."]);
  });

  it("splits a bulleted list into one task per item", () => {
    const lines = taskLines(
      "## A\n\n- GET and HEAD MUST be safe.\n- PUT and PATCH MAY carry a body up to 10 MB.\n- DELETE SHALL be idempotent. The endpoint MUST NOT return 200 on a missing key.\n",
    );
    expect(lines).toEqual([
      "- [ ] **P1** §1a GET and HEAD MUST be safe.",
      "- [ ] **P1** §1a DELETE SHALL be idempotent.",
      "- [ ] **P1** §1a The endpoint MUST NOT return 200 on a missing key.",
    ]);
  });

  it("shows the flagged sentence for a flagged node that has no modal sentence", () => {
    const lines = taskLines("## A\n\nThe system SHALL respond within 50 ms.\n\nResponses take 200 ms.\n");
    expect(lines.some((line) => line.startsWith("- [ ] **P0** §1b Responses take 200 ms.") && line.includes("CONTRADICTION"))).toBe(true);
  });

  it("returns the empty message when there is nothing to list", () => {
    expect(buildTaskChecklist(parseDocument("## A\n\nPlain prose.\n"))).toBe("No requirements or flagged nodes found.");
  });
});

describe("splitSentences: list items and lookahead (F3)", () => {
  it("starts a new sentence at each list item and drops the marker", () => {
    expect(splitSentences("- first item\n- second item\n  continues here.")).toEqual([
      "first item",
      "second item continues here.",
    ]);
  });

  it("splits numbered items", () => {
    expect(splitSentences("1. Alpha.\n2) Beta.")).toEqual(["Alpha.", "Beta."]);
  });

  it("splits before a bold or backtick sentence start", () => {
    expect(splitSentences("Done here. **Note** more. Use `x` now.")).toEqual(["Done here.", "**Note** more.", "Use `x` now."]);
  });
});

describe("sentence splitting keeps abbreviations together (F4)", () => {
  it("does not end a sentence after Dr., approx., Fig., U.S., or an initial", () => {
    expect(splitSentences("Dr. Patel approved the design, approx. 40 people reviewed it.")).toEqual([
      "Dr. Patel approved the design, approx. 40 people reviewed it.",
    ]);
    expect(splitSentences("Dr. Patel approved the design. Fig. 3 shows the flow.")).toEqual([
      "Dr. Patel approved the design.",
      "Fig. 3 shows the flow.",
    ]);
    expect(splitSentences("The U.S. team ships on Monday. J. R. Tolkien wrote it.")).toEqual([
      "The U.S. team ships on Monday.",
      "J. R. Tolkien wrote it.",
    ]);
  });

  it("still ends a sentence after a lowercase no or a normal word", () => {
    expect(splitSentences("The answer is no. The next step is yes.")).toEqual([
      "The answer is no.",
      "The next step is yes.",
    ]);
  });

  it("keeps Dr. Patel in the f View-Spec opening sentence", () => {
    const tree = parseDocument("## A\n\nDr. Patel approved the design, approx. 40 people reviewed it.\n");
    const node = flattenNodes(tree).find((item) => item.coordinate === "§1a");
    expect(node?.firstSentence).toBe("Dr. Patel approved the design, approx. 40 people reviewed it.");
    expect(node?.hiddenWordCount).toBe(0);
  });

  it("does not capitalize the word after e.g. when Spec.Tighten removes a filler word", () => {
    expect(tightenText("Use big payloads, e.g. very large ones, sparingly.")).toBe(
      "Use big payloads, e.g. large ones, sparingly.",
    );
  });
});
