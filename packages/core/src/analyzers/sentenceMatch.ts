import type { DocNode, FlagType } from "../types.js";
import { claimOf } from "../ast/classifier.js";
import { hasConflictTerm } from "./contradiction.js";
import { vagueTermsIn } from "./vague.js";

/** True when one sentence is the reason for a flag of the given type on its node. */
export function sentenceMatches(
  sentence: string,
  type: FlagType,
  node: DocNode,
  related: ReadonlySet<string>,
): boolean {
  switch (type) {
    case "CONTRADICTION":
      return hasConflictTerm(sentence);
    case "BROKEN_REF":
      return [...related].some((ref) => sentence.includes(ref)) || /\[[^\]]+\]/.test(sentence);
    case "UNVERIFIED_CLAIM":
      return claimOf(sentence) !== null && node.citations.length === 0;
    case "AMBIGUOUS_TERM":
      return vagueTermsIn(sentence).length > 0;
  }
}
