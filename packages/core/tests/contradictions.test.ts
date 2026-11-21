import { describe, it, expect } from "vitest";
import { parseDocument, flattenNodes, computeAuditFlags, applyFlags, BUILTIN_REGISTRY, createWorkbenchState, runLine } from "../src/index.js";
import type { DocumentTree, NodeFlag } from "../src/types.js";

function contradictionsOf(markdown: string): { coordinate: string; flag: NodeFlag }[] {
  const tree = parseDocument(markdown);
  const audited = applyFlags(tree, computeAuditFlags(tree));
  return flattenNodes(audited).flatMap((node) =>
    node.flags.filter((flag) => flag.type === "CONTRADICTION").map((flag) => ({ coordinate: node.coordinate, flag })),
  );
}

const PASSWORD_RESET_SPEC = `# Password Reset

## Token lifetime

Password reset tokens MUST expire within 15 minutes of issue.

Reset tokens remain valid for 24 hours after issue.

## Logging

Password reset tokens MUST NOT be logged.

Password reset tokens SHALL be logged to the request log for audit.
`;

describe("numeric and polarity contradictions (A3 / G10, G13)", () => {
  it("catches both planted contradictions in a password-reset spec", () => {
    const found = contradictionsOf(PASSWORD_RESET_SPEC);
    const coords = found.map((item) => item.coordinate).sort();
    expect(coords).toEqual(["§1.1a", "§1.1b", "§1.2a", "§1.2b"]);
    expect(found.some((item) => item.flag.message.includes("15 minutes") && item.flag.message.includes("24 hours"))).toBe(true);
    expect(found.some((item) => item.flag.message.includes("MUST NOT be logged") && item.flag.message.includes("SHALL be logged"))).toBe(true);
  });

  it("catches MUST NOT against SHALL on the same subject and verb", () => {
    const found = contradictionsOf("## A\n\nSession tokens MUST NOT be logged.\n\nSession tokens SHALL be logged.\n");
    expect(found.map((item) => item.coordinate).sort()).toEqual(["§1a", "§1b"]);
  });

  it("catches a 50 ms requirement against a 200 ms claim on the same metric", () => {
    const found = contradictionsOf("## A\n\nThe system SHALL respond within 50 ms.\n\nResponses take 200 ms.\n");
    expect(found.map((item) => item.coordinate).sort()).toEqual(["§1a", "§1b"]);
  });

  it("catches a 15 minute expiry against a 24 hour expiry", () => {
    const found = contradictionsOf("## A\n\nPassword reset tokens expire in 15 minutes.\n\nPassword reset tokens expire after 24 hours.\n");
    expect(found.length).toBeGreaterThan(0);
  });

  it("does not flag log retention 7 days against backup retention 90 days", () => {
    expect(contradictionsOf("## A\n\nLog retention MUST be 7 days.\n\nBackup retention MUST be 90 days.\n")).toEqual([]);
  });

  it("does not treat a region count as a latency value", () => {
    expect(contradictionsOf("## A\n\nLatency across 3 regions is 50 ms.\n\nLatency across 5 regions is 50 ms.\n")).toEqual([]);
  });

  it("does not flag a MUST and a MUST NOT on different subjects or objects", () => {
    expect(contradictionsOf("## A\n\nThe system SHALL log requests.\n\nThe system MUST NOT log passwords.\n")).toEqual([]);
  });

  it("keeps CONTRADICTION output bounded on a 500-paragraph document", () => {
    const body = Array.from(
      { length: 500 },
      (_, i) => `The system SHALL respond within ${10 + (i % 7)} ms and retention MUST be ${i % 3} days.`,
    ).join("\n\n");
    const found = contradictionsOf(`## Big\n\n${body}\n`);
    expect(found.length).toBeLessThanOrEqual(5 * 500);
    expect(found.length).toBeGreaterThan(0);
  });
});

describe("Doc.InjectFlaw keeps Spec.Audit monotonic (mutation gap, broken-ref)", () => {
  it("adds more flags than the base document when there are many dangling references", async () => {
    const refs = Array.from({ length: 16 }, (_, i) => `§${200 + i}.1a`).join(", ");
    const tree: DocumentTree = parseDocument(`# A\n\nSee ${refs}.\n\nThe system SHALL keep latency under 40 ms.\n`);
    const base = await runLine(createWorkbenchState(tree), "Spec.Audit", BUILTIN_REGISTRY);
    const injected = await runLine(createWorkbenchState(tree), "Doc.InjectFlaw -> Spec.Audit", BUILTIN_REGISTRY);
    const count = (state: typeof base): number =>
      flattenNodes(state.history.present).reduce((sum, node) => sum + node.flags.length, 0);
    expect(count(injected)).toBeGreaterThan(count(base));
  });

  it("injects a broken reference that is absent from the index after injection", async () => {
    const tree = parseDocument("# A\n\nPlain text.\n");
    const injected = await runLine(createWorkbenchState(tree), "Doc.InjectFlaw", BUILTIN_REGISTRY);
    const target = /as noted in (§[^\s.]+(?:\.[^\s.]+)?)/.exec(
      flattenNodes(injected.history.present).map((n) => n.rawText).join("\n"),
    )?.[1];
    expect(target).toBeDefined();
    expect(Object.hasOwn(injected.history.present.indexByCoord, target ?? "")).toBe(false);
  });
});
