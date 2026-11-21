import type {
  CommandHandler,
  CommandOutcome,
  DocumentTree,
  NodeFlag,
  ViewSpecCode,
} from "../types.js";
import { flattenNodes } from "../ast/flatten.js";
import { appendMarkdown, parseDocument, rebuildDocument } from "../ast/parser.js";
import { brokenRefFlags, isCodeFence } from "../ast/classifier.js";
import { projectTree, countProjected } from "../viewspec/projector.js";
import { applyFlags, citeVerifyFlags, computeAuditFlags } from "../analyzers/audit.js";
import { tightenText } from "../analyzers/tightener.js";
import { buildTaskChecklist } from "../analyzers/extractor.js";
import { createRegistry, type CommandEntry, type CommandRegistry } from "./registry.js";

const VIEW_CODES: readonly ViewSpecCode[] = ["a", "h", "f", "u", "r"];

function isViewCode(value: string): value is ViewSpecCode {
  return (VIEW_CODES as readonly string[]).includes(value);
}

/** The flaw paragraphs are built in injectFlawMarkdown below. */

function noChange(tree: DocumentTree, logTitle: string, logBody: string): CommandOutcome {
  return { updatedTree: tree, logTitle, logBody, affectedCoordinates: [], mutated: false };
}

function failure(tree: DocumentTree, logTitle: string, error: string): CommandOutcome {
  return { ...noChange(tree, logTitle, ""), error };
}

function countByType(flags: readonly NodeFlag[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const flag of flags) counts.set(flag.type, (counts.get(flag.type) ?? 0) + 1);
  return counts;
}

export const viewSpec: CommandHandler = (ctx, arg) => {
  const code = arg ?? "";
  const title = `View.Spec(${code})`;
  if (!isViewCode(code)) {
    return failure(ctx.tree, title, `View.Spec expects one of a, h, f, u, r. Got "${code}".`);
  }
  const total = flattenNodes(ctx.tree).length;
  const visible = countProjected(projectTree(ctx.tree, code));
  return {
    ...noChange(ctx.tree, title, `Visible nodes: ${visible}. Hidden nodes: ${total - visible}.`),
    nextViewSpec: code,
  };
};

export const specAudit: CommandHandler = (ctx) => {
  const flagsById = computeAuditFlags(ctx.tree);
  const updatedTree = applyFlags(ctx.tree, flagsById);
  const lines: string[] = [];
  const coordinates: string[] = [];
  for (const node of flattenNodes(updatedTree)) {
    for (const flag of node.flags) {
      lines.push(`- ${node.coordinate} [${flag.type}] ${flag.message}`);
      coordinates.push(node.coordinate);
    }
  }
  const counts = countByType(flattenNodes(updatedTree).flatMap((node) => node.flags));
  const summary = [...counts.entries()].map(([type, count]) => `${type}: ${count}`).join(", ");
  return {
    updatedTree,
    logTitle: "Spec.Audit",
    logBody: lines.length > 0 ? `${summary}\n${lines.join("\n")}` : "No flags.",
    affectedCoordinates: coordinates,
    mutated: false,
  };
};

export const specTighten: CommandHandler = (ctx) => {
  const scope = ctx.selectedNodeIds.length > 0 ? new Set(ctx.selectedNodeIds) : null;
  const changed: string[] = [];
  const texts = flattenNodes(ctx.tree).map((node) => {
    const skip =
      node.role === "Heading" || isCodeFence(node.rawText) || (scope !== null && !scope.has(node.id));
    if (skip) return node.rawText;
    const next = tightenText(node.rawText);
    if (next !== node.rawText) changed.push(node.coordinate);
    return next;
  });
  if (changed.length === 0) {
    return noChange(ctx.tree, "Spec.Tighten", "No filler or passive phrasing found in scope.");
  }
  return {
    updatedTree: rebuildDocument(ctx.tree, texts.join("\n\n")),
    logTitle: "Spec.Tighten",
    logBody: `Tightened ${changed.length} node(s): ${changed.join(", ")}.`,
    affectedCoordinates: changed,
    mutated: true,
  };
};

export const citeVerify: CommandHandler = (ctx) => {
  const flagsById = citeVerifyFlags(ctx.tree);
  const updatedTree = applyFlags(ctx.tree, flagsById);
  const counts = countByType(flattenNodes(updatedTree).flatMap((node) => node.flags));
  const broken = counts.get("BROKEN_REF") ?? 0;
  const unverified = counts.get("UNVERIFIED_CLAIM") ?? 0;
  return {
    updatedTree,
    logTitle: "Cite.Verify",
    logBody: `Broken references: ${broken}. Unverified claims: ${unverified}.`,
    affectedCoordinates: flattenNodes(updatedTree)
      .filter((node) => node.flags.some((flag) => flag.type === "BROKEN_REF" || flag.type === "UNVERIFIED_CLAIM"))
      .map((node) => node.coordinate),
    mutated: false,
  };
};

export const outlineExtractTasks: CommandHandler = (ctx) => {
  const scope = new Set(ctx.selectedNodeIds);
  return noChange(ctx.tree, "Outline.ExtractTasks", buildTaskChecklist(ctx.tree, scope));
};

