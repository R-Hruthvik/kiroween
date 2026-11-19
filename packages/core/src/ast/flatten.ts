import type { DocNode, DocumentTree } from "../types.js";

/** Pre-order (document order) list of every node in the given forest. */
export function flattenNodeList(nodes: readonly DocNode[]): DocNode[] {
  const out: DocNode[] = [];
  const visit = (list: readonly DocNode[]): void => {
    for (const node of list) {
      out.push(node);
      visit(node.children);
    }
  };
  visit(nodes);
  return out;
}

export function flattenNodes(tree: DocumentTree): DocNode[] {
  return flattenNodeList(tree.rootNodes);
}

/** Canonical source text: each node's rawText in document order, separated by blank lines. */
export function serializeTree(tree: DocumentTree): string {
  return flattenNodes(tree)
    .map((node) => node.rawText)
    .join("\n\n");
}
