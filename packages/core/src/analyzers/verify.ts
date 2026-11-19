import type { DocumentTree, NodeFlag } from "../types.js";
import { COORDINATE_PATTERN } from "../ast/coordinate.js";
import { flattenNodes } from "../ast/flatten.js";
import { applyFlags, computeAuditFlags } from "./audit.js";

export interface BijectionReport {
  /** True when every node has one unique coordinate, and indexByCoord maps each coordinate back to its node. */
  ok: boolean;
  nodeCount: number;
  indexSize: number;
  invalidCoordinates: string[];
  duplicateCoordinates: string[];
  nodesMissingFromIndex: string[];
  staleIndexEntries: string[];
}

export interface FlaggedItem {
  coordinate: string;
  message: string;
  relatedCoordinate?: string;
}

export interface AuditVerification {
  ok: boolean;
  bijection: BijectionReport;
  contradictions: FlaggedItem[];
  brokenReferences: FlaggedItem[];
}

/** Checks INV-2 on a tree: unique coordinates, and indexByCoord is a bijection with the nodes. Sorted output. */
export function checkCoordinateBijection(tree: DocumentTree): BijectionReport {
  const nodes = flattenNodes(tree);
  const seenCoords = new Map<string, number>();
  const invalid = new Set<string>();
  const duplicate = new Set<string>();
  const missing = new Set<string>();
  const nodeById = new Map<string, string>();

  for (const node of nodes) {
    nodeById.set(node.id, node.coordinate);
    if (!COORDINATE_PATTERN.test(node.coordinate)) invalid.add(node.coordinate);
    const count = (seenCoords.get(node.coordinate) ?? 0) + 1;
    seenCoords.set(node.coordinate, count);
    if (count > 1) duplicate.add(node.coordinate);
    if (tree.indexByCoord[node.coordinate] !== node.id) missing.add(node.coordinate);
  }

  const stale: string[] = [];
  for (const [coord, id] of Object.entries(tree.indexByCoord)) {
    if (nodeById.get(id) !== coord) stale.push(coord);
  }

  const report = {
    nodeCount: nodes.length,
    indexSize: Object.keys(tree.indexByCoord).length,
    invalidCoordinates: [...invalid].sort(),
    duplicateCoordinates: [...duplicate].sort(),
    nodesMissingFromIndex: [...missing].sort(),
    staleIndexEntries: stale.sort(),
  };
  const ok =
    report.invalidCoordinates.length === 0 &&
    report.duplicateCoordinates.length === 0 &&
    report.nodesMissingFromIndex.length === 0 &&
    report.staleIndexEntries.length === 0 &&
    report.nodeCount === report.indexSize;
  return { ok, ...report };
}

function toItems(
  tree: DocumentTree,
  type: NodeFlag["type"],
): FlaggedItem[] {
  const items: FlaggedItem[] = [];
  for (const node of flattenNodes(tree)) {
    for (const flag of node.flags) {
      if (flag.type !== type) continue;
      items.push({
        coordinate: node.coordinate,
        message: flag.message,
        ...(flag.relatedCoordinate ? { relatedCoordinate: flag.relatedCoordinate } : {}),
      });
    }
  }
  return items.sort((a, b) =>
    a.coordinate === b.coordinate
      ? a.message.localeCompare(b.message)
      : a.coordinate.localeCompare(b.coordinate),
  );
}

/**
 * Full audit check for one document: coordinate bijection, plus every CONTRADICTION and
 * BROKEN_REF flag from a fresh Spec.Audit pass. Does not mutate the input tree.
 */
export function verifyAudit(tree: DocumentTree): AuditVerification {
  const bijection = checkCoordinateBijection(tree);
  const audited = applyFlags(tree, computeAuditFlags(tree));
  const contradictions = toItems(audited, "CONTRADICTION");
  const brokenReferences = toItems(audited, "BROKEN_REF");
  return {
    ok: bijection.ok && contradictions.length === 0 && brokenReferences.length === 0,
    bijection,
    contradictions,
    brokenReferences,
  };
}