/**
 * Doc.InjectFlaw appends a conflicting latency pair and a broken reference. Appending never moves
 * existing coordinates, but a new node can take the coordinate of an existing dangling reference,
 * which removes that BROKEN_REF flag. The command counts D dangling reference occurrences and
 * injects K = floor(D/2) + 1 copies of a "under 50 ms" requirement next to one "at 200 ms"
 * requirement. Each copy gets one flag from the anchor, and the anchor gets one per copy up to the
 * per-node cap. The broken-reference flag adds 1 more, and at most D flags can be removed, so the
 * net count rises by at least K + min(K, cap) + 1 - D. K = D + 1 keeps that above zero for any D.
 */
function injectFlawMarkdown(tree: DocumentTree): { markdown: string; target: string } {
  const danglingOccurrences = flattenNodes(tree).reduce(
    (sum, node) => sum + brokenRefFlags(node.rawText, tree.indexByCoord).length,
    0,
  );
  const copies = danglingOccurrences + 1;
  for (let attempt = 0; ; attempt += 1) {
    // The target must not exist after injection. Each try has a different candidate, so this ends.
    const target = `§${99 + attempt}.99z`;
    const paragraphs = [
      ...Array.from({ length: copies }, () => "The system SHALL keep latency under 50 ms."),
      `The system SHALL keep latency at 200 ms. Retention MUST be 30 days, as noted in ${target}.`,
    ];
    const markdown = appendMarkdown(tree, paragraphs.join("\n\n"));
    const parsed = parseDocument(markdown);
    if (!Object.hasOwn(parsed.indexByCoord, target)) return { markdown, target };
  }
}

export const docInjectFlaw: CommandHandler = (ctx) => {
  const { markdown, target } = injectFlawMarkdown(ctx.tree);
  return {
    updatedTree: rebuildDocument(ctx.tree, markdown),
    logTitle: "Doc.InjectFlaw",
    logBody: `Appended a latency conflict pair and a broken reference to ${target}.`,
    affectedCoordinates: [],
    mutated: true,
  };
};

/**
 * Audited Markdown: every node preceded by its § anchor, then an Audit Summary table.
 * Pure. Shared by the System.Export log entry and the browser file download.
 */
export interface AuditedExport {
  markdown: string;
  nodeCount: number;
  flagCount: number;
}

export function buildAuditedExport(tree: DocumentTree): AuditedExport {
  const flagsById = computeAuditFlags(tree);
  const body = flattenNodes(tree)
    .map((node) => `<!-- ${node.coordinate} -->\n${node.rawText}`)
    .join("\n\n");
  const rows = flattenNodes(applyFlags(tree, flagsById)).flatMap((node) =>
    node.flags.map(
      (flag) =>
        `| ${node.coordinate} | ${flag.type} | ${flag.message.replace(/\|/g, "\\|")} |`,
    ),
  );
  const summary =
    rows.length > 0
      ? ["## Audit Summary", "", "| Coordinate | Flag | Message |", "| --- | --- | --- |", ...rows].join("\n")
      : "## Audit Summary\n\nNo flags.";
  return {
    markdown: `${body}\n\n${summary}\n`,
    nodeCount: flattenNodes(tree).length,
    flagCount: rows.length,
  };
}

export const systemExport: CommandHandler = (ctx) => {
  return noChange(ctx.tree, "System.Export", buildAuditedExport(ctx.tree).markdown);
};

const BUILTIN_ENTRIES: readonly CommandEntry[] = [
  { token: "View.Spec", mutatesTree: false, scope: "Full Doc", description: "Switch the View-Spec filter.", handler: viewSpec },
  { token: "Spec.Audit", mutatesTree: false, scope: "Full Doc", description: "Flag contradictions, broken references, unverified claims, and vague terms.", handler: specAudit },
  { token: "Spec.Tighten", mutatesTree: true, scope: "Selection or Full Doc", description: "Strip filler and rewrite passive phrasing as EARS.", handler: specTighten },
  { token: "Cite.Verify", mutatesTree: false, scope: "Full Doc", description: "Check § references and citations.", handler: citeVerify },
  { token: "Outline.ExtractTasks", mutatesTree: false, scope: "Selection or Full Doc", description: "Extract a prioritized task checklist.", handler: outlineExtractTasks },
  { token: "Doc.InjectFlaw", mutatesTree: true, scope: "Full Doc", description: "Demo helper: inject a conflict and a broken reference.", handler: docInjectFlaw },
  { token: "System.Undo", mutatesTree: true, scope: "History Stack", description: "Restore the previous snapshot.", control: "undo" },
  { token: "System.Redo", mutatesTree: true, scope: "History Stack", description: "Reapply the last undone snapshot.", control: "redo" },
  { token: "System.ClearLog", mutatesTree: false, scope: "System.Log", description: "Clear log entries, keeping the welcome block.", control: "clearLog" },
  { token: "System.Export", mutatesTree: false, scope: "Full Doc", description: "Export Markdown with § anchors and an audit summary.", handler: systemExport },
];

export const BUILTIN_REGISTRY: CommandRegistry = createRegistry(BUILTIN_ENTRIES);
