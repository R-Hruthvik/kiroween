import type { DocNode, NodeFlag } from "../types.js";
import { CURRENCY_PATTERN, quantityMatches, splitSentences } from "../ast/classifier.js";

/** Caps CONTRADICTION flags on one node. Pairs are still scanned, so output stays bounded. */
const MAX_CONTRADICTIONS_PER_NODE = 5;
/** Content words kept on each side of a number or modal when naming the subject. */
const WINDOW_TOKENS = 3;
/** A clause with one of these words is scoped to a condition, so it is not a contradiction with an unscoped clause. */
const SCOPE_PATTERN = /\b(?:if|when|unless|except)\b/i;
/** Generic object words that appear in many unrelated sentences. They never count as the same object. */
const GENERIC_OBJECTS = new Set(["header", "field", "response", "request", "server", "client", "message", "content"]);

// Words that carry no subject meaning: modals, auxiliaries, prepositions, comparators, adverbs.
const STOP = new Set([
  "the", "a", "an", "of", "for", "to", "in", "at", "on", "by", "with", "within", "under", "over",
  "above", "below", "than", "least", "most", "more", "less", "no", "not", "never", "be", "been",
  "being", "is", "are", "was", "were", "am", "shall", "must", "should", "will", "may", "can",
  "could", "would", "do", "does", "each", "every", "all", "any", "per", "after", "before", "from",
  "up", "about", "approximately", "around", "roughly", "exactly", "only", "also", "always",
  "explicitly", "automatically", "immediately", "securely", "keep", "kept", "stay", "remain",
  "maintain", "take", "takes", "get", "gets", "have", "has", "it", "its", "this", "these", "those", "they", "them", "their", "there", "such",
  "into", "via", "time", "value", "target", "limit", "duration", "period", "window",
]);

// Words that end a clause. The subject window never reads past them.
const BOUNDARY = new Set([
  "and", "or", "but", "when", "if", "unless", "while", "whereas", "because", "so", "then", "that",
  "which", "since", "until", "once", "where",
]);

// Unit words end a window too, so an earlier quantity cannot leak into the next subject.
const UNIT_WORDS = new Set([
  "ms", "s", "sec", "secs", "second", "seconds", "millisecond", "milliseconds", "min", "mins",
  "minute", "minutes", "h", "hr", "hrs", "hour", "hours", "day", "days", "week", "weeks", "month",
  "months", "year", "years", "b", "kb", "mb", "gb", "tb", "percent",
]);

// Synonyms for the metric noun a requirement measures. Verb forms map to their noun.
const CANON: Record<string, string> = {
  respond: "response", responds: "response", responses: "response", reply: "response",
  replies: "response", answer: "response", answers: "response",
  expire: "expiry", expires: "expiry", expired: "expiry", expiration: "expiry", expiry: "expiry",
  valid: "expiry", validity: "expiry", lifetime: "expiry", ttl: "expiry",
};

/** Light stemmer so "logged", "logs", and "log" compare equal. */
export function stem(raw: string): string {
  const word = raw.toLowerCase();
  const mapped = CANON[word];
  if (mapped !== undefined) return mapped;
  let out = word;
  if (out.length > 4 && out.endsWith("ies")) out = `${out.slice(0, -3)}y`;
  else if (out.length > 4 && /(?:ss|sh|ch|x)es$/.test(out)) out = out.slice(0, -2);
  else if (out.length > 3 && out.endsWith("ed")) out = out.slice(0, -2);
  else if (out.length > 4 && out.endsWith("ing")) out = out.slice(0, -3);
  else if (out.length > 3 && out.endsWith("s") && !out.endsWith("ss")) out = out.slice(0, -1);
  else if (out.length > 4 && out.endsWith("e")) out = out.slice(0, -1);
  if (/([b-df-hj-np-tv-z])\1$/.test(out)) out = out.slice(0, -1);
  return out;
}

function words(segment: string): string[] {
  return segment.match(/[A-Za-z][A-Za-z0-9-]*/g) ?? [];
}

/**
 * Collects up to WINDOW_TOKENS content stems. From the end, it reads leftward from a number or
 * modal. From the start, it reads rightward from a modal. Returns the stems in document order.
 */
