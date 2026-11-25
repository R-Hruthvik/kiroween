// Protected-word guard. Shared by Spec.Tighten (a rewrite is kept only if it passes) and View.Brief
// (every excerpt must be verbatim and contain only protected words that its source paragraph has).
// Deterministic and pure. See the Phase 2 plan, section 2.3.
import { extractCitations } from "../ast/classifier.js";

/** RFC 2119 keywords, longest first so "MUST NOT" is one keyword. Matching is case-sensitive. */
const RFC2119_PATTERN = /\b(?:MUST NOT|SHALL NOT|SHOULD NOT|NOT RECOMMENDED|MUST|SHALL|SHOULD|MAY|REQUIRED|RECOMMENDED|OPTIONAL)\b/g;
const NEGATION_PATTERN = /\b(?:not|never|no|nor|cannot)\b|n't\b/gi;
/** Condition words. "unless X" and "if X" are different protected words. */
const CONDITION_PATTERN = /\b(?:only if|provided that|if|unless|when|whenever|except|until|otherwise)\b/gi;
/** Bound words. "at least" and "at most" are different protected words. */
const BOUND_PATTERN =
  /\b(?:at least|at most|no more than|no less than|more than|less than|fewer than|greater than|up to|minimum|maximum|under|over|above|below|exceeds?|exceeding)\b/gi;
/**
 * A number with an optional unit. A number inside a version (HTTP/1.1), a § reference, or a word
 * (abc123) is not a quantity. Bare numbers are compared too.
 */
const QUANTITY_PATTERN =
  /(?<![\w§./-])(\d[\d,]*(?:\.\d+)?)(?:[ \t]*(%|percent|milliseconds?|ms|seconds?|secs?|s|minutes?|mins?|min|hours?|hrs?|h|days?|weeks?|months?|years?|[kmgt]?b|bytes?|times|requests?|users?)(?!\w))?(?!\w)/gi;
