import type { DocumentTree } from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { computeAuditFlags } from "./audit.js";

/**
 * Builds a prioritized Markdown checklist of Requirement nodes and flagged nodes.
 * P0: CONTRADICTION or BROKEN_REF. P1: other Requirements. P2: other flagged nodes.
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
      return { ...item, priority, types: [...types] };
    })
    .sort((a, b) => a.priority - b.priority || a.order - b.order);

  if (items.length === 0) return "No requirements or flagged nodes found.";
  return items
    .map(({ node, priority, types }) => {
      const suffix = types.length > 0 ? ` (${types.join(", ")})` : "";
      return `- [ ] **P${priority}** ${node.coordinate} ${node.firstSentence}${suffix}`;
    })
    .join("\n");
}
