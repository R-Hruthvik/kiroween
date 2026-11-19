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

function projectNodes(nodes: readonly DocNode[], code: ViewSpecCode): ProjectedNode[] {
  const out: ProjectedNode[] = [];
  for (const node of nodes) {
    const children = projectNodes(node.children, code);
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

export function projectTree(tree: DocumentTree, code: ViewSpecCode): ProjectedNode[] {
  return projectNodes(tree.rootNodes, code);
}
