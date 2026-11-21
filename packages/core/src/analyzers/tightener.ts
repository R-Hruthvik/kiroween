// Deterministic filler removal and EARS rewrites. Numbers and § references are never touched.

/** Removes or rewrites a phrase. Sentence-initial matches get a capitalized next word. */
function rewritePhrase(text: string, phrase: string, replacement: string): string {
  // Group 1 is the sentence start, if any. Group 2 is the next word, kept for casing.
  const pattern = new RegExp(`(^|[.!?:;][ \\t]+|\\n[ \\t]*)?\\b(?:${phrase})[ \\t]+(\\S)`, "gi");
  return text.replace(pattern, (_match, lead: string | undefined, next: string, offset: number) => {
    // At offset 0 the optional lead group is undefined, so the start of the text counts as a sentence start.
    const atStart = lead !== undefined || offset === 0;
    const prefix = lead ?? "";
    if (replacement === "") {
      return prefix + (atStart ? next.toUpperCase() : next);
    }
    const word = atStart ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
    return `${prefix}${word} ${next}`;
  });
}

/** Ordered rules. Subject casing is kept from the source text, so "The system" stays "The system". */
const RULES: readonly ((text: string) => string)[] = [
  (text) => rewritePhrase(text, "it is (?:important|worth|useful) (?:to )?(?:note|noting|mention|mentioning) that", ""),
  (text) => rewritePhrase(text, "in order to", "to"),
  (text) => rewritePhrase(text, "basically,?", ""),
  (text) => rewritePhrase(text, "very", ""),
  (text) => text.replace(/\b(the system) (?:should try to|should|will) /gi, "$1 SHALL "),
  (text) => text.replace(/\b(\w+) is required to /gi, "$1 SHALL "),
];

/** Returns the input unchanged when no rule applies, so no-op edits do not create history entries. */
export function tightenText(text: string): string {
  let out = text;
  for (const rule of RULES) {
    out = rule(out);
  }
  if (out === text || out.trim() === "") return text;
  // Collapse runs of spaces inside a line only. Line breaks stay as they are.
  return out.replace(/([^\s]) {2,}(?=\S)/g, "$1 ");
}
