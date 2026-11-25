// Spec.Ledger: one row for every sentence with an RFC 2119 keyword. Read-only. Pure and deterministic.
import type { DocumentTree, LedgerReport, LedgerRow } from "../types.js";
import { buildBrief } from "./brief.js";
import { findProtectedExcerptViolation, rfc2119KeywordsIn } from "./protected.js";
import { bodySections } from "./sentences.js";

/**
 * Builds the ledger for a tree. It also checks the View.Brief with the same sentence count: every row
 * is either in the brief or listed as omitted, and every keyword sentence in the brief has a row.
 */
export function buildLedger(tree: DocumentTree, perSection: number): LedgerReport {
  const brief = buildBrief(tree, perSection);
  const kept = new Set(brief.sections.flatMap((section) => section.sentences.map((s) => s.sentenceId)));
  const guardFailures = [...brief.guardFailures];

  const rows: LedgerRow[] = bodySections(tree)
    .flatMap((section) => section.sentences)
    .filter((sentence) => sentence.modals.length > 0)
    .map((sentence) => {
      const violation = findProtectedExcerptViolation(sentence.paragraph, sentence.text);
      if (violation) guardFailures.push(`${sentence.coordinate}: ${violation}`);
      return {
        sentenceId: sentence.sentenceId,
        coordinate: sentence.coordinate,
        modal: sentence.modals.join(", "),
        condition: sentence.condition,
        text: sentence.text,
        inBrief: kept.has(sentence.sentenceId),
      };
    });

  const rowIds = new Set(rows.map((row) => row.sentenceId));
  const unaccounted = brief.sections
    .flatMap((section) => section.sentences)
    .filter((sentence) => rfc2119KeywordsIn(sentence.text).length > 0 && !rowIds.has(sentence.sentenceId)).length;
  const inBrief = rows.filter((row) => row.inBrief).length;
  return {
    perSection,
    rows,
    inBrief,
    omitted: rows.length - inBrief,
    unaccounted,
    guardFailures,
  };
}

/** Markdown table for System.Log and MCP output. Pipes inside the sentence are escaped. */
export function renderLedger(report: LedgerReport): string {
  const head = [
    `Ledger: ${report.rows.length} sentence(s) with an RFC 2119 keyword. Brief at ${report.perSection} sentence(s) per section keeps ${report.inBrief}, and ${report.omitted} are omitted.`,
    `Unaccounted: ${report.unaccounted}. Guard failures: ${report.guardFailures.length}.`,
    "",
    "| Address | Modal | Condition | Status | Text |",
    "| --- | --- | --- | --- | --- |",
  ];
  const rows = report.rows.map((row) => {
    const cells = [
      row.coordinate,
      row.modal,
      row.condition ?? "",
      row.inBrief ? "in brief" : "omitted",
      row.text,
    ].map((cell) => cell.replace(/\|/g, "\\|"));
    return `| ${cells.join(" | ")} |`;
  });
  return [...head, ...rows].join("\n");
}
