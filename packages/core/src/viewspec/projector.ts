import type { DocNode, DocumentTree, ProjectedNode, ViewSpecCode } from "../types.js";
import { countWords, sentenceSpans } from "../ast/classifier.js";
import { sentenceMatches } from "../analyzers/sentenceMatch.js";

/**
 * Pure, non-destructive projection. Nothing here mutates the input tree.
 * Nodes that fail the View-Spec predicate are dropped, and their visible descendants move up
 * to the nearest shown ancestor.
 */
export function isVisible(node: DocNode, code: ViewSpecCode): boolean {
  switch (code) {
    case "a":
    case "f":
      return true;
    case "h":
      return node.role === "Heading";
    case "u":
      return (node.role === "Claim" || node.role === "Assumption") && node.citations.length === 0;
    case "r":
      return (
        node.role === "Requirement" ||
        node.flags.some((flag) => flag.type === "CONTRADICTION" || flag.type === "BROKEN_REF")
      );
  }
}

/**
 * Keywords that keep a sentence visible under f. This list is wider than the audit's DEONTIC_PATTERN, which
 * decides node roles. MAY, OPTIONAL, and RECOMMENDED are RFC 2119 keywords that a reader must not miss, but they
 * do not make a node a Requirement, so the audit and the roles stay as they were.
 */
const FOCUS_KEYWORD = /\b(?:SHALL|MUST|REQUIRED|SHOULD|NEVER|PROHIBITED|MAY|OPTIONAL|RECOMMENDED)\b/;

/**
 * The 'f' text of a body node. A sentence is shown when it has a focus keyword or is the reason for one of
 * the node's flags. Each run of other sentences becomes "[+Nw]", the word count of that run. Shown sentences
 * keep their source text and separators. The first sentence is always shown, so no node is blank.
 */
function focusedDisplay(node: DocNode): { displayText: string; hiddenWords: number; hiddenSentences: number } {
  const text = node.rawText;
  const spans = sentenceSpans(text);
  const related = new Set(
    node.flags.flatMap((flag) => (flag.relatedCoordinate ? [flag.relatedCoordinate] : [])),
  );
  const keep = spans.map((span, index) => {
    if (index === 0) return true;
    const sentence = text.slice(span.start, span.end).replace(/\s+/g, " ").trim();
    return (
      FOCUS_KEYWORD.test(sentence) ||
      node.flags.some((flag) => sentenceMatches(sentence, flag.type, node, related))
    );
  });
  if (keep.every(Boolean)) return { displayText: text, hiddenWords: 0, hiddenSentences: 0 };
  const hiddenSentences = keep.filter((shown) => !shown).length;

  const out: string[] = [];
  let hiddenWords = 0;
  let run = 0;
  let previousEnd = -1;
  spans.forEach((span, index) => {
    const slice = text.slice(span.start, span.end);
    if (!keep[index]) {
      run += countWords(slice);
      return;
    }
    if (run > 0) {
      if (out.length > 0) out.push(" ");
      out.push(`[+${run}w]`);
      hiddenWords += run;
      run = 0;
      previousEnd = -1;
    }
    if (out.length > 0) out.push(previousEnd >= 0 ? text.slice(previousEnd, span.start) : " ");
    out.push(slice);
    previousEnd = span.end;
  });
  if (run > 0) {
    if (out.length > 0) out.push(" ");
    out.push(`[+${run}w]`);
    hiddenWords += run;
  }
  return { displayText: out.join(""), hiddenWords, hiddenSentences };
}

/**
 * Sentences and words that the f view collapses inside one paragraph. Zero for headings, and for a
 * paragraph whose sentences all show under f.
 */
export function focusHidden(node: DocNode): { sentences: number; words: number } {
  if (node.role === "Heading") return { sentences: 0, words: 0 };
  const focused = focusedDisplay(node);
  return { sentences: focused.hiddenSentences, words: focused.hiddenWords };
}

function display(node: DocNode, code: ViewSpecCode): { displayText: string; truncated: boolean } {
  if (code === "f" && node.role !== "Heading") {
    const focused = focusedDisplay(node);
    return { displayText: focused.displayText, truncated: focused.hiddenWords > 0 };
  }
  return { displayText: node.rawText, truncated: false };
}

export function flattenProjected(nodes: readonly ProjectedNode[]): ProjectedNode[] {
  const out: ProjectedNode[] = [];
  const visit = (list: readonly ProjectedNode[]): void => {
    for (const item of list) {
      out.push(item);
      visit(item.children);
    }
  };
  visit(nodes);
  return out;
}

export function countProjected(nodes: readonly ProjectedNode[]): number {
  return flattenProjected(nodes).length;
}

/**
 * Level of a node for View.Level clipping. A heading's level is its depth. A body node takes the
 * level of the heading that owns it, because the parser gives body nodes depth = parent + 1, which
 * is not their heading level. Text before the first heading has level 0 and is never clipped.
 */
function levelOf(node: DocNode, ownerLevel: number): number {
  return node.role === "Heading" ? node.depth : ownerLevel;
}

/**
 * `level` is the optional View.Level clip. A node whose level is deeper than `level` is removed
 * with its whole subtree, as in NLS level clipping, and its children are not promoted. The clip
 * runs before the view predicate, so the result is the intersection of the two filters.
 */
function projectNodes(
  nodes: readonly DocNode[],
  code: ViewSpecCode,
  level: number | undefined,
  ownerLevel: number,
): ProjectedNode[] {
  const out: ProjectedNode[] = [];
  for (const node of nodes) {
    const nodeLevel = levelOf(node, ownerLevel);
    if (level !== undefined && nodeLevel > level) continue;
    const children = projectNodes(node.children, code, level, nodeLevel);
    if (!isVisible(node, code)) {
      out.push(...children);
      continue;
    }
    const shown = new Set(flattenProjected(children).map((item) => item.node.id));
    const { displayText, truncated } = display(node, code);
    out.push({
      node,
      displayText,
      collapsed: node.children.some((child) => !shown.has(child.id)),
      truncated,
      children,
    });
  }
  return out;
}

/**
 * Projects the tree under a view code and an optional View.Level clip (a positive integer).
 * Omit `level` for the view-only projection.
 */
export function projectTree(tree: DocumentTree, code: ViewSpecCode, level?: number): ProjectedNode[] {
  return projectNodes(tree.rootNodes, code, level, 0);
}
