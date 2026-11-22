import type { DocNode, DocumentTree, ProjectedNode, ViewSpecCode } from "../types.js";

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

function display(node: DocNode, code: ViewSpecCode): { displayText: string; truncated: boolean } {
  if (code === "f" && node.role !== "Heading" && node.hiddenWordCount > 0) {
    return {
      displayText: `${node.firstSentence} [+${node.hiddenWordCount}w]`,
      truncated: true,
    };
  }
  if (code === "f" && node.role !== "Heading") {
    return { displayText: node.firstSentence, truncated: false };
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