function contentWindow(segment: string, fromEnd: boolean): string[] {
  const tokens = words(segment);
  const ordered = fromEnd ? [...tokens].reverse() : tokens;
  const out: string[] = [];
  for (const raw of ordered) {
    const word = raw.toLowerCase();
    if (BOUNDARY.has(word) || UNIT_WORDS.has(word)) break;
    if (STOP.has(word)) continue;
    out.push(stem(word));
    if (out.length >= WINDOW_TOKENS) break;
  }
  return fromEnd ? out.reverse() : out;
}

/** Two subjects agree when their heads match and their qualifiers share a word, or one side has none. */
function sameSubject(headA: string, qualsA: readonly string[], headB: string, qualsB: readonly string[]): boolean {
  if (headA !== headB) return false;
  if (qualsA.length === 0 || qualsB.length === 0) return true;
  return qualsA.some((qual) => qualsB.includes(qual));
}

/**
 * Two clauses share an object when they have a non-generic object word in common. A clause with no object
 * words at all matches any object, as before. A clause whose only object words are generic does not match.
 */
function sameObject(a: Polarity, b: Polarity): boolean {
  if (!a.hasObjects || !b.hasObjects) return true;
  return a.objects.some((word) => b.objects.includes(word));
}

function isScoped(entry: Entry): boolean {
  return entry.kind === "metric" ? entry.metric.scoped : entry.polarity.scoped;
}

const LE_PATTERN = /\b(?:under|below|within|at most|no more than|less than|up to|fewer than|no greater than)\b|[<≤]/gi;
const GE_PATTERN = /\b(?:over|above|at least|no less than|more than|greater than|exceeding)\b|[>≥]/gi;

/** The part of the clause after its last clause boundary or unit word, so an earlier comparator does not leak in. */
function textAfterLastBoundary(clause: string): string {
  let cut = 0;
  for (const match of clause.matchAll(/[A-Za-z]+/g)) {
    const word = match[0].toLowerCase();
    if (BOUNDARY.has(word) || UNIT_WORDS.has(word)) cut = (match.index ?? 0) + match[0].length;
  }
  return clause.slice(cut);
}

function lastIndexOf(text: string, pattern: RegExp): number {
  let last = -1;
  for (const match of text.matchAll(pattern)) last = match.index ?? last;
  return last;
}

interface Metric {
  head: string;
  quals: string[];
  unitClass: string;
  lo: number;
  hi: number;
  snippet: string;
  scoped: boolean;
}

/** The sentence around a match, from the previous sentence break to the next one. */
function sentenceAround(text: string, start: number, end: number): string {
  const before = text.slice(0, start);
  const lastBreak = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?"), before.lastIndexOf("\n"));
  const after = /[.!?\n]/.exec(text.slice(end));
  return text.slice(lastBreak + 1, after ? end + after.index : text.length);
}

/** Converts a unit to a comparable class and a factor. Time is normalized to milliseconds. */
function unitOf(unit: string): { unitClass: string; factor: number } | null {
  switch (unit) {
    case "%": case "percent": return { unitClass: "percent", factor: 1 };
    case "ms": case "millisecond": case "milliseconds": return { unitClass: "time", factor: 1 };
    case "s": case "sec": case "secs": case "second": case "seconds": return { unitClass: "time", factor: 1000 };
    case "min": case "mins": case "minute": case "minutes": return { unitClass: "time", factor: 60_000 };
    case "h": case "hr": case "hrs": case "hour": case "hours": return { unitClass: "time", factor: 3_600_000 };
    case "day": case "days": return { unitClass: "time", factor: 86_400_000 };
    case "week": case "weeks": return { unitClass: "time", factor: 604_800_000 };
    // A year is 365.25 days. A month is one twelfth of a year, about 30.44 days, so "12 months" equals "1 year".
    case "month": case "months": return { unitClass: "time", factor: (365.25 * 86_400_000) / 12 };
    case "year": case "years": return { unitClass: "time", factor: 365.25 * 86_400_000 };
    case "b": return { unitClass: "size", factor: 1 };
    case "kb": return { unitClass: "size", factor: 1024 };
    case "mb": return { unitClass: "size", factor: 1024 ** 2 };
    case "gb": return { unitClass: "size", factor: 1024 ** 3 };
    case "tb": return { unitClass: "size", factor: 1024 ** 4 };
    case "times": return { unitClass: "times", factor: 1 };
    case "request": case "requests": case "user": case "users": case "customer": case "customers":
    case "error": case "errors": case "transaction": case "transactions": case "query": case "queries":
    case "rps": case "qps":
      return { unitClass: "count", factor: 1 };
    default: return null;
  }
}

