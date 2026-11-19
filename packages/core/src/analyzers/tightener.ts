// Deterministic filler removal and EARS rewrites. Numbers and § references are never touched.
const RULES: readonly (readonly [RegExp, string])[] = [
  [/\bit is (?:important|worth) (?:to )?(?:note|noting|noted) that\s+/gi, ""],
  [/\bin order to\s+/gi, "to "],
  [/\bbasically,?\s+/gi, ""],
  [/\bvery\s+/gi, ""],
  [/\bthe system should try to\s+/gi, "THE SYSTEM SHALL "],
  [/\bthe system should\s+/gi, "THE SYSTEM SHALL "],
  [/\bthe system will\s+/gi, "THE SYSTEM SHALL "],
  [/\bis required to\s+/gi, "SHALL "],
];

/** Returns the input unchanged when no rule applies, so no-op edits do not create history entries. */
export function tightenText(text: string): string {
  let out = text;
  for (const [pattern, replacement] of RULES) {
    out = out.replace(pattern, replacement);
  }
  if (out === text || out.trim() === "") return text;
  out = out.replace(/[ \t]{2,}/g, " ");
  if (/^[A-Z]/.test(text) && /^[a-z]+(?=\s)/.test(out)) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}
