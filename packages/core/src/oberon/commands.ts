import type {
  AddressExcerpt,
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
import { DEFAULT_BRIEF_SENTENCES, buildBrief, parseSentenceCount, renderBrief } from "../analyzers/brief.js";
import { buildLedger, renderLedger } from "../analyzers/ledger.js";
import { createRegistry, type CommandEntry, type CommandRegistry } from "./registry.js";
import { COORDINATE_PATTERN } from "../ast/coordinate.js";
import { reviewFingerprint } from "../review/marks.js";
import { findLiteral, linksTo } from "../analyzers/lookup.js";
import { BROWSER_TOKENS, checkToolText, renderToolCheck } from "./toolCheck.js";

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
  // View.Spec(a) is the full view, so it also clears any View.Level clip. Other codes keep it.
  const level = code === "a" ? undefined : ctx.activeLevel;
  const total = flattenNodes(ctx.tree).length;
  const visible = countProjected(projectTree(ctx.tree, code, level));
  return {
    ...noChange(ctx.tree, title, `Visible nodes: ${visible}. Hidden nodes: ${total - visible}.`),
    nextViewSpec: code,
    nextLevel: code === "a" ? null : undefined,
    // A View-Spec replaces the brief, as it does for the level clip.
    nextBrief: null,
  };
};

/** Accepts only digits that form a safe integer of at least 1. Rejects "", "0", "1.5", "-1", and "x". */
function parseLevel(raw: string): number | null {
  if (!/^[0-9]+$/.test(raw)) return null;
  const level = Number(raw);
  return Number.isSafeInteger(level) && level >= 1 ? level : null;
}

/**
 * View.Level(n) clips the projection to heading depth n, as NLS level clipping does. A heading
 * deeper than n is hidden with its whole subtree, and body text follows the heading that owns it.
 * It layers on the active view code, so View.Level(1) -> View.Spec(u) shows unverified claims
 * under level-1 headings only. View.Spec(a) clears the clip. Pure: it never changes the tree.
 */
export const viewLevel: CommandHandler = (ctx, arg) => {
  const raw = arg ?? "";
  const title = `View.Level(${raw})`;
  const level = parseLevel(raw);
  if (level === null) {
    return failure(
      ctx.tree,
      title,
      `View.Level expects a positive integer depth, for example View.Level(1). Got "${raw}".`,
    );
  }
  const total = flattenNodes(ctx.tree).length;
  const visible = countProjected(projectTree(ctx.tree, ctx.activeViewSpec, level));
  return {
    ...noChange(
      ctx.tree,
      title,
      `Showing headings and body text down to level ${level}. Visible nodes: ${visible}. Hidden nodes: ${total - visible}.`,
    ),
    nextLevel: level,
    // View.Level is a clip over the views, so it takes the screen back from the brief.
    nextBrief: null,
  };
};

/**
 * Parses the optional sentence count of View.Brief(n) and Spec.Ledger(n). No argument means the
 * default of 2. An empty or invalid argument is an error, so "View.Brief()" never runs with a guess.
 */
function briefCount(command: string, arg: string | undefined): { count: number } | { error: string } {
  if (arg === undefined) return { count: DEFAULT_BRIEF_SENTENCES };
  const count = parseSentenceCount(arg);
  if (count === null) {
    return { error: `${command} expects a positive integer sentence count, for example ${command}(2). Got "${arg}".` };
  }
  return { count };
}

/**
 * View.Brief(n) shows an excerpt: up to n whole sentences per section, chosen by RFC 2119 keywords,
 * then numbers and definitions, then words shared with the heading. Each sentence shows its §
 * address. It is a projection over the tree, so the text and the coordinates never change.
 */
export const viewBrief: CommandHandler = (ctx, arg) => {
  const title = arg === undefined ? "View.Brief" : `View.Brief(${arg})`;
  const parsed = briefCount("View.Brief", arg);
  if ("error" in parsed) return failure(ctx.tree, title, parsed.error);
  const brief = buildBrief(ctx.tree, parsed.count);
  const kept = brief.sections.flatMap((section) => section.sentences.map((sentence) => sentence.coordinate));
  return {
    ...noChange(ctx.tree, title, renderBrief(brief)),
    affectedCoordinates: [...new Set(kept)],
    nextBrief: parsed.count,
  };
};

