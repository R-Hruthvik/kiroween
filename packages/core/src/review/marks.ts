// Review marks: a reviewer's "I have read this paragraph" state. It is kept outside rawText.
import type { DocNode, ReviewMarks } from "../types.js";

/**
 * FNV-1a, 32-bit, over the text with whitespace runs collapsed. The same text gives the same eight hex
 * digits on every run, so a mark can tell whether its paragraph still reads the same.
 */
export function reviewFingerprint(text: string): string {
  const normal = text.replace(/\s+/g, " ").trim();
  let hash = 0x811c9dc5;
  for (let i = 0; i < normal.length; i += 1) {
    hash ^= normal.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** True when the node has a mark and its text still has the fingerprint that was marked. */
export function isReviewed(node: DocNode, reviews: ReviewMarks): boolean {
  if (!Object.hasOwn(reviews, node.coordinate)) return false;
  return reviews[node.coordinate] === reviewFingerprint(node.rawText);
}
