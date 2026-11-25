// Find.Look (literal text search) and Link.Back (paragraphs that cite a § address). Read-only, pure, and deterministic.
import type { AddressExcerpt, DocumentTree } from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { REF_PATTERN, coordinatesMentioned } from "../ast/coordinate.js";

/** Characters kept on each side of a match in an excerpt. */
const EXCERPT_RADIUS = 40;

/**
 * The text around one match, with whitespace runs collapsed. "..." marks a cut at either end. The
 * match is the text at [start, start + length) in `text`.
 */
export function excerptAround(text: string, start: number, length: number): string {
  const from = Math.max(0, start - EXCERPT_RADIUS);
  const to = Math.min(text.length, start + length + EXCERPT_RADIUS);
  const middle = text.slice(from, to).replace(/\s+/g, " ").trim();
  return `${from > 0 ? "..." : ""}${middle}${to < text.length ? "..." : ""}`;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every paragraph and heading whose text contains `needle`, ignoring case, in document order. A node
 * with several matches gives one result, with the excerpt of its first match.
 */
export function findLiteral(tree: DocumentTree, needle: string): AddressExcerpt[] {
  const pattern = new RegExp(escapeRegExp(needle), "i");
  const hits: AddressExcerpt[] = [];
  for (const node of flattenNodes(tree)) {
    const match = pattern.exec(node.rawText);
    if (match === null) continue;
    hits.push({
      coordinate: node.coordinate,
      excerpt: excerptAround(node.rawText, match.index, match[0].length),
    });
  }
  return hits;
}

/**
 * Every paragraph and heading whose text refers to `coordinate` with a § reference, in document order.
 * The node that holds the address itself is included when its own text refers to it.
 */
export function linksTo(tree: DocumentTree, coordinate: string): AddressExcerpt[] {
  const hits: AddressExcerpt[] = [];
  for (const node of flattenNodes(tree)) {
    if (!coordinatesMentioned(node.rawText, tree.indexByCoord).includes(coordinate)) continue;
    const occurrence = [...node.rawText.matchAll(REF_PATTERN)].find((match) => match[0] === coordinate);
    hits.push({
      coordinate: node.coordinate,
      excerpt: excerptAround(node.rawText, occurrence?.index ?? 0, coordinate.length),
    });
  }
  return hits;
}
