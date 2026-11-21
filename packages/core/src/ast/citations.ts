import type { DocNode, NodeFlag } from "../types.js";

// Bracketed citation keys: [1], [7], [RFC2616], [RFC 2616], [KEP-3157].
export const BRACKET_KEY = /\[(\d+|[A-Za-z][A-Za-z]*[- ]?\d[\w.-]*)\]/g;

const REFERENCES_HEADING = /^(?:references?|sources?|bibliography|works cited|citations?)$/i;
const DEFINITION_LINE = /^[ \t]*\[([^\]\n]+)\][ \t]+\S/gm;

/** Normalizes a citation key so "RFC 2616", "RFC-2616", and "rfc2616" match. */
export function normalizeKey(raw: string): string {
  return raw.replace(/[\s-]+/g, "").toLowerCase();
}

/**
 * Collects the keys defined in the references section. A section starts at a heading whose title
 * is References, Sources, Bibliography, and so on, and ends at the next heading of the same or a
 * higher level. Definitions are lines that begin with a bracketed key, such as "[1] Title".
 */
export function collectReferenceKeys(nodes: readonly DocNode[]): Set<string> {
  const keys = new Set<string>();
  let sectionDepth: number | null = null;
  for (const node of nodes) {
    if (node.role === "Heading") {
      const title = node.rawText.replace(/^#+[ \t]*/, "").trim();
      if (REFERENCES_HEADING.test(title)) {
        sectionDepth = node.depth;
      } else if (sectionDepth !== null && node.depth <= sectionDepth) {
        sectionDepth = null;
      }
      continue;
    }
    if (sectionDepth === null) continue;
    for (const match of node.rawText.matchAll(DEFINITION_LINE)) {
      keys.add(normalizeKey(match[1] ?? ""));
    }
  }
  return keys;
}

/** One BROKEN_REF flag per distinct bracketed citation that has no matching reference entry. */
export function citationKeyFlags(text: string, keys: ReadonlySet<string>): NodeFlag[] {
  const seen = new Set<string>();
  const flags: NodeFlag[] = [];
  for (const match of text.matchAll(BRACKET_KEY)) {
    const raw = match[1] ?? "";
    const key = normalizeKey(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!keys.has(key)) {
      flags.push({
        type: "BROKEN_REF",
        message: `Citation [${raw}] has no matching entry in the references section.`,
      });
    }
  }
  return flags;
}