/** Metrics in text: a number with a unit or currency, its subject, and its comparator. */
function extractMetrics(text: string): Metric[] {
  type Hit = { index: number; end: number; value: string; unit: string; symbol: string };
  const hits: Hit[] = [];
  for (const match of quantityMatches(text)) {
    hits.push({
      index: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      value: match[1] ?? "",
      unit: (match[2] ?? "").toLowerCase(),
      symbol: "",
    });
  }
  for (const match of text.matchAll(new RegExp(CURRENCY_PATTERN.source, "g"))) {
    hits.push({
      index: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      value: match[2] ?? "",
      unit: "",
      symbol: match[1] ?? "",
    });
  }
  hits.sort((a, b) => a.index - b.index);

  const metrics: Metric[] = [];
  for (const hit of hits) {
    const before = text.slice(0, hit.index);
    const clauseStart = Math.max(...[".", ";", ":", "!", "?", "(", ")", "\n"].map((mark) => before.lastIndexOf(mark))) + 1;
    const clause = before.slice(clauseStart);
    const subject = contentWindow(clause, true);
    if (subject.length === 0) continue;

    const unitInfo = hit.symbol !== ""
      ? { unitClass: `currency${hit.symbol}`, factor: 1 }
      : unitOf(hit.unit);
    if (unitInfo === null) continue;

    const value = Number(hit.value.replace(/,/g, "")) * unitInfo.factor;
    const near = textAfterLastBoundary(clause).slice(-40);
    const le = lastIndexOf(near, LE_PATTERN);
    const ge = lastIndexOf(near, GE_PATTERN);
    const comparator = le < 0 && ge < 0 ? "eq" : le > ge ? "le" : "ge";

    metrics.push({
      head: subject[subject.length - 1] ?? "",
      quals: subject.slice(0, -1),
      unitClass: unitInfo.unitClass,
      lo: comparator === "le" ? -Infinity : value,
      hi: comparator === "ge" ? Infinity : value,
      snippet: text.slice(clauseStart, hit.end).trim(),
      scoped: SCOPE_PATTERN.test(sentenceAround(text, hit.index, hit.end)),
    });
  }
  return metrics;
}

interface Polarity {
  positive: boolean;
  head: string;
  quals: string[];
  action: string;
  objects: string[];
  snippet: string;
  scoped: boolean;
  /** True when the sentence has object words at all, generic or not. */
  hasObjects: boolean;
}

const MODAL_PATTERN = /\b(MUST NOT|SHALL NOT|MUST NEVER|SHALL NEVER|NEVER|PROHIBITED|MUST|SHALL|REQUIRED)\b/;

/**
 * The first affirmative (MUST, SHALL, REQUIRED) or negative (MUST NOT, SHALL NOT, NEVER, PROHIBITED)
 * modal in a sentence, with its subject and the verb it governs. SHOULD is not a polarity modal.
 */
function extractPolarity(sentence: string): Polarity | null {
  const modal = MODAL_PATTERN.exec(sentence);
  if (!modal) return null;
  const word = modal[1] ?? "";
  const positive = /^(?:MUST|SHALL|REQUIRED)$/.test(word);

  const clauseStart = Math.max(...[".", ";", ":", "!", "?", "(", ")", ","].map((mark) => sentence.slice(0, modal.index).lastIndexOf(mark))) + 1;
  const subject = contentWindow(sentence.slice(clauseStart, modal.index), true);
  if (subject.length === 0) return null;

  const afterText = sentence.slice(modal.index + word.length);
  const clauseEnd = afterText.search(/[.;:!?()\n,]/);
  const predicate = contentWindow(clauseEnd < 0 ? afterText : afterText.slice(0, clauseEnd), false);
  const action = predicate[0];
  if (action === undefined) return null;

  const rawObjects = predicate.slice(1);
  return {
    positive,
    head: subject[subject.length - 1] ?? "",
    quals: subject.slice(0, -1),
    action,
    objects: rawObjects.filter((word) => !GENERIC_OBJECTS.has(word)),
    hasObjects: rawObjects.length > 0,
    scoped: SCOPE_PATTERN.test(sentence),
    snippet: sentence.trim().slice(0, 100),
  };
}

