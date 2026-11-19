import type { DocNode, DocumentTree, NodeFlag } from "../types.js";
import { brokenRefFlags, classificationFlags } from "../ast/classifier.js";
import { flattenNodes } from "../ast/flatten.js";
import { detectContradictions } from "./contradiction.js";

const VAGUE_TERM = /\b(fast|scalable|TBD)\b/gi;

export function vagueTermFlags(text: string): NodeFlag[] {
  const seen = new Set<string>();
  const flags: NodeFlag[] = [];
  for (const match of text.matchAll(VAGUE_TERM)) {
    const term = (match[1] ?? "").toLowerCase();
    if (seen.has(term)) continue;
    seen.add(term);
    flags.push({
      type: "AMBIGUOUS_TERM",
      message: `Vague term "${term}" needs a measurable target.`,
    });
  }
  return flags;
}

/** Full recomputation of every flag type from the text. Does not mutate the tree. */
export function computeAuditFlags(tree: DocumentTree): Map<string, NodeFlag[]> {
  const nodes = flattenNodes(tree);
  const contradictions = detectContradictions(nodes);
  const flagsById = new Map<string, NodeFlag[]>();
  for (const node of nodes) {
    flagsById.set(node.id, [
      ...brokenRefFlags(node.rawText, tree.indexByCoord),
      ...classificationFlags(node.role, node.citations),
      ...vagueTermFlags(node.rawText),
      ...(contradictions.get(node.id) ?? []),
    ]);
  }
  return flagsById;
}

/** Recomputes only the reference and unverified-claim flags. Keeps other flags as they are. */
export function citeVerifyFlags(tree: DocumentTree): Map<string, NodeFlag[]> {
  const flagsById = new Map<string, NodeFlag[]>();
  for (const node of flattenNodes(tree)) {
    const kept = node.flags.filter(
      (flag) => flag.type !== "BROKEN_REF" && flag.type !== "UNVERIFIED_CLAIM",
    );
    flagsById.set(node.id, [
      ...brokenRefFlags(node.rawText, tree.indexByCoord),
      ...classificationFlags(node.role, node.citations),
      ...kept,
    ]);
  }
  return flagsById;
}

/** Returns a new tree with the given flags. Text, coordinates, and ids stay the same. */
export function applyFlags(tree: DocumentTree, flagsById: ReadonlyMap<string, NodeFlag[]>): DocumentTree {
  const withFlags = (nodes: readonly DocNode[]): DocNode[] =>
    nodes.map((node) => ({
      ...node,
      flags: flagsById.get(node.id) ?? [],
      children: withFlags(node.children),
    }));
  return { ...tree, rootNodes: withFlags(tree.rootNodes) };
}

export function flagCount(tree: DocumentTree): number {
  return flattenNodes(tree).reduce((total, node) => total + node.flags.length, 0);
}