/**
 * Spec.Ledger lists every sentence with an RFC 2119 keyword. The optional argument is the brief
 * sentence count that the coverage check uses. It defaults to 2, the same as View.Brief.
 */
export const specLedger: CommandHandler = (ctx, arg) => {
  const title = arg === undefined ? "Spec.Ledger" : `Spec.Ledger(${arg})`;
  const parsed = briefCount("Spec.Ledger", arg);
  if ("error" in parsed) return failure(ctx.tree, title, parsed.error);
  return noChange(ctx.tree, title, renderLedger(buildLedger(ctx.tree, parsed.count)));
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

/**
 * Review.Mark(§x) and Review.Clear(§x) change only the review marks, never the text. The mark stores the
 * paragraph's fingerprint, so it stops counting when that paragraph changes.
 */
function reviewCommand(token: "Review.Mark" | "Review.Clear", mark: boolean): CommandHandler {
  return (ctx, arg) => {
    const coord = arg ?? "";
    const title = `${token}(${coord})`;
    if (!COORDINATE_PATTERN.test(coord)) {
      return failure(ctx.tree, title, `${token} expects a § address such as §1.2a. Got "${coord}".`);
    }
    const node = flattenNodes(ctx.tree).find((candidate) => candidate.coordinate === coord);
    if (node === undefined) return failure(ctx.tree, title, `No paragraph or heading at ${coord}.`);
    const reviews: Record<string, string> = { ...ctx.reviews };
    if (mark) {
      reviews[coord] = reviewFingerprint(node.rawText);
      return {
        ...noChange(ctx.tree, title, `Marked ${coord} reviewed. The document text is unchanged.`),
        nextReviews: reviews,
      };
    }
    const had = Object.hasOwn(reviews, coord);
    delete reviews[coord];
    return {
      ...noChange(
        ctx.tree,
        title,
        had ? `Cleared the review mark on ${coord}. The document text is unchanged.` : `${coord} had no review mark.`,
      ),
      nextReviews: reviews,
    };
  };
}

const reviewMark = reviewCommand("Review.Mark", true);
const reviewClear = reviewCommand("Review.Clear", false);

/** One line per hit: the § address, then the excerpt. Used by Find.Look and Link.Back. */
function formatHits(hits: readonly AddressExcerpt[]): string {
  return hits.map((hit) => `- ${hit.coordinate}  ${hit.excerpt}`).join("\n");
}

/** Find.Look(text): a literal, case-insensitive search. Empty text is an error, so it never matches everything. */
export const findLook: CommandHandler = (ctx, arg) => {
  const title = arg === undefined ? "Find.Look" : `Find.Look(${arg})`;
  const needle = (arg ?? "").trim();
  if (needle === "") {
    return failure(ctx.tree, title, "Find.Look expects the text to search for, for example Find.Look(retention).");
  }
  const hits = findLiteral(ctx.tree, needle);
  const body =
    hits.length === 0
      ? `No paragraph or heading contains "${needle}".`
      : `${hits.length} ${hits.length === 1 ? "match" : "matches"} for "${needle}".\n${formatHits(hits)}`;
  return { ...noChange(ctx.tree, title, body), affectedCoordinates: hits.map((hit) => hit.coordinate) };
};

/** Link.Back(§x): every paragraph or heading whose text refers to §x. An address that does not exist is an error. */
export const linkBack: CommandHandler = (ctx, arg) => {
  const coordinate = arg ?? "";
  const title = `Link.Back(${coordinate})`;
  if (!COORDINATE_PATTERN.test(coordinate)) {
    return failure(ctx.tree, title, `Link.Back expects a § address such as §1.2a. Got "${coordinate}".`);
  }
  if (!Object.hasOwn(ctx.tree.indexByCoord, coordinate)) {
    return failure(ctx.tree, title, `No paragraph or heading at ${coordinate}.`);
  }
  const hits = linksTo(ctx.tree, coordinate);
  const body =
    hits.length === 0
      ? `No paragraph refers to ${coordinate}.`
      : `${hits.length} ${hits.length === 1 ? "paragraph refers" : "paragraphs refer"} to ${coordinate}.\n${formatHits(hits)}`;
  return { ...noChange(ctx.tree, title, body), affectedCoordinates: hits.map((hit) => hit.coordinate) };
};

/** The full list for Help.Show with no argument, grouped by module in catalog order. */
function helpList(): string {
  const modules: string[] = [];
  for (const entry of BUILTIN_ENTRIES) {
    const module = entry.token.split(".")[0] ?? "";
    if (!modules.includes(module)) modules.push(module);
  }
  const lines = ["Core commands, grouped by module. Help.Show(Module.Action) describes one."];
  for (const module of modules) {
    lines.push("", module);
    for (const entry of BUILTIN_ENTRIES.filter((candidate) => candidate.token.startsWith(`${module}.`))) {
      lines.push(`  ${entry.token}  ${entry.description} Mutates tree: ${entry.mutatesTree ? "yes" : "no"}.`);
    }
  }
  lines.push("", `Browser only, not in this list: ${BROWSER_TOKENS.map((entry) => entry.token).join(", ")}.`);
  return lines.join("\n");
}

/** The description of one command, for Help.Show(Module.Action). */
function helpEntry(entry: CommandEntry): string {
  return [
    entry.token,
    entry.description,
    `Argument: ${entry.argument ?? "none"}.`,
    `Mutates tree: ${entry.mutatesTree ? "yes" : "no"}.`,
    `Scope: ${entry.scope}.`,
    `Example: ${entry.example ?? entry.token}`,
  ].join("\n");
}

/** Help.Show(Module.Action) or Help.Show for the full list. Takes the bare token, such as "View.Spec". */
export const helpShow: CommandHandler = (ctx, arg) => {
  const title = arg === undefined ? "Help.Show" : `Help.Show(${arg})`;
  if (arg === undefined) return noChange(ctx.tree, title, helpList());
  const name = arg.trim();
  if (name === "") {
    return failure(ctx.tree, title, "Help.Show expects Module.Action, for example Help.Show(View.Spec). With no argument it lists every command.");
  }
  const entry = BUILTIN_ENTRIES.find((candidate) => candidate.token === name);
  if (entry === undefined) {
    return failure(ctx.tree, title, `No core command named ${name}. Help.Show with no argument lists them all.`);
  }
  return noChange(ctx.tree, title, helpEntry(entry));
};

/** Tool.Check: checks the System.Tool pad. Only the browser knows the pad, so the MCP server does not run it. */
export const toolCheck: CommandHandler = (ctx) => {
  const title = "Tool.Check";
  if (ctx.padText === undefined) {
    return failure(ctx.tree, title, "Tool.Check reads the System.Tool pad, so it runs in the browser.");
  }
  return noChange(ctx.tree, title, renderToolCheck(checkToolText(ctx.padText, BUILTIN_REGISTRY)));
};

const BUILTIN_ENTRIES: readonly CommandEntry[] = [
  { token: "View.Spec", mutatesTree: false, scope: "Full Doc", argument: "one of a, h, f, u, r", example: "View.Spec(u)", description: "Switch the View-Spec filter. View.Spec(a) also clears the View.Level clip. Any View.Spec turns off View.Brief.", handler: viewSpec },
  { token: "View.Level", mutatesTree: false, scope: "Full Doc", argument: "a positive heading depth n", example: "View.Level(1)", description: "Clip the view to heading depth n, as NLS level clipping does. Combines with the active view code. Turns off View.Brief.", handler: viewLevel },
  { token: "View.Brief", mutatesTree: false, scope: "Full Doc", argument: "sentences per section n, default 2", example: "View.Brief(2)", description: "Excerpt view. Keeps up to n whole sentences per section (default 2), picked by RFC 2119 keyword, then numbers and definitions, then heading words. Each sentence shows its § address. Never changes the text.", handler: viewBrief },
  { token: "Spec.Ledger", mutatesTree: false, scope: "Full Doc", argument: "sentences per section n, default 2", example: "Spec.Ledger(2)", description: "Lists every sentence with an RFC 2119 keyword: address, modal, condition, and whether View.Brief(n) keeps it. Never changes the text.", handler: specLedger },
  { token: "Review.Mark", mutatesTree: false, scope: "Coordinate", argument: "a § address", example: "Review.Mark(§4.3a)", description: "Mark one § paragraph reviewed. The mark is kept outside the text and stops counting when that paragraph changes.", handler: reviewMark, needsWorkbench: true },
  { token: "Review.Clear", mutatesTree: false, scope: "Coordinate", argument: "a § address", example: "Review.Clear(§4.3a)", description: "Remove the review mark from one § paragraph. The text is unchanged.", handler: reviewClear, needsWorkbench: true },
  { token: "Spec.Audit", mutatesTree: false, scope: "Full Doc", description: "Flag contradictions, broken references, unverified claims, and vague terms.", handler: specAudit },
  { token: "Spec.Tighten", mutatesTree: true, scope: "Selection or Full Doc", description: "Strip filler phrases such as \"it is important to note that\", \"basically\", and \"very\", and rewrite \"in order to\" as \"to\". Modal verbs are never changed.", handler: specTighten },
  { token: "Cite.Verify", mutatesTree: false, scope: "Full Doc", description: "Check § references and citations.", handler: citeVerify },
  { token: "Outline.ExtractTasks", mutatesTree: false, scope: "Selection or Full Doc", description: "Extract a prioritized task checklist.", handler: outlineExtractTasks },
  { token: "Doc.InjectFlaw", mutatesTree: true, scope: "Full Doc", description: "Demo helper: inject a conflict and a broken reference.", handler: docInjectFlaw },
  { token: "System.Undo", mutatesTree: true, scope: "History Stack", description: "Restore the previous snapshot.", control: "undo" },
  { token: "System.Redo", mutatesTree: true, scope: "History Stack", description: "Reapply the last undone snapshot.", control: "redo" },
  { token: "System.ClearLog", mutatesTree: false, scope: "System.Log", description: "Clear log entries, keeping the welcome block.", control: "clearLog" },
  { token: "System.Export", mutatesTree: false, scope: "Full Doc", description: "Export Markdown with § anchors and an audit summary.", handler: systemExport },
  { token: "Find.Look", mutatesTree: false, scope: "Full Doc", argument: "the text to find, matched ignoring case", example: "Find.Look(retention)", description: "Acme-style Look. Lists every paragraph and heading that contains the text, with its § address and an excerpt. Never changes the text.", handler: findLook },
  { token: "Link.Back", mutatesTree: false, scope: "Full Doc", argument: "a § address", example: "Link.Back(§4.3a)", description: "Lists every paragraph and heading that refers to the § address, with an excerpt. Never changes the text.", handler: linkBack },
  { token: "Help.Show", mutatesTree: false, scope: "Command Catalog", argument: "a Module.Action token, or none for the full list", example: "Help.Show(Find.Look)", description: "Describes one command: what it does, its argument, whether it changes the tree, and an example. With no argument, lists every command by module.", handler: helpShow },
  { token: "Tool.Check", mutatesTree: false, scope: "System.Tool pad", description: "Checks every line of the System.Tool pad. Each token and -> pipeline must parse and name a known command. Reports what each line reads and whether it changes the tree. Never runs the pad.", handler: toolCheck, needsWorkbench: true },
  { token: "System.History", mutatesTree: false, scope: "System.Log", description: "Lists the core commands that ran this session, one per line. In the browser it also appends them to System.Tool as a block you can click to run again. Never changes the text.", control: "history", needsWorkbench: true },
];

export const BUILTIN_REGISTRY: CommandRegistry = createRegistry(BUILTIN_ENTRIES);
