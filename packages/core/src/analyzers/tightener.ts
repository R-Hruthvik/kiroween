// Deterministic filler removal. Numbers, § and citation references, RFC 2119 keywords, and negations are never changed.
import { isAbbreviationBefore } from "../ast/classifier.js";
import { findProtectedChange } from "./protected.js";

/** Removes or rewrites a phrase. Sentence-initial matches get a capitalized next word. */
function rewritePhrase(text: string, phrase: string, replacement: string): string {
  // Group 1 is the sentence start, if any. Group 2 is the next word, kept for casing.
  const pattern = new RegExp(`(^|[.!?:;][ \\t]+|\\n[ \\t]*)?\\b(?:${phrase})[ \\t]+(\\S)`, "gi");
  return text.replace(pattern, (_match, lead: string | undefined, next: string, offset: number) => {
    // At offset 0 the optional lead group is undefined, so the start of the text counts as a sentence start.
    // A dot after an abbreviation ("e.g. very large") does not start a sentence.
    const afterAbbreviation = lead?.startsWith(".") === true && isAbbreviationBefore(text, offset);
    const atStart = (lead !== undefined || offset === 0) && !afterAbbreviation;
    const prefix = lead ?? "";
    if (replacement === "") {
      return prefix + (atStart ? next.toUpperCase() : next);
    }
    const word = atStart ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
    return `${prefix}${word} ${next}`;
  });
}

/** Ordered filler rules. They only delete or recase words. No rule may create or change a modal keyword. */
const RULES: readonly ((text: string) => string)[] = [
  (text) => rewritePhrase(text, "it is (?:important|worth|useful) (?:to )?(?:note|noting|mention|mentioning) that", ""),
  (text) => rewritePhrase(text, "in order to", "to"),
  (text) => rewritePhrase(text, "basically,?", ""),
  (text) => rewritePhrase(text, "very", ""),
];

/**
 * Returns the input unchanged when no rule applies, so no-op edits do not create history entries.
 * A rule's rewrite is kept only if findProtectedChange finds no change against the original text.
 */
export function tightenText(text: string): string {
  let out = text;
  for (const rule of RULES) {
    const next = rule(out);
    if (next !== out && findProtectedChange(text, next) === null) out = next;
  }
  if (out === text || out.trim() === "") return text;
  // Collapse runs of spaces inside a line only. Line breaks stay as they are.
  return out.replace(/([^\s]) {2,}(?=\S)/g, "$1 ");
}
