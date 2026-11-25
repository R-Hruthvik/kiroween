import type { DocNode, DocumentTree, FlagType } from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { hasModalKeyword, isCodeFence, splitSentences } from "../ast/classifier.js";
import { computeAuditFlags } from "./audit.js";
import { sentenceMatches } from "./sentenceMatch.js";

const EXCERPT_ORDER: readonly FlagType[] = ["CONTRADICTION", "BROKEN_REF", "UNVERIFIED_CLAIM", "AMBIGUOUS_TERM"];

/**
 * The sentence that triggered the node's flags, so the checklist does not show an unrelated opening
 * sentence. Falls back to the first sentence when no sentence matches.
 */
export function flaggedExcerpt(node: DocNode, flagTypes: ReadonlySet<FlagType>, related: ReadonlySet<string>): string {
  const sentences = splitSentences(node.rawText);
  for (const type of EXCERPT_ORDER) {
    if (!flagTypes.has(type)) continue;
    const hit = sentences.find((sentence) => sentenceMatches(sentence, type, node, related));
    if (hit !== undefined) return hit;
  }
  return node.firstSentence;
}

/**
 * Builds a prioritized Markdown checklist of Requirement nodes and flagged nodes.
 * P0: CONTRADICTION or BROKEN_REF. P1: other Requirements. P2: other flagged nodes.
 * Each sentence with a modal keyword gets its own line, so a paragraph with several requirements
 * shows all of them. A node with no modal sentence shows its flagged sentence, as before.
 * Ties keep document order.
 */
export function buildTaskChecklist(tree: DocumentTree, scopeIds?: ReadonlySet<string>): string {
  const flags = computeAuditFlags(tree);
  const items = flattenNodes(tree)
    .map((node, order) => ({ node, order, flags: flags.get(node.id) ?? [] }))
    .filter(({ node, flags: nodeFlags }) => {
      if (scopeIds && scopeIds.size > 0 && !scopeIds.has(node.id)) return false;
      return node.role === "Requirement" || nodeFlags.length > 0;
    })
    .map((item) => {
      const types = new Set(item.flags.map((flag) => flag.type));
      const priority =
        types.has("CONTRADICTION") || types.has("BROKEN_REF")
          ? 0
          : item.node.role === "Requirement"
            ? 1
            : 2;
      const related = new Set(
        item.flags.flatMap((flag) => (flag.relatedCoordinate ? [flag.relatedCoordinate] : [])),
      );
      return { ...item, priority, types: [...types], related };
    })
    .sort((a, b) => a.priority - b.priority || a.order - b.order);

  if (items.length === 0) return "No requirements or flagged nodes found.";
  const lines: string[] = [];
  for (const { node, priority, types, related } of items) {
    const modalSentences = isCodeFence(node.rawText)
      ? []
      : splitSentences(node.rawText).filter(hasModalKeyword);
    if (modalSentences.length === 0) {
      const suffix = types.length > 0 ? ` (${types.join(", ")})` : "";
      const excerpt = flaggedExcerpt(node, new Set(types), related);
      lines.push(`- [ ] **P${priority}** ${node.coordinate} ${excerpt}${suffix}`);
      continue;
    }
    for (const sentence of modalSentences) {
      const matched = types.filter((type) => sentenceMatches(sentence, type, node, related));
      const suffix = matched.length > 0 ? ` (${matched.join(", ")})` : "";
      lines.push(`- [ ] **P${priority}** ${node.coordinate} ${sentence}${suffix}`);
    }
  }
  return lines.join("\n");
}
