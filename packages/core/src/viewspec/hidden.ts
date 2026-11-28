// What the current view hides. Pure: it reads the tree and the view state, and never changes either.
import type { DocumentTree, HiddenSummary, HiddenViewState, ViewSpecCode } from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { countWords } from "../ast/classifier.js";
import { buildBrief } from "../analyzers/brief.js";
import { bodySections } from "../analyzers/sentences.js";
import { flattenProjected, focusHidden, projectTree } from "./projector.js";

interface HiddenCounts {
  paragraphs: number;
  headings: number;
  sentences: number;
  words: number;
  addresses: string[];
}

/** The addresses in `hidden`, in document order. */
function inDocumentOrder(tree: DocumentTree, hidden: ReadonlySet<string>): string[] {
  return flattenNodes(tree)
    .map((node) => node.coordinate)
    .filter((coord) => hidden.has(coord));
}

/** Counts for the View-Spec and View.Level projection. A node is hidden when the projection drops it. */
function projectionHidden(tree: DocumentTree, view: ViewSpecCode, level: number | undefined): HiddenCounts {
  const projected = flattenProjected(projectTree(tree, view, level));
  const shown = new Set(projected.map((item) => item.node.id));
  const hidden = new Set<string>();
  let paragraphs = 0;
  let headings = 0;
  for (const node of flattenNodes(tree)) {
    if (shown.has(node.id)) continue;
    hidden.add(node.coordinate);
    if (node.role === "Heading") headings += 1;
    else paragraphs += 1;
  }
  // Only f collapses sentences. Under f every paragraph is shown, but some of its sentences are collapsed to [+Nw].
  let sentences = 0;
  let words = 0;
  if (view === "f") {
    for (const item of projected) {
      const collapsed = focusHidden(item.node);
      if (collapsed.sentences === 0) continue;
      sentences += collapsed.sentences;
      words += collapsed.words;
      hidden.add(item.node.coordinate);
    }
  }
  return { paragraphs, headings, sentences, words, addresses: inDocumentOrder(tree, hidden) };
}

/**
 * Counts for View.Brief. The brief shows whole sentences, so a paragraph is hidden when none of its
 * sentences is kept, and partly hidden when some are. Code fences have no sentences, so the brief
 * hides them as whole paragraphs. Headings are not counted, because the brief still names each section.
 */
function briefHidden(tree: DocumentTree, perSection: number): HiddenCounts {
  const kept = new Set(
    buildBrief(tree, perSection).sections.flatMap((section) => section.sentences.map((s) => s.sentenceId)),
  );
  const perParagraph = new Map<string, { total: number; hidden: number; hiddenWords: number }>();
  for (const section of bodySections(tree)) {
    for (const sentence of section.sentences) {
      const entry = perParagraph.get(sentence.coordinate) ?? { total: 0, hidden: 0, hiddenWords: 0 };
      entry.total += 1;
      if (!kept.has(sentence.sentenceId)) {
        entry.hidden += 1;
        entry.hiddenWords += countWords(sentence.text);
      }
      perParagraph.set(sentence.coordinate, entry);
    }
  }
  const hidden = new Set<string>();
  let paragraphs = 0;
  let sentences = 0;
  let words = 0;
  for (const node of flattenNodes(tree)) {
    if (node.role === "Heading") continue;
    const entry = perParagraph.get(node.coordinate);
    if (entry === undefined || entry.hidden === entry.total) {
      paragraphs += 1;
      hidden.add(node.coordinate);
    } else if (entry.hidden > 0) {
      sentences += entry.hidden;
      words += entry.hiddenWords;
      hidden.add(node.coordinate);
    }
  }
  return { paragraphs, headings: 0, sentences, words, addresses: inDocumentOrder(tree, hidden) };
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function filtersLabel(state: HiddenViewState): string {
  if (state.brief !== undefined) return `View.Brief(${state.brief})`;
  const parts = [`View.Spec(${state.view})`];
  if (state.level !== undefined) parts.push(`View.Level(${state.level})`);
  return parts.join(", ");
}

function footerLine(counts: HiddenCounts, filters: string): string {
  const parts: string[] = [];
  if (counts.paragraphs > 0) parts.push(plural(counts.paragraphs, "paragraph"));
  if (counts.headings > 0) parts.push(plural(counts.headings, "heading"));
  if (counts.sentences > 0) {
    parts.push(`${plural(counts.sentences, "sentence")} (${plural(counts.words, "word")})`);
  }
  if (parts.length === 0) return `Nothing hidden by ${filters}.`;
  return `${parts.join(", ")} hidden by ${filters}.`;
}

/**
 * What the current view hides: whole paragraphs and headings, sentences collapsed by f or by View.Brief,
 * the § addresses involved, and one footer line. An active brief replaces the view code and any level clip,
 * because the Document Track shows the brief instead of the projection. Deterministic and read-only.
 */
export function hiddenSummary(tree: DocumentTree, state: HiddenViewState): HiddenSummary {
  const counts =
    state.brief !== undefined
      ? briefHidden(tree, state.brief)
      : projectionHidden(tree, state.view, state.level);
  const filters = filtersLabel(state);
  return { ...counts, filters, text: footerLine(counts, filters) };
}
