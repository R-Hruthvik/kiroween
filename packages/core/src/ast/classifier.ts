import type { NodeFlag, SemanticRole } from "../types.js";
import { CITATION_PATTERN, REF_PATTERN } from "./coordinate.js";

/** Role priority follows SPEC.md section 2.1 and BUILD_PLAN.md section 3.1. */
export function classifyRole(text: string, isHeading: boolean): SemanticRole {
  if (isHeading) return "Heading";
  if (/\b(?:SHALL|MUST|REQUIRED|SHOULD)\b/.test(text)) return "Requirement";
  if (/\[\d+\]|https?:\/\/|\(Source:/.test(text)) return "Evidence";
  if (/\b(?:assume|assuming|hypothesis|presume)\b/i.test(text)) return "Assumption";
  // Strip citations and § references so their digits do not look like numeric claims.
  const stripped = text.replace(CITATION_PATTERN, " ");
  if (/\d|%|\$|\bms\b|\bfaster\b|\breduces?\b/i.test(stripped)) return "Claim";
  return "Prose";
}

/** Citation markers, URLs, and § references, in order of appearance. */
export function extractCitations(text: string): string[] {
  return [...text.matchAll(CITATION_PATTERN)].map((match) => match[0]);
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/** Splits off the opening sentence. The rest is counted as hidden words for the 'f' View-Spec. */
export function splitFirstSentence(text: string): {
  firstSentence: string;
  hiddenWordCount: number;
} {
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z0-9§[])/);
  const firstSentence = parts[0] ?? "";
  const rest = parts.slice(1).join(" ");
  return { firstSentence, hiddenWordCount: countWords(rest) };
}

export function classificationFlags(
  role: SemanticRole,
  citations: readonly string[],
): NodeFlag[] {
  if (role === "Claim" && citations.length === 0) {
    return [
      {
        type: "UNVERIFIED_CLAIM",
        message: "Numeric claim has no citation, evidence link, or § reference.",
      },
    ];
  }
  return [];
}

/** One BROKEN_REF flag per distinct § reference that is missing from the index. */
export function brokenRefFlags(
  text: string,
  index: Readonly<Record<string, string>>,
): NodeFlag[] {
  const seen = new Set<string>();
  const flags: NodeFlag[] = [];
  for (const match of text.matchAll(REF_PATTERN)) {
    const ref = match[0];
    if (seen.has(ref)) continue;
    seen.add(ref);
    if (!Object.hasOwn(index, ref)) {
      flags.push({
        type: "BROKEN_REF",
        message: `References ${ref}, which does not exist in this document.`,
        relatedCoordinate: ref,
      });
    }
  }
  return flags;
}
