import { describe, it, expect } from "vitest";
import {
  parseDocument,
  flattenNodes,
  projectTree,
  flattenProjected,
  computeAuditFlags,
  applyFlags,
  focusHidden,
} from "../src/index.js";
import type { DocumentTree, ProjectedNode } from "../src/types.js";

function displayOf(tree: DocumentTree, coordinate: string): string {
  const all: ProjectedNode[] = flattenProjected(projectTree(tree, "f"));
  const found = all.find((item) => item.node.coordinate === coordinate);
  if (!found) throw new Error(`${coordinate} is not visible in f`);
  return found.displayText;
}

describe("View.Spec(f) shows every modal sentence (F5)", () => {
  it("keeps a requirement that follows a plain first sentence", () => {
    const tree = parseDocument("## A\n\nIntro sentence is plain. More plain words here. The gateway SHALL respond within 50 ms.\n");
    expect(displayOf(tree, "§1a")).toBe("Intro sentence is plain. [+4w] The gateway SHALL respond within 50 ms.");
  });

  it("shows all modal sentences of a paragraph and collapses only the rest", () => {
    const body = [
      "The service runs on v2.1.",
      "It MUST reject requests over 10 MB.",
      "Background tasks run nightly in a quiet window.",
      "It MUST log each rejection.",
      "Operators read the dashboard on Monday.",
      "It SHOULD keep the dashboard current.",
    ].join(" ");
    const tree = parseDocument(`## A\n\n${body}\n`);
    const shown = displayOf(tree, "§1a");
    for (const modal of ["It MUST reject requests over 10 MB.", "It MUST log each rejection.", "It SHOULD keep the dashboard current."]) {
      expect(shown).toContain(modal);
    }
    expect(shown).toBe(
      "The service runs on v2.1. It MUST reject requests over 10 MB. [+8w] It MUST log each rejection. [+6w] It SHOULD keep the dashboard current.",
    );
  });

  it("shows a flagged sentence that has no modal keyword", () => {
    const tree = parseDocument(
      "## A\n\nIntro words are plain here. Responses take 200 ms in total. Ending words are plain.\n\nThe system SHALL respond within 50 ms.\n",
    );
    const audited = applyFlags(tree, computeAuditFlags(tree));
    expect(displayOf(audited, "§1a")).toBe("Intro words are plain here. Responses take 200 ms in total. [+4w]");
  });

  it("keeps the text unchanged when every sentence is shown", () => {
    const text = "The service runs on v2.1. It MUST reject requests.";
    const tree = parseDocument(`## A\n\n${text}\n`);
    expect(displayOf(tree, "§1a")).toBe(text);
  });

  it("does not change the tree (INV-1)", () => {
    const tree = parseDocument("## A\n\nIntro sentence is plain. More plain words here. The gateway SHALL respond.\n");
    const before = JSON.stringify(tree);
    projectTree(tree, "f");
    projectTree(tree, "f", 1);
    expect(JSON.stringify(tree)).toBe(before);
    expect(flattenNodes(tree).find((node) => node.coordinate === "§1a")?.rawText).toBe(
      "Intro sentence is plain. More plain words here. The gateway SHALL respond.",
    );
  });
});

describe("View.Spec(f) keeps the optional RFC 2119 keywords (carry-over A)", () => {
  const BODY =
    "Background work runs nightly in a quiet window. The client MAY retry failed calls. Logs are read on Monday. Servers OPTIONAL headers are ignored. Clients RECOMMENDED to cache results. Dashboards are reviewed weekly.";

  it("shows every MAY, OPTIONAL, and RECOMMENDED sentence and collapses the rest", () => {
    const tree = parseDocument(`## A\n\n${BODY}\n`);
    expect(displayOf(tree, "§1a")).toBe(
      "Background work runs nightly in a quiet window. The client MAY retry failed calls. [+5w] Servers OPTIONAL headers are ignored. Clients RECOMMENDED to cache results. [+4w]",
    );
  });

  it("keeps MAY sentences that have no other modal", () => {
    const tree = parseDocument("## A\n\nIntro plain words here. The gateway MAY cache responses.\n");
    expect(displayOf(tree, "§1a")).toBe("Intro plain words here. The gateway MAY cache responses.");
  });

  it("does not change node roles or audit flags", () => {
    const tree = parseDocument(`## A\n\n${BODY}\n`);
    const node = flattenNodes(tree).find((candidate) => candidate.coordinate === "§1a");
    expect(node?.role).toBe("Prose");
    const audited = applyFlags(tree, computeAuditFlags(tree));
    expect(flattenNodes(audited).find((candidate) => candidate.coordinate === "§1a")?.flags).toEqual([]);
  });

  it("counts hidden sentences with the same rule the projection uses", () => {
    const tree = parseDocument(`## A\n\n${BODY}\n`);
    const node = flattenNodes(tree).find((candidate) => candidate.coordinate === "§1a");
    expect(node).toBeDefined();
    expect(focusHidden(node!)).toEqual({ sentences: 2, words: 9 });
  });
});