/** Code spans, dashed or underscored or slashed names (Content-Length, HTTP/1.1), and camelCase names. */
const IDENTIFIER_PATTERN =
  /`[^`\n]+`|\b[A-Za-z][A-Za-z0-9]*(?:[-_/.][A-Za-z0-9]+)+\b|\b[a-z]+[A-Z][A-Za-z0-9]*\b|\b[A-Z][a-z][a-z0-9]*[A-Z][A-Za-z0-9]*\b/g;

/** Decimal multipliers for kilo, mega, giga, and tera byte units. */
const BYTE_MULTIPLIER: Readonly<Record<string, number>> = { k: 1e3, m: 1e6, g: 1e9, t: 1e12 };

/**
 * A canonical unit for a quantity. Time units convert to milliseconds, so "30 s" and "30000 ms" match.
 * Byte units convert to bytes. Month and year stay as they are, because their length in days varies.
 */
function canonicalQuantity(numberText: string, unitText: string | undefined): string {
  const value = Number(numberText.replace(/,/g, ""));
  const unit = (unitText ?? "").toLowerCase();
  let key = unit;
  let factor = 1;
  if (/^(?:ms|milliseconds?)$/.test(unit)) {
    key = "ms";
  } else if (/^(?:s|secs?|seconds?)$/.test(unit)) {
    key = "ms";
    factor = 1000;
  } else if (/^(?:mins?|minutes?)$/.test(unit)) {
    key = "ms";
    factor = 60_000;
  } else if (/^(?:h|hrs?|hours?)$/.test(unit)) {
    key = "ms";
    factor = 3_600_000;
  } else if (/^days?$/.test(unit)) {
    key = "ms";
    factor = 86_400_000;
  } else if (/^weeks?$/.test(unit)) {
    key = "ms";
    factor = 604_800_000;
  } else if (/^months?$/.test(unit)) {
    key = "month";
  } else if (/^years?$/.test(unit)) {
    key = "year";
  } else if (unit === "percent" || unit === "%") {
    key = "%";
  } else if (/^(?:b|bytes?)$/.test(unit)) {
    key = "B";
  } else if (/^[kmgt]b$/.test(unit)) {
    key = "B";
    factor = BYTE_MULTIPLIER[unit.charAt(0)] ?? 1;
  } else if (/^requests?$/.test(unit)) {
    key = "request";
  } else if (/^users?$/.test(unit)) {
    key = "user";
  } else if (unit === "times") {
    key = "times";
  }
  const scaled = Math.round(value * factor * 1e9) / 1e9;
  return key === "" ? `${scaled}` : `${scaled} ${key}`;
}

/** The exact text of a match, with its canonical form for comparison. */
interface Token {
  raw: string;
  key: string;
}

function lowerTokens(text: string, pattern: RegExp): Token[] {
  return [...text.matchAll(pattern)].map((match) => {
    const raw = match[0].replace(/\s+/g, " ").toLowerCase();
    return { raw, key: raw };
  });
}

function quantityTokens(text: string): Token[] {
  return [...text.matchAll(QUANTITY_PATTERN)].map((match) => {
    const raw = match[0].replace(/\s+/g, " ").trim();
    return { raw, key: canonicalQuantity(match[1] ?? "", match[2]) };
  });
}

function identifierTokens(text: string): Token[] {
  return [...text.matchAll(IDENTIFIER_PATTERN)].map((match) => {
    const raw = match[0];
    return { raw, key: raw };
  });
}

/** One protected-word category: its message label and how to pull its tokens from a text. */
interface Category {
  label: string;
  tokens: (text: string) => Token[];
}

const CATEGORIES: readonly Category[] = [
  { label: "RFC 2119 keyword", tokens: (text) => [...text.matchAll(RFC2119_PATTERN)].map((m) => ({ raw: m[0], key: m[0] })) },
  { label: "negation", tokens: (text) => lowerTokens(text, NEGATION_PATTERN) },
  { label: "number", tokens: quantityTokens },
  { label: "condition word", tokens: (text) => lowerTokens(text, CONDITION_PATTERN) },
  { label: "bound", tokens: (text) => lowerTokens(text, BOUND_PATTERN) },
  { label: "reference", tokens: (text) => extractCitations(text).map((raw) => ({ raw, key: raw })) },
  { label: "identifier", tokens: identifierTokens },
];

/** Count of each key. The first raw text seen for a key is kept for messages. */
function multiset(tokens: readonly Token[]): Map<string, { count: number; raw: string }> {
  const counts = new Map<string, { count: number; raw: string }>();
  for (const token of tokens) {
    const entry = counts.get(token.key);
    if (entry) entry.count += 1;
    else counts.set(token.key, { count: 1, raw: token.raw });
  }
  return counts;
}

/** Clauses are split at commas, semicolons, colons, and sentence ends. */
const CLAUSE_BREAK = /[,;:.!?()]/;

/**
 * Per-clause negation check. Each negation is keyed by its word and the word right after it in the same
 * clause, so "MUST NOT close the socket" and "MUST NOT reply" differ even when both clauses hold one
 * negation. A rewrite that moves a negation to another clause therefore changes a protected word.
 * Only one following word is used, so a filler rewrite later in the clause ("in order to" to "to")
 * does not change the key.
 */
function negationContexts(text: string): Map<string, { count: number; raw: string }> {
  const out = new Map<string, { count: number; raw: string }>();
  for (const clause of text.split(CLAUSE_BREAK)) {
    const raw = clause.trim().replace(/\s+/g, " ");
    for (const match of clause.matchAll(NEGATION_PATTERN)) {
      const after = clause
        .slice((match.index ?? 0) + match[0].length)
        .trim()
        .split(/\s+/)
        .slice(0, 1)
        .join(" ")
        .toLowerCase();
      const key = `${match[0].toLowerCase()}|${after}`;
      const entry = out.get(key);
      if (entry) entry.count += 1;
      else out.set(key, { count: 1, raw });
    }
  }
  return out;
}

/** The first difference between two multisets, as a message, or null when they match. */
function firstDifference(
  label: string,
  before: Map<string, { count: number; raw: string }>,
  after: Map<string, { count: number; raw: string }>,
): string | null {
  for (const key of new Set([...before.keys(), ...after.keys()])) {
    if ((before.get(key)?.count ?? 0) !== (after.get(key)?.count ?? 0)) {
      const raw = before.get(key)?.raw ?? after.get(key)?.raw ?? key;
      return `${label} "${raw}" changed`;
    }
  }
  return null;
}

/**
 * Compares the protected words of two versions of one text. Returns a message that names the first
 * token that changed, or null when every protected word matches. Protected: RFC 2119 keywords with
 * their case, negations (also per clause), numbers with units normalized, condition and bound words,
 * § and citation references, and identifiers.
 */
export function findProtectedChange(before: string, after: string): string | null {
  for (const category of CATEGORIES) {
    const diff = firstDifference(
      category.label,
      multiset(category.tokens(before)),
      multiset(category.tokens(after)),
    );
    if (diff) return diff;
    if (category.label === "negation") {
      const clauseDiff = firstDifference("negation in clause", negationContexts(before), negationContexts(after));
      if (clauseDiff) return clauseDiff;
    }
  }
  return null;
}

/**
 * Checks that an excerpt uses no protected word that its source paragraph lacks. Each protected word
 * may appear in the excerpt no more often than in the source. Returns the first token that does not
 * appear in the source, or null.
 */
export function findProtectedExcerptViolation(source: string, excerpt: string): string | null {
  for (const category of CATEGORIES) {
    const available = multiset(category.tokens(source));
    for (const [key, entry] of multiset(category.tokens(excerpt))) {
      const allowed = available.get(key)?.count ?? 0;
      if (entry.count > allowed) return `${category.label} "${entry.raw}" is not in the source paragraph`;
    }
  }
  return null;
}

/** RFC 2119 keywords in a text, in order, case-sensitive. "MUST NOT" is one keyword. */
export function rfc2119KeywordsIn(text: string): string[] {
  return [...text.matchAll(RFC2119_PATTERN)].map((match) => match[0]);
}
