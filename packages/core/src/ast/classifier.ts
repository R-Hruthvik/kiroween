import type { NodeFlag, SemanticRole } from "../types.js";
import { CITATION_PATTERN, REF_PATTERN } from "./coordinate.js";
import { BRACKET_KEY } from "./citations.js";

/**
 * A quantity is a number with a unit or a currency sign. Bare numbers are not quantities, so
 * "Section 7", "port 443", "428 status code", "2024", "HTTP/1.1", and "1." never count as claims.
 */
export const QUANTITY_PATTERN =
  /(?<![\w.])(\d[\d,]*(?:\.\d+)?)[ \t]*(%|percent\b|milliseconds?\b|ms\b|seconds?\b|secs?\b|s\b|minutes?\b|mins?\b|hours?\b|hrs?\b|h\b|days?\b|weeks?\b|[KMGT]?B\b|times\b|requests?\b|users?\b|customers?\b|errors?\b|transactions?\b|queries\b|rps\b|qps\b)/gi;

export const CURRENCY_PATTERN = /([$€£])[ \t]?(\d[\d,]*(?:\.\d+)?)/g;

const COMPARATIVE_PATTERN =
  /\b(faster|slower|better|worse|reduces?|reduced|reducing|improves?|improved|outperforms?|cuts?|doubles?|halves?|twice|lower than|higher than)\b/i;

const DEONTIC_PATTERN = /\b(?:SHALL|MUST|REQUIRED|SHOULD|NEVER|PROHIBITED)\b/;
const EVIDENCE_PATTERN = new RegExp(String.raw`\[\d+\]|https?:\/\/|\(Source:|${BRACKET_KEY.source}`);
const CODE_FENCE_PATTERN = /^[ \t]{0,3}(`{3,}|~{3,})/;

/** True when the node text starts a fenced code block. Fenced code is never a claim or a requirement. */
export function isCodeFence(text: string): boolean {
  return CODE_FENCE_PATTERN.test(text);
}

export interface ClaimMatch {
  kind: "numeric" | "comparative";
  trigger: string;
}

/** Numeric claims take precedence. Comparative claims are words such as "faster" or "reduces". */
export function claimOf(text: string): ClaimMatch | null {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, " ");
  // Fresh RegExp objects keep the global lastIndex state out of these calls.
  const quantity = new RegExp(QUANTITY_PATTERN.source, "i").exec(withoutUrls);
  if (quantity) return { kind: "numeric", trigger: quantity[0].trim() };
  const currency = new RegExp(CURRENCY_PATTERN.source).exec(withoutUrls);
  if (currency) return { kind: "numeric", trigger: currency[0] };
  const comparative = COMPARATIVE_PATTERN.exec(withoutUrls);
  if (comparative) return { kind: "comparative", trigger: comparative[1] ?? comparative[0] };
  return null;
}

/** Role priority follows SPEC.md section 2.1 and BUILD_PLAN.md section 3.1. */
export function classifyRole(text: string, isHeading: boolean): SemanticRole {
  if (isHeading) return "Heading";
  if (isCodeFence(text)) return "Prose";
  if (DEONTIC_PATTERN.test(text)) return "Requirement";
  if (EVIDENCE_PATTERN.test(text)) return "Evidence";
  if (/\b(?:assume|assuming|hypothesis|presume)\b/i.test(text)) return "Assumption";
  if (claimOf(text.replace(CITATION_PATTERN, " ")) !== null) return "Claim";
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

/** Splits text into sentences for display and per-sentence checks. Whitespace is collapsed. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9§[(])/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length > 0);
}

export function classificationFlags(
  role: SemanticRole,
  citations: readonly string[],
  text: string,
): NodeFlag[] {
  if (role !== "Claim" || citations.length > 0) return [];
  const claim = claimOf(text.replace(CITATION_PATTERN, " "));
  if (claim === null) return [];
  if (claim.kind === "numeric") {
    return [
      {
        type: "UNVERIFIED_CLAIM",
        message: `Numeric claim "${claim.trigger}" has no citation, evidence link, or § reference.`,
      },
    ];
  }
  return [
    {
      type: "UNVERIFIED_CLAIM",
      message: `Comparative claim ("${claim.trigger}") has no citation, evidence link, or § reference.`,
    },
  ];
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
