// View.Brief: an extractive excerpt view. Read-only. Pure and deterministic.
import type { BriefResult, BriefSection, BriefSentence, DocumentTree, SourceSentence } from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { countWords } from "../ast/classifier.js";
import { CITATION_PATTERN } from "../ast/coordinate.js";
import { findProtectedExcerptViolation } from "./protected.js";
import { bodySections } from "./sentences.js";

export const DEFAULT_BRIEF_SENTENCES = 2;

/** Words that carry no topic. They are not counted when a sentence is compared with its heading. */
const STOPWORDS: ReadonlySet<string> = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "has", "have", "had",
  "not", "but", "its", "into", "when", "will", "shall", "must", "should", "may", "can", "any", "all",
  "each", "such", "than", "then", "their", "they", "them", "there", "which", "what", "who", "also",
  "only", "about", "between", "under", "over", "does", "being", "been", "more", "less", "other",
]);

/** A number, a limit phrase, or a definition phrase. Citations and § references are removed first. */
const NUMBER_OR_DEFINITION =
  /\d|\b(?:at least|at most|no more than|no less than|up to|maximum|minimum|defined as|is defined|means|refers to)\b/i;

/** A sentence that starts this way depends on the sentence before it. */
const CONTEXT_START = /^(?:this|it|such)\b/i;

export const FOOTER_TEXT = "Selected excerpts. Omitted text may contain more conditions.";

/**
 * Parses the sentence count of View.Brief(n) and Spec.Ledger(n). Accepts only digits that form a
 * safe integer of at least 1. Rejects "", "0", "-1", "1.5", and "x".
 */
export function parseSentenceCount(raw: string): number | null {
  if (!/^[0-9]+$/.test(raw)) return null;
  const count = Number(raw);
  return Number.isSafeInteger(count) && count >= 1 ? count : null;
}

function wordSet(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z]{3,}/g) ?? [];
  return new Set(words.filter((word) => !STOPWORDS.has(word)));
}

interface Scored {
  index: number;
  rfc: number;
  numeric: number;
  overlap: number;
}

/**
 * Indexes of the sentences to keep in one section, in source order, with a flag for context sentences.
 * Sentences rank by RFC 2119 keyword, then number or definition, then words shared with the heading.
 * Ties keep source order. The top `perSection` sentences are picks. A pick that starts with "this",
 * "it", or "such" also keeps the sentence before it, which is marked as context.
 */
function selectSentences(
  pool: readonly SourceSentence[],
  headingText: string,
  perSection: number,
): { index: number; context: boolean }[] {
  const headingWords = wordSet(headingText);
  const scored: Scored[] = pool.map((sentence, index) => {
    const words = wordSet(sentence.text);
    let overlap = 0;
    for (const word of words) if (headingWords.has(word)) overlap += 1;
    return {
      index,
      rfc: sentence.modals.length > 0 ? 1 : 0,
      numeric: NUMBER_OR_DEFINITION.test(sentence.text.replace(CITATION_PATTERN, " ")) ? 1 : 0,
      overlap,
    };
  });
  scored.sort((a, b) => b.rfc - a.rfc || b.numeric - a.numeric || b.overlap - a.overlap || a.index - b.index);

  const kept = new Map<number, boolean>();
  for (const pick of scored.slice(0, perSection)) kept.set(pick.index, false);
  for (const index of [...kept.keys()]) {
    const sentence = pool[index];
    if (sentence && index > 0 && CONTEXT_START.test(sentence.text) && !kept.has(index - 1)) {
      kept.set(index - 1, true);
    }
  }
  return [...kept.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, context]) => ({ index, context }));
}

/** The percentage of words left after the brief, to one decimal place. */
function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

/**
 * Builds the View.Brief excerpt for a tree. Each section keeps up to `perSection` whole sentences
 * (plus context sentences), and each kept sentence is checked against its source paragraph. The tree
 * is only read, so rawText and the coordinates never change.
 */
export function buildBrief(tree: DocumentTree, perSection: number): BriefResult {
  if (!Number.isSafeInteger(perSection) || perSection < 1) {
    throw new RangeError(`buildBrief expects a positive integer sentence count, got ${perSection}`);
  }
  const guardFailures: string[] = [];
  let wordsAfter = 0;
  const sections: BriefSection[] = bodySections(tree).map((section) => {
    const headingText = section.heading ? section.heading.rawText.replace(/^#+\s*/, "") : "";
    const sentences: BriefSentence[] = selectSentences(section.sentences, headingText, perSection).map(
      ({ index, context }) => {
        const source = section.sentences[index];
        if (!source) throw new RangeError(`selected sentence ${index} is outside its section`);
        if (!source.paragraph.includes(source.text)) {
          guardFailures.push(`${source.coordinate}: "${source.text}" is not verbatim in its paragraph`);
        }
        const violation = findProtectedExcerptViolation(source.paragraph, source.text);
        if (violation) guardFailures.push(`${source.coordinate}: ${violation}`);
        wordsAfter += countWords(source.text);
        return { sentenceId: source.sentenceId, coordinate: source.coordinate, text: source.text, context };
      },
    );
    return {
      heading: section.heading
        ? { coordinate: section.heading.coordinate, text: headingText }
        : null,
      sentences,
      sentenceCount: section.sentences.length,
    };
  });
  const wordsBefore = flattenNodes(tree).reduce((sum, node) => sum + countWords(node.rawText), 0);
  const footer = `${FOOTER_TEXT} Words: ${wordsBefore} before, ${wordsAfter} after (${percentOf(wordsAfter, wordsBefore)}%).`;
  return { perSection, sections, wordsBefore, wordsAfter, footer, guardFailures };
}

/** Plain-text form of a brief for System.Log and MCP output. One line per kept sentence. */
export function renderBrief(brief: BriefResult): string {
  const lines: string[] = [`Brief at ${brief.perSection} sentence(s) per section.`, ""];
  for (const section of brief.sections) {
    lines.push(section.heading ? `${section.heading.coordinate} ${section.heading.text}` : "Before the first heading");
    for (const sentence of section.sentences) {
      lines.push(`- ${sentence.coordinate} ${sentence.context ? "(context) " : ""}${sentence.text}`);
    }
    lines.push("");
  }
  lines.push(brief.footer);
  return lines.join("\n");
}
