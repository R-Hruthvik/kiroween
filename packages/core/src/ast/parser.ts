import type { DocNode, DocumentTree } from "../types.js";
import { letterSuffix } from "./coordinate.js";
import {
  brokenRefFlags,
  classificationFlags,
  classifyRole,
  extractCitations,
  splitFirstSentence,
} from "./classifier.js";
import { flattenNodeList, serializeTree } from "./flatten.js";

const HEADING_LINE = /^(#{1,6})[ \t]+(\S.*)$/;

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "body"; text: string };

/** Splits markdown into heading lines and blank-line-separated body paragraphs. */
function splitBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let pending: string[] = [];
  const flush = (): void => {
    if (pending.length > 0) {
      blocks.push({ kind: "body", text: pending.join("\n") });
      pending = [];
    }
  };
  for (const line of markdown.split(/\r?\n/)) {
    const heading = HEADING_LINE.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", level: (heading[1] ?? "").length, text: line });
    } else if (line.trim() === "") {
      flush();
    } else {
      pending.push(line);
    }
  }
  flush();
  return blocks;
}

export interface ParseOptions {
  id?: string;
  version?: number;
}

/** FNV-1a hash, used for a deterministic default document id. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Parses markdown or plain text into a DocumentTree with § coordinates.
 * Headings nest by level. Each body paragraph is a child of the most recent heading.
 * Body text before any heading belongs to the preamble, which uses §0a, §0b, and so on.
 */
export function parseDocument(markdown: string, options: ParseOptions = {}): DocumentTree {
  type Key = DocNode | "root" | "preamble";
  const rootNodes: DocNode[] = [];
  const headingStack: DocNode[] = [];
  const headingIds = new Set<string>();
  const counters = new Map<Key, { headings: number; bodies: number }>();
  const countersFor = (key: Key): { headings: number; bodies: number } => {
    const existing = counters.get(key);
    if (existing) return existing;
    const created = { headings: 0, bodies: 0 };
    counters.set(key, created);
    return created;
  };

  let sequence = 0;
  const createNode = (coordinate: string, depth: number, rawText: string): DocNode => {
    sequence += 1;
    return {
      id: `n${sequence}`,
      coordinate,
      depth,
      role: "Prose",
      rawText,
      firstSentence: rawText,
      hiddenWordCount: 0,
      citations: [],
      flags: [],
      children: [],
    };
  };

  for (const block of splitBlocks(markdown)) {
    if (block.kind === "heading") {
      while (
        headingStack.length > 0 &&
        (headingStack.at(-1)?.depth ?? 0) >= block.level
      ) {
        headingStack.pop();
      }
      const owner = headingStack.at(-1) ?? null;
      const counter = countersFor(owner ?? "root");
      counter.headings += 1;
      // Parent-relative numbering keeps coordinates valid when a level is skipped.
      const coordinate = owner
        ? `${owner.coordinate}.${counter.headings}`
        : `§${counter.headings}`;
      const node = createNode(coordinate, block.level, block.text);
      (owner ? owner.children : rootNodes).push(node);
      headingIds.add(node.id);
      headingStack.push(node);
    } else {
      const parent = headingStack.at(-1) ?? null;
      const counter = countersFor(parent ?? "preamble");
      const letter = letterSuffix(counter.bodies);
      counter.bodies += 1;
      const coordinate = parent ? `${parent.coordinate}${letter}` : `§0${letter}`;
      const node = createNode(coordinate, parent ? parent.depth + 1 : 1, block.text);
      (parent ? parent.children : rootNodes).push(node);
    }
  }

  const flat = flattenNodeList(rootNodes);
  const indexByCoord: Record<string, string> = {};
  for (const node of flat) {
    indexByCoord[node.coordinate] = node.id;
  }

  for (const node of flat) {
    const isHeading = headingIds.has(node.id);
    node.role = classifyRole(node.rawText, isHeading);
    node.citations = extractCitations(node.rawText);
    if (isHeading) {
      node.firstSentence = node.rawText;
      node.hiddenWordCount = 0;
    } else {
      const split = splitFirstSentence(node.rawText);
      node.firstSentence = split.firstSentence;
      node.hiddenWordCount = split.hiddenWordCount;
    }
    node.flags = [
      ...brokenRefFlags(node.rawText, indexByCoord),
      ...classificationFlags(node.role, node.citations),
    ];
  }

  const firstHeading =
    flat.find((node) => headingIds.has(node.id) && node.depth === 1) ??
    flat.find((node) => headingIds.has(node.id));
  const title = firstHeading ? firstHeading.rawText.replace(/^#+\s+/, "") : "Untitled";

  return {
    id: options.id ?? `doc-${fnv1a(markdown)}`,
    title,
    version: options.version ?? 1,
    rootNodes,
    indexByCoord,
  };
}

/**
 * Rebuilds a tree from edited markdown, keeping the document id and bumping the version.
 * Used by mutating commands.
 */
export function rebuildDocument(tree: DocumentTree, markdown: string): DocumentTree {
  return parseDocument(markdown, { id: tree.id, version: tree.version + 1 });
}

/** Re-serializes a tree and appends extra markdown. Used by Doc.InjectFlaw. */
export function appendMarkdown(tree: DocumentTree, extra: string): string {
  const base = serializeTree(tree);
  return base.length > 0 ? `${base}\n\n${extra}` : extra;
}
