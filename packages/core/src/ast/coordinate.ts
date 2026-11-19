// § coordinate grammar. See .kiro/steering/oberon-nls-grammar.md section 1.

// A coordinate or reference: §1, §1.2, §1.2a, or preamble §0a.
// The negative lookahead stops "§1.2and" from matching as "§1" or "§1.2".
const REF_SOURCE = String.raw`§(?:0[a-z]+|[1-9]\d*(?:\.[1-9]\d*)*[a-z]*)(?!\.?\d|[A-Za-z0-9])`;

export const REF_PATTERN = new RegExp(REF_SOURCE, "g");

export const CITATION_PATTERN = new RegExp(
  String.raw`\[\d+\]|https?:\/\/[^\s)\]]+|` + REF_SOURCE,
  "g",
);

// Full validity check for a node coordinate.
export const COORDINATE_PATTERN = /^§(?:0[a-z]+|[1-9]\d*(?:\.[1-9]\d*)*[a-z]*)$/;

/**
 * Letter suffix for the body paragraph at `index` under one heading.
 * Bijective base-26 on index + 1: 0 -> "a", 25 -> "z", 26 -> "aa", 27 -> "ab".
 */
export function letterSuffix(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new RangeError(`letterSuffix expects a non-negative integer, got ${index}`);
  }
  let n = index + 1;
  let suffix = "";
  while (n > 0) {
    const digit = (n - 1) % 26;
    suffix = String.fromCharCode(97 + digit) + suffix;
    n = Math.floor((n - 1) / 26);
  }
  return suffix;
}

/** Coordinates that appear in `text` and exist in `indexByCoord`, in order of first appearance. */
export function coordinatesMentioned(
  text: string,
  indexByCoord: Readonly<Record<string, string>>,
): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(REF_PATTERN)) {
    const coord = match[0];
    if (COORDINATE_PATTERN.test(coord) && Object.hasOwn(indexByCoord, coord)) found.add(coord);
  }
  return [...found];
}
