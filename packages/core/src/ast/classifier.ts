import type { NodeFlag, SemanticRole } from "../types.js";
import { CITATION_PATTERN, REF_PATTERN } from "./coordinate.js";
import { BRACKET_KEY } from "./citations.js";
import { withoutCodeAndLinkText } from "./markdown.js";

/**
 * A quantity is a number with a unit or a currency sign. Bare numbers are not quantities, so
 * "Section 7", "port 443", "428 status code", "2024", "HTTP/1.1", and "1." never count as claims.
 */
export const QUANTITY_PATTERN =
  /(?<![\w./])(\d[\d,]*(?:\.\d+)?)[ \t]*(%|percent\b|milliseconds?\b|ms\b|seconds?\b|secs?\b|s\b|minutes?\b|mins?\b|hours?\b|hrs?\b|h\b|days?\b|weeks?\b|months?\b|years?\b|[KMGT]?B\b|times\b|requests?\b|users?\b|customers?\b|errors?\b|transactions?\b|queries\b|rps\b|qps\b)/gi;

/**
 * Quantity matches in `text`, in order. "/" before a number keeps versions such as "HTTP/1.1" out.
 * A three-digit number before a capitalized "Request" name, such as "431 Request Header Fields Too Large",
 * is a status code, not a quantity.
 */
export function quantityMatches(text: string): RegExpMatchArray[] {
  const out: RegExpMatchArray[] = [];
  for (const match of text.matchAll(new RegExp(QUANTITY_PATTERN.source, "gi"))) {
    const end = (match.index ?? 0) + match[0].length;
    const isStatusName =
      (match[1] ?? "").length === 3 && /^Request$/.test(match[2] ?? "") && /^[ \t]+[A-Z]/.test(text.slice(end));
    if (!isStatusName) out.push(match);
  }
  return out;
}

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
  const quantity = quantityMatches(withoutUrls)[0];
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

/** Text before the first sentence break is the first sentence. Lists are split too, one item per sentence. */
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z0-9§[(`*_"<-])/g;
/** A newline before a list item (`- `, `* `, `+ `, `1. `, `1) `) starts a new sentence. */
const LIST_BREAK = /\n[ \t]*(?=(?:[-*+]|\d+[.)])[ \t]+)/g;
const LIST_MARKER = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/;

/** Abbreviations that end with a dot but do not end a sentence. Matched with the capital letter as written. */
const ABBREVIATIONS_EXACT = new Set(["Dr", "Mr", "Mrs", "Ms", "Prof", "St", "Fig", "Sec", "No", "U.S"]);
/** Abbreviations matched in any case. */
const ABBREVIATIONS_ANY_CASE = new Set(["approx", "vs", "e.g", "i.e"]);
/** A single capital letter, or initials such as "J.R", are name initials. */
const INITIALS = /^(?:[A-Z]\.)*[A-Z]$/;

/**
 * True when the dot at `dotIndex` belongs to an abbreviation or initial, such as "Dr.", "e.g.", "U.S.", or "J.".
 * A dot after an abbreviation does not end a sentence, so the text after it stays in the same sentence.
 */
export function isAbbreviationBefore(text: string, dotIndex: number): boolean {
  if (text[dotIndex] !== ".") return false;
  let start = dotIndex;
  while (start > 0 && /[A-Za-z.]/.test(text.charAt(start - 1))) start -= 1;
  const token = text.slice(start, dotIndex);
  if (token === "") return false;
  if (INITIALS.test(token)) return true;
  return ABBREVIATIONS_EXACT.has(token) || ABBREVIATIONS_ANY_CASE.has(token.toLowerCase());
}

/**
 * Raw spans of `text`, split at sentence and list-item breaks. The break whitespace is not part of any span,
 * so `text.slice(start, end)` gives each sentence exactly as written.
 */
export function sentenceSpans(text: string): { start: number; end: number }[] {
  const cuts: { start: number; end: number }[] = [];
  for (const match of text.matchAll(LIST_BREAK)) {
    const start = match.index ?? 0;
    cuts.push({ start, end: start + match[0].length });
  }
  for (const match of text.matchAll(SENTENCE_BREAK)) {
    const start = match.index ?? 0;
    // "1. Alpha" at the start of a line is a list marker, not the end of a sentence.
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    if (/^[ \t]*\d+\.$/.test(text.slice(lineStart, start))) continue;
    // "Dr. Patel" is one sentence.
    if (isAbbreviationBefore(text, start - 1)) continue;
    cuts.push({ start, end: start + match[0].length });
  }
  // Earlier cuts first. A cut that starts inside the previous cut is the same break, so it is skipped.
  cuts.sort((a, b) => a.start - b.start || b.end - a.end);
  const spans: { start: number; end: number }[] = [];
  let position = 0;
  for (const cut of cuts) {
    if (cut.start < position) continue;
    spans.push({ start: position, end: cut.start });
    position = cut.end;
  }
  spans.push({ start: position, end: text.length });
  return spans;
}

/** Splits off the opening sentence. The rest is counted as hidden words for the 'f' View-Spec. */
export function splitFirstSentence(text: string): {
  firstSentence: string;
  hiddenWordCount: number;
} {
  const parts = sentenceSpans(text).map((span) => text.slice(span.start, span.end));
  const firstSentence = parts[0] ?? "";
  const rest = parts.slice(1).join(" ");
  return { firstSentence, hiddenWordCount: countWords(rest) };
}

/**
 * Splits text into sentences for display and per-sentence checks. List markers are removed and
 * whitespace is collapsed. Each list item is its own sentence.
 */
export function splitSentences(text: string): string[] {
  return sentenceSpans(text)
    .map((span) => text.slice(span.start, span.end))
    .map((sentence) => sentence.replace(LIST_MARKER, "").replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length > 0);
}

/** True when the sentence has a modal keyword from the requirement list (SHALL, MUST, REQUIRED, SHOULD, NEVER, PROHIBITED). */
export function hasModalKeyword(sentence: string): boolean {
  return DEONTIC_PATTERN.test(sentence);
}

/**
 * Unverified-claim flags for a node with no citation. Numeric claims are checked sentence by sentence in
 * every body node, so a requirement that also states a number is checked too. Comparative claims are only
 * checked on Claim nodes, as before. Headings and code fences are never checked.
 */
export function classificationFlags(
  role: SemanticRole,
  citations: readonly string[],
  text: string,
): NodeFlag[] {
  if (role === "Heading" || citations.length > 0) return [];
  const flags: NodeFlag[] = [];
  if (!isCodeFence(text)) {
    for (const sentence of splitSentences(text)) {
      const claim = claimOf(sentence.replace(CITATION_PATTERN, " "));
      if (claim?.kind === "numeric") {
        flags.push({
          type: "UNVERIFIED_CLAIM",
          message: `Numeric claim "${claim.trigger}" has no citation, evidence link, or § reference.`,
        });
      }
    }
  }
  if (flags.length > 0 || role !== "Claim") return flags;
  const claim = claimOf(text.replace(CITATION_PATTERN, " "));
  if (claim === null || claim.kind !== "comparative") return [];
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
  for (const match of withoutCodeAndLinkText(text).matchAll(REF_PATTERN)) {
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
