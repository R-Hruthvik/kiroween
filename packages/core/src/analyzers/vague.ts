// Vague terms from INCOSE and EARS requirement-writing guidance. Matched as whole words or phrases.
export const VAGUE_TERMS: readonly string[] = [
  "fast", "quick", "quickly", "rapid", "scalable", "flexible", "robust", "efficient", "optimal",
  "adequate", "appropriate", "reasonable", "minimal", "user-friendly", "intuitive", "seamless",
  "seamlessly", "easy", "easily", "simple", "significant", "sufficient", "acceptable", "suitable",
  "timely", "soon", "shortly", "as needed", "as appropriate", "where possible", "if possible",
  "normal", "typical", "various", "several", "state-of-the-art", "TBD", "TBC", "TBR",
];

const VAGUE_PATTERN = new RegExp(
  `\\b(${[...VAGUE_TERMS]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&").replace(/ /g, "\\s+"))
    .join("|")})\\b`,
  "gi",
);

/** Distinct vague terms in the text, lowercased, in order of first appearance. */
export function vagueTermsIn(text: string): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const match of text.matchAll(VAGUE_PATTERN)) {
    const term = (match[1] ?? "").toLowerCase().replace(/\s+/g, " ");
    if (seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }
  return terms;
}
