import { describe, it, expect } from "vitest";
import { formatLogBody, summarizeLogEntry, type LogEntry } from "../src/index.js";

describe("summarizeLogEntry", () => {
  it("shows an error once, as the summary", () => {
    const entry: LogEntry = {
      title: "View.Spec(x)",
      body: "### View.Spec(x)\nERROR: View.Spec expects one of a, h, f, u, r.",
      error: "View.Spec expects one of a, h, f, u, r.",
    };
    expect(summarizeLogEntry(entry)).toBe("error: View.Spec expects one of a, h, f, u, r.");
    expect(formatLogBody(entry)).toBe("");
  });

  it("counts flags and the nodes they sit on", () => {
    const entry: LogEntry = {
      title: "Spec.Audit",
      body: [
        "### Spec.Audit",
        "CONTRADICTION: 1, UNVERIFIED_CLAIM: 2",
        "- §1.1a [UNVERIFIED_CLAIM] first",
        "- §1.1a [CONTRADICTION] second",
        "- §2a [UNVERIFIED_CLAIM] third",
      ].join("\n"),
    };
    expect(summarizeLogEntry(entry)).toBe("3 flags on 2 nodes");
  });

  it("uses the first line of an output with no flags", () => {
    const entry: LogEntry = { title: "Cite.Verify", body: "### Cite.Verify\nBroken references: 0. Unverified claims: 0." };
    expect(summarizeLogEntry(entry)).toBe("Broken references: 0. Unverified claims: 0.");
  });

  it("gives a placeholder for an empty output", () => {
    expect(summarizeLogEntry({ title: "System.ClearLog", body: "" })).toBe("no output");
  });

  it("uses singular words for one flag on one node", () => {
    const entry: LogEntry = { title: "Spec.Audit", body: "- §1a [AMBIGUOUS_TERM] vague" };
    expect(summarizeLogEntry(entry)).toBe("1 flag on 1 node");
  });
});

describe("formatLogBody", () => {
  it("collapses flag lines to one line per node, with types and distinct messages", () => {
    const entry: LogEntry = {
      title: "Spec.Audit",
      body: [
        "### Spec.Audit",
        "UNVERIFIED_CLAIM: 2",
        "- §1.1a [UNVERIFIED_CLAIM] first",
        "- §1.1a [CONTRADICTION] clash",
        "- §1.1a [UNVERIFIED_CLAIM] first",
        "- §2a [UNVERIFIED_CLAIM] other",
      ].join("\n"),
    };
    expect(formatLogBody(entry)).toBe(
      [
        "UNVERIFIED_CLAIM: 2",
        "- §1.1a [UNVERIFIED_CLAIM, CONTRADICTION] first · clash",
        "- §2a [UNVERIFIED_CLAIM] other",
      ].join("\n"),
    );
  });

  it("keeps each stage name of a pipeline as a line and drops the section markers", () => {
    const entry: LogEntry = {
      title: "Spec.Audit -> Cite.Verify",
      body: "### Spec.Audit\nNo flags.\n\n### Cite.Verify\nBroken references: 0.",
    };
    expect(formatLogBody(entry)).toBe("Spec.Audit\nNo flags.\n\nCite.Verify\nBroken references: 0.");
  });
});
