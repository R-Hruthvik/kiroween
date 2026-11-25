// Sentence extraction shared by View.Brief and Spec.Ledger, so both read the same sentences.
import type { DocNode, DocumentTree, SourceSentence } from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { isCodeFence, splitSentences } from "../ast/classifier.js";
import { rfc2119KeywordsIn } from "./protected.js";

/** A condition or exception word starts a clause. The clause runs to the next comma, semicolon, or the sentence end. */
const CONDITION_START = /\b(?:if|when|unless|except)\b/gi;

/**
 * The if, when, unless, and except clauses of a sentence, joined by "; ". Clauses start at the
 * condition word, so "only if" yields the clause from "if". A clause must have a word after the
 * condition word, so "when, and only when," gives nothing. Null when there are none.
 */
export function conditionClause(sentence: string): string | null {
  const clauses = new Set<string>();
  let skipUntil = 0;
  for (const match of sentence.matchAll(CONDITION_START)) {
    const start = match.index ?? 0;
    if (start < skipUntil) continue;
    const rest = sentence.slice(start);
    const stop = rest.search(/[,;]/);
    const clause = (stop === -1 ? rest : rest.slice(0, stop)).replace(/[.!?]+$/, "").trim();
    skipUntil = start + clause.length;
    if (clause.split(/\s+/).length < 2) continue;
    clauses.add(clause);
  }
  return clauses.size > 0 ? [...clauses].join("; ") : null;
}

/** Sentences of one body node. Headings and code fences have none. */
function sentencesOf(node: DocNode): SourceSentence[] {
  if (node.role === "Heading" || isCodeFence(node.rawText)) return [];
  const paragraph = node.rawText.replace(/\s+/g, " ").trim();
  return splitSentences(node.rawText).map((text, index) => ({
    sentenceId: `${node.id}:${index}`,
    coordinate: node.coordinate,
    text,
    paragraph,
    modals: rfc2119KeywordsIn(text),
    condition: conditionClause(text),
  }));
}

/** A heading's own body paragraphs, or the preamble (heading null), in document order. */
export interface BodySection {
  heading: DocNode | null;
  sentences: SourceSentence[];
}

/**
 * Every section that has at least one sentence. The preamble comes first, then each heading in
 * document order. A heading's body is its direct body children, not the text under its sub-headings.
 */
export function bodySections(tree: DocumentTree): BodySection[] {
  const sections: BodySection[] = [];
  const preamble = tree.rootNodes.filter((node) => node.role !== "Heading").flatMap(sentencesOf);
  if (preamble.length > 0) sections.push({ heading: null, sentences: preamble });
  for (const node of flattenNodes(tree)) {
    if (node.role !== "Heading") continue;
    const sentences = node.children.filter((child) => child.role !== "Heading").flatMap(sentencesOf);
    if (sentences.length > 0) sections.push({ heading: node, sentences });
  }
  return sections;
}
