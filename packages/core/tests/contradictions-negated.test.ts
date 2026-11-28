import { describe, it, expect } from "vitest";
import { parseDocument, flattenNodes, computeAuditFlags, applyFlags } from "../src/index.js";
import type { NodeFlag } from "../src/types.js";

function contradictionsOf(markdown: string): { coordinate: string; flag: NodeFlag }[] {
  const tree = parseDocument(markdown);
  const audited = applyFlags(tree, computeAuditFlags(tree));
  return flattenNodes(audited).flatMap((node) =>
    node.flags.filter((flag) => flag.type === "CONTRADICTION").map((flag) => ({ coordinate: node.coordinate, flag })),
  );
}

/** Coordinates of the nodes the classifier reads as Requirements, so a negative check cannot pass on non-requirements. */
function requirementCoordinates(markdown: string): string[] {
  return flattenNodes(parseDocument(markdown))
    .filter((node) => node.role === "Requirement")
    .map((node) => node.coordinate);
}

describe("negated comparators pick the right direction (contradiction direction fix)", () => {
  it("does not flag 'no more than 100 ms' against 'under 50 ms', since both are upper bounds", () => {
    const doc = "## Latency\n\nThe system SHALL keep latency no more than 100 ms.\n\nThe system SHALL keep latency under 50 ms.\n";
    expect(requirementCoordinates(doc)).toEqual(["§1a", "§1b"]);
    expect(contradictionsOf(doc)).toEqual([]);
  });

  it("does not flag 'no greater than 100 ms' against 'under 50 ms', since both are upper bounds", () => {
    const doc = "## Latency\n\nThe system SHALL keep latency no greater than 100 ms.\n\nThe system SHALL keep latency under 50 ms.\n";
    expect(requirementCoordinates(doc)).toEqual(["§1a", "§1b"]);
    expect(contradictionsOf(doc)).toEqual([]);
  });

  it("flags 'no less than 100 ms' against 'under 50 ms' on both nodes, since at least 100 and at most 50 cannot both hold", () => {
    const doc = "## Latency\n\nThe system SHALL keep latency no less than 100 ms.\n\nThe system SHALL keep latency under 50 ms.\n";
    expect(requirementCoordinates(doc)).toEqual(["§1a", "§1b"]);
    expect(contradictionsOf(doc).map((item) => item.coordinate).sort()).toEqual(["§1a", "§1b"]);
  });

  it("flags 'no more than 100 ms' against 'at least 200 ms' on both nodes", () => {
    const doc = "## Latency\n\nThe system SHALL keep latency no more than 100 ms.\n\nThe system SHALL keep latency at least 200 ms.\n";
    expect(requirementCoordinates(doc)).toEqual(["§1a", "§1b"]);
    expect(contradictionsOf(doc).map((item) => item.coordinate).sort()).toEqual(["§1a", "§1b"]);
  });
});
