import type { DocNode, DocumentTree, NodeFlag } from "../types.js";
import { brokenRefFlags, classificationFlags, isCodeFence } from "../ast/classifier.js";
import { citationKeyFlags, collectReferenceKeys } from "../ast/citations.js";
import { flattenNodes } from "../ast/flatten.js";
import { detectContradictions } from "./contradiction.js";
import { vagueTermsIn } from "./vague.js";

export function vagueTermFlags(text: string): NodeFlag[] {
  return vagueTermsIn(text).map((term) => ({
    type: "AMBIGUOUS_TERM",
    message: `Vague term "${term}" needs a measurable target.`,
  }));
}

/** Full recomputation of every flag type from the text. Does not mutate the tree. */
export function computeAuditFlags(tree: DocumentTree): Map<string, NodeFlag[]> {
  const nodes = flattenNodes(tree);
  const contradictions = detectContradictions(nodes);
  const referenceKeys = collectReferenceKeys(nodes);
  const flagsById = new Map<string, NodeFlag[]>();
  for (const node of nodes) {
    flagsById.set(node.id, [
      ...brokenRefFlags(node.rawText, tree.indexByCoord),
      ...citationFlagsFor(node, referenceKeys),
      ...classificationFlags(node.role, node.citations, node.rawText),
      ...vagueTermFlags(node.rawText),
      ...(contradictions.get(node.id) ?? []),
    ]);
  }
  return flagsById;
}

function citationFlagsFor(node: DocNode, keys: ReadonlySet<string>): NodeFlag[] {
  return isCodeFence(node.rawText) ? [] : citationKeyFlags(node.rawText, keys);
}

/**
 * Recomputes the reference and unverified-claim flags, including orphan citations. Keeps the
 * other flags as they are.
 */
export function citeVerifyFlags(tree: DocumentTree): Map<string, NodeFlag[]> {
  const nodes = flattenNodes(tree);
  const referenceKeys = collectReferenceKeys(nodes);
  const flagsById = new Map<string, NodeFlag[]>();
  for (const node of nodes) {
    const kept = node.flags.filter(
      (flag) => flag.type !== "BROKEN_REF" && flag.type !== "UNVERIFIED_CLAIM",
    );
    flagsById.set(node.id, [
      ...brokenRefFlags(node.rawText, tree.indexByCoord),
      ...citationFlagsFor(node, referenceKeys),
      ...classificationFlags(node.role, node.citations, node.rawText),
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
