import { describe, it, expect } from "vitest";
import {
  parseDocument,
  buildBrief,
  buildLedger,
  renderLedger,
  conditionClause,
  createWorkbenchState,
  runLine,
  BUILTIN_REGISTRY,
} from "../src/index.js";

const SPEC = `# Billing

If the request is invalid, the server MUST reply 400. Clients MAY retry, unless the body is empty.

Invoices are sent monthly. Refunds SHOULD NOT exceed 30 days, except for fraud.

# Retention

Records MUST be deleted when the account closes. Dr. Patel signs off.
`;

describe("Spec.Ledger rows", () => {
  it("has one row per sentence with an RFC 2119 keyword", () => {
    const report = buildLedger(parseDocument(SPEC), 1);
    expect(report.rows.map((row) => [row.coordinate, row.modal])).toEqual([
      ["§1a", "MUST"],
      ["§1a", "MAY"],
      ["§1b", "SHOULD NOT"],
      ["§2a", "MUST"],
    ]);
  });

  it("extracts the condition or exception clause", () => {
    const rows = buildLedger(parseDocument(SPEC), 1).rows;
    expect(rows[0]?.condition).toBe("If the request is invalid");
    expect(rows[1]?.condition).toBe("unless the body is empty");
    expect(rows[2]?.condition).toBe("except for fraud");
    expect(rows[3]?.condition).toBe("when the account closes");
  });

  it("keeps the verbatim sentence text, including abbreviations", () => {
    const rows = buildLedger(parseDocument(SPEC), 1).rows;
    expect(rows[3]?.text).toBe("Records MUST be deleted when the account closes.");
    expect(conditionClause("Dr. Patel signs off.")).toBeNull();
  });
});

describe("Spec.Ledger coverage against View.Brief", () => {
  it("marks each row as in the brief or omitted, and the counts add up", () => {
    const tree = parseDocument(SPEC);
    const report = buildLedger(tree, 1);
    const kept = new Set(
      buildBrief(tree, 1).sections.flatMap((section) => section.sentences.map((s) => s.sentenceId)),
    );
    for (const row of report.rows) expect(row.inBrief).toBe(kept.has(row.sentenceId));
    expect(report.inBrief + report.omitted).toBe(report.rows.length);
    expect(report.omitted).toBeGreaterThan(0);
    expect(report.unaccounted).toBe(0);
    expect(report.guardFailures).toEqual([]);
  });

  it("lists every row as in the brief when the brief keeps all sentences", () => {
    const report = buildLedger(parseDocument(SPEC), 10);
    expect(report.omitted).toBe(0);
    expect(report.inBrief).toBe(report.rows.length);
  });
});

describe("Spec.Ledger command", () => {
  it("is read-only and reports the coverage line", async () => {
    const tree = parseDocument(SPEC);
    const next = await runLine(createWorkbenchState(tree), "Spec.Ledger", BUILTIN_REGISTRY);
    expect(next.history.present).toEqual(tree);
    expect(next.history.past).toHaveLength(0);
    const body = next.log.at(-1)?.body ?? "";
    expect(body).toContain("| Address | Modal | Condition | Status | Text |");
    expect(body).toContain("Unaccounted: 0. Guard failures: 0.");
  });

  it("rejects an invalid count", async () => {
    const next = await runLine(createWorkbenchState(parseDocument(SPEC)), "Spec.Ledger(0)", BUILTIN_REGISTRY);
    expect(next.log.at(-1)?.error).toMatch(/Spec\.Ledger expects a positive integer/);
  });

  it("escapes pipes inside a sentence so the table keeps its columns", () => {
    const report = buildLedger(parseDocument("# A\n\nThe API MUST accept a | b input.\n"), 1);
    const line = renderLedger(report).split("\n").find((l) => l.includes("MUST accept"));
    expect(line).toContain("a \\| b input.");
  });
});

describe("condition clauses", () => {
  it("skips a bare condition word", () => {
    expect(conditionClause("It applies when, and only when, the flag is set.")).toBeNull();
  });

  it("joins distinct clauses in order", () => {
    expect(conditionClause("The API MUST log when the flag is set, unless it is off.")).toBe(
      "when the flag is set; unless it is off",
    );
  });
});