/** Text of the flagged sentence, for the contradiction rule. Used by the task checklist. */
export function hasConflictTerm(sentence: string): boolean {
  return extractMetrics(sentence).length > 0 || extractPolarity(sentence) !== null;
}

type Entry =
  | { node: DocNode; kind: "metric"; metric: Metric }
  | { node: DocNode; kind: "polarity"; polarity: Polarity };

/** Messages for one conflicting pair, from each side's point of view. Null when the pair does not conflict. */
function pairMessages(a: Entry, b: Entry): { forA: string; forB: string } | null {
  // A scoped clause (if, when, unless, except) states a condition, so it is not a conflict with another clause.
  if (isScoped(a) || isScoped(b)) return null;
  if (a.kind === "metric" && b.kind === "metric") {
    const x = a.metric;
    const y = b.metric;
    if (!sameSubject(x.head, x.quals, y.head, y.quals)) return null;
    if (Math.max(x.lo, y.lo) <= Math.min(x.hi, y.hi)) return null;
    return {
      forA: `"${x.snippet}" conflicts with "${y.snippet}" in ${b.node.coordinate}.`,
      forB: `"${y.snippet}" conflicts with "${x.snippet}" in ${a.node.coordinate}.`,
    };
  }
  if (a.kind === "polarity" && b.kind === "polarity") {
    const x = a.polarity;
    const y = b.polarity;
    if (x.positive === y.positive) return null;
    if (!sameSubject(x.head, x.quals, y.head, y.quals)) return null;
    if (!sameObject(x, y)) return null;
    return {
      forA: `"${x.snippet}" contradicts "${y.snippet}" in ${b.node.coordinate}.`,
      forB: `"${y.snippet}" contradicts "${x.snippet}" in ${a.node.coordinate}.`,
    };
  }
  return null;
}

/**
 * Finds contradictions between Requirement and Claim nodes. Two kinds are checked:
 * numeric conflicts (same unit class, same metric subject, infeasible value ranges) and polarity
 * conflicts (affirmative MUST/SHALL/REQUIRED against negative MUST NOT/SHALL NOT/NEVER/PROHIBITED
 * on the same subject and verb). Entries are grouped by metric or verb first, so only candidate
 * pairs are compared. Each node keeps at most MAX_CONTRADICTIONS_PER_NODE flags.
 */
export function detectContradictions(nodes: readonly DocNode[]): Map<string, NodeFlag[]> {
  const groups = new Map<string, Entry[]>();
  const add = (key: string, entry: Entry): void => {
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  };

  for (const node of nodes) {
    if (node.role !== "Requirement" && node.role !== "Claim") continue;
    for (const metric of extractMetrics(node.rawText)) {
      add(`metric|${metric.unitClass}|${metric.head}`, { node, kind: "metric", metric });
    }
    if (node.role !== "Requirement") continue;
    for (const sentence of splitSentences(node.rawText)) {
      const polarity = extractPolarity(sentence);
      if (polarity) add(`polarity|${polarity.action}`, { node, kind: "polarity", polarity });
    }
  }

  const flagsById = new Map<string, NodeFlag[]>();
  const room = (nodeId: string): boolean => (flagsById.get(nodeId)?.length ?? 0) < MAX_CONTRADICTIONS_PER_NODE;
  const push = (nodeId: string, flag: NodeFlag): void => {
    const list = flagsById.get(nodeId) ?? [];
    list.push(flag);
    flagsById.set(nodeId, list);
  };

  for (const entries of groups.values()) {
    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const a = entries[i];
        const b = entries[j];
        if (!a || !b || a.node.id === b.node.id) continue;
        const messages = pairMessages(a, b);
        if (messages === null) continue;
        const type = "CONTRADICTION";
        if (room(a.node.id)) push(a.node.id, { type, message: messages.forA, relatedCoordinate: b.node.coordinate });
        if (room(b.node.id)) push(b.node.id, { type, message: messages.forB, relatedCoordinate: a.node.coordinate });
      }
    }
  }
  return flagsById;
}
