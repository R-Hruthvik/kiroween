import { describe, it, expect } from "vitest";
import { parseDocument, flattenNodes, computeAuditFlags } from "../src/index.js";
import { citeVerifyFlags } from "../src/analyzers/audit.js";
import { proseForAudit } from "../src/ast/markdown.js";
import type { DocNode, DocumentTree, NodeFlag } from "../src/types.js";

function nodeStartingWith(tree: DocumentTree, prefix: string): DocNode {
  const found = flattenNodes(tree).find((node) => node.rawText.startsWith(prefix));
  if (!found) throw new Error(`no node starts with ${prefix}`);
  return found;
}

function flagsOf(flags: readonly NodeFlag[] | undefined, type: NodeFlag["type"]): NodeFlag[] {
  return (flags ?? []).filter((flag) => flag.type === type);
}

/** Flags on a node after a full Spec.Audit recomputation. */
function auditedFlags(tree: DocumentTree, node: DocNode): NodeFlag[] {
  return computeAuditFlags(tree).get(node.id) ?? [];
}

describe("§ references inside code fences are not broken references", () => {
  const FENCE_DOC = "```md\nSee §99 for details.\n```\n\nBody.";

  it("does not flag a § reference inside a fence at parse time or in either audit path", () => {
    const tree = parseDocument(FENCE_DOC);
    const fence = nodeStartingWith(tree, "```md");
    expect(flagsOf(fence.flags, "BROKEN_REF")).toEqual([]);
    expect(flagsOf(auditedFlags(tree, fence), "BROKEN_REF")).toEqual([]);
    expect(flagsOf(citeVerifyFlags(tree).get(fence.id), "BROKEN_REF")).toEqual([]);
  });

  it("still flags a missing § reference in a plain paragraph in all three paths", () => {
    const tree = parseDocument("# A\n\nSee §99.\n");
    const paragraph = nodeStartingWith(tree, "See §99.");
    expect(flagsOf(paragraph.flags, "BROKEN_REF")).toHaveLength(1);
    expect(flagsOf(auditedFlags(tree, paragraph), "BROKEN_REF")).toHaveLength(1);
    expect(flagsOf(citeVerifyFlags(tree).get(paragraph.id), "BROKEN_REF")).toHaveLength(1);
  });

  it("does not flag an inline § example in backticks", () => {
    const tree = parseDocument("# A\n\nWrite `§99` to link.\n");
    const paragraph = nodeStartingWith(tree, "Write");
    expect(flagsOf(paragraph.flags, "BROKEN_REF")).toEqual([]);
    expect(flagsOf(auditedFlags(tree, paragraph), "BROKEN_REF")).toEqual([]);
  });
});

describe("HTML comments are not prose", () => {
  it("reads only the visible sentence when a paragraph has a comment on the same block", () => {
    const tree = parseDocument("## A\n\n<!-- Describe the target, e.g. fast, under 5 ms -->\nThe cache is fast.\n");
    const body = nodeStartingWith(tree, "<!--");
    const flags = auditedFlags(tree, body);
    expect(flagsOf(flags, "AMBIGUOUS_TERM").map((flag) => flag.message)).toEqual([
      'Vague term "fast" needs a measurable target.',
    ]);
    expect(flagsOf(flags, "UNVERIFIED_CLAIM")).toEqual([]);
  });

  it("gives the comment paragraph no flags and the visible paragraph one AMBIGUOUS_TERM", () => {
    const tree = parseDocument("## A\n\n<!-- Describe the target, e.g. fast, under 5 ms -->\n\nThe cache is fast.\n");
    const comment = nodeStartingWith(tree, "<!--");
    const visible = nodeStartingWith(tree, "The cache is fast.");
    expect(flagsOf(auditedFlags(tree, comment), "AMBIGUOUS_TERM")).toEqual([]);
    expect(flagsOf(auditedFlags(tree, comment), "UNVERIFIED_CLAIM")).toEqual([]);
    expect(flagsOf(auditedFlags(tree, visible), "AMBIGUOUS_TERM").map((flag) => flag.message)).toEqual([
      'Vague term "fast" needs a measurable target.',
    ]);
  });

  it("gives a paragraph that is only a comment no AMBIGUOUS_TERM and no UNVERIFIED_CLAIM", () => {
    const tree = parseDocument("## A\n\n<!-- Describe the target, e.g. fast, under 5 ms -->\n");
    const comment = nodeStartingWith(tree, "<!--");
    const flags = auditedFlags(tree, comment);
    expect(flagsOf(flags, "AMBIGUOUS_TERM")).toEqual([]);
    expect(flagsOf(flags, "UNVERIFIED_CLAIM")).toEqual([]);
  });
});

describe("inline code and headings are not prose", () => {
  it("does not flag a vague word inside inline code", () => {
    const tree = parseDocument("## A\n\nUse `fast` for the hot path.\n");
    const body = nodeStartingWith(tree, "Use");
    expect(flagsOf(auditedFlags(tree, body), "AMBIGUOUS_TERM")).toEqual([]);
  });

  it("does not flag a vague word in a heading", () => {
    const tree = parseDocument("## Scalable tier\n\nThe tier is priced monthly.\n");
    const heading = nodeStartingWith(tree, "## Scalable tier");
    expect(flagsOf(auditedFlags(tree, heading), "AMBIGUOUS_TERM")).toEqual([]);
  });
});

describe("URLs are not prose", () => {
  it("does not flag a vague word inside a visible URL", () => {
    const tree = parseDocument("## A\n\nThe spec is at https://example.com/fast/5ms and is complete.\n");
    const body = nodeStartingWith(tree, "The spec is at");
    const flags = auditedFlags(tree, body);
    expect(flagsOf(flags, "AMBIGUOUS_TERM")).toEqual([]);
    expect(flagsOf(flags, "UNVERIFIED_CLAIM")).toEqual([]);
  });

  it("still flags a vague word that is visible prose next to a URL", () => {
    const tree = parseDocument("## A\n\nThe URL https://example.com/fast is robust.\n");
    const body = nodeStartingWith(tree, "The URL");
    expect(flagsOf(auditedFlags(tree, body), "AMBIGUOUS_TERM").map((flag) => flag.message)).toEqual([
      'Vague term "robust" needs a measurable target.',
    ]);
  });
});

describe("proseForAudit", () => {
  it("removes a comment that spans several lines", () => {
    const prose = proseForAudit("Keep this.\n<!--\nfast\n5 ms\n-->\nAnd this.");
    expect(prose.replace(/\s+/g, " ").trim()).toBe("Keep this. And this.");
  });

  it("removes an unterminated comment to the end of the text", () => {
    const prose = proseForAudit("Visible text.\n<!-- never closed, fast, 5 ms\nmore fast");
    expect(prose.replace(/\s+/g, " ").trim()).toBe("Visible text.");
  });

  it("closes a fence when the closing run is longer than the opening run", () => {
    const prose = proseForAudit("```\nfast inside\n````\nAfter the change.");
    expect(prose.replace(/\s+/g, " ").trim()).toBe("After the change.");
  });

  it("runs an unclosed fence to the end of the text", () => {
    const prose = proseForAudit("Intro.\n~~~\nfast\nmore fast");
    expect(prose.replace(/\s+/g, " ").trim()).toBe("Intro.");
  });
});
