import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  parseDocument,
  flattenNodes,
  projectTree,
  flattenProjected,
  parseCommand,
  formatCommand,
  scanCommandTokens,
  runLine,
  createWorkbenchState,
  BUILTIN_REGISTRY,
  flagCount,
  COORDINATE_PATTERN,
  buildBrief,
  buildLedger,
  type WorkbenchState,
} from "../src/index.js";
import type { ParsedCommand, ViewSpecCode } from "../src/types.js";

const RUNS = 600;

// --- Generators -----------------------------------------------------------

const WORD = fc.stringMatching(/^[A-Za-z]{3,10}$/);

const headingArb = fc
  .tuple(fc.integer({ min: 1, max: 3 }), WORD)
  .map(([level, word]) => `${"#".repeat(level)} ${word}`);

const SENTENCES = [
  "The system SHALL respond within 50 ms.",
  "Latency is 200 ms for every read.",
  "p99 latency is 30 ms [1].",
  "Retention MUST be 30 days.",
  "We assume the cache is warm.",
  "Our approach is fast and scalable.",
  "It is worth noting that the budget is $10,000 according to https://example.com/report.",
  "See §1a for details.",
  "Refer to §9.9z for the broken case.",
  "The team discussed the design.",
  "Results reduce errors by 40%.",
  "Basically we should try to keep things simple.",
  "The budget stays under $10,000.",
  "The uptime SHALL be at least 99 %.",
  "The system should try to answer quickly.",
  "Timeout is 2 seconds.",
];

const bodyArb = fc
  .array(fc.constantFrom(...SENTENCES), { minLength: 1, maxLength: 3 })
  .map((sentences) => sentences.join(" "));

const markdownArb = fc
  .array(
    fc.tuple(fc.oneof(headingArb, bodyArb), fc.constantFrom("\n", "\n\n")),
    { maxLength: 20 },
  )
  .map((pairs) => pairs.map(([block, sep]) => block + sep).join(""));

const viewCodeArb = fc.constantFrom<ViewSpecCode>("a", "h", "f", "u", "r");

const argArb = fc.string({ maxLength: 20 }).filter((s) => !s.includes(")"));

const commandArb: fc.Arbitrary<ParsedCommand> = fc
  .record({
    module: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{0,8}$/),
    action: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{0,8}$/),
    arg: fc.option(argArb, { nil: undefined }),
  })
  .map(({ module, action, arg }) => {
    const raw = formatCommand({ module, action, arg });
    return arg === undefined ? { raw, module, action } : { raw, module, action, arg };
  });

// --- Helpers --------------------------------------------------------------

const countFlags = (state: WorkbenchState): number => flagCount(state.history.present);

// --- Invariants -----------------------------------------------------------

describe("INV-1 View-Spec non-destructiveness", () => {
  it("projections never mutate the tree, drop nodes, or alter rawText", () => {
    fc.assert(
      fc.property(markdownArb, fc.array(viewCodeArb, { maxLength: 8 }), (md, codes) => {
        const tree = parseDocument(md);
        const snapshot = JSON.parse(JSON.stringify(tree)) as typeof tree;
        for (const code of codes) projectTree(tree, code);
        expect(tree).toEqual(snapshot);

        const all = flattenProjected(projectTree(tree, "a"));
        expect(all.map((item) => item.node.id)).toEqual(flattenNodes(tree).map((n) => n.id));
        expect(all.map((item) => item.displayText)).toEqual(
          flattenNodes(tree).map((n) => n.rawText),
        );
      }),
      { numRuns: RUNS },
    );
  });
});

describe("INV-2 coordinate bijection", () => {
  it("every node has a unique § coordinate that resolves to its id, and the index size matches", () => {
    fc.assert(
      fc.property(markdownArb, (md) => {
        const tree = parseDocument(md);
        const flat = flattenNodes(tree);
        expect(new Set(flat.map((n) => n.coordinate)).size).toBe(flat.length);
        expect(Object.keys(tree.indexByCoord)).toHaveLength(flat.length);
        for (const node of flat) {
          expect(COORDINATE_PATTERN.test(node.coordinate)).toBe(true);
          expect(tree.indexByCoord[node.coordinate]).toBe(node.id);
        }
      }),
      { numRuns: RUNS },
    );
  });
});

describe("INV-3 undo/redo exact inverse", () => {
  it("undoing any mutating command restores the pre-command tree, and redo restores the result", async () => {
    await fc.assert(
      fc.asyncProperty(
        markdownArb,
        fc.constantFrom("Spec.Tighten", "Doc.InjectFlaw"),
        async (md, command) => {
          const tree = parseDocument(md);
          const before = createWorkbenchState(tree);
          const after = await runLine(before, command, BUILTIN_REGISTRY);
          const restored = await runLine(after, "System.Undo", BUILTIN_REGISTRY);
          expect(restored.history.present).toEqual(tree);

          const redone = await runLine(restored, "System.Redo", BUILTIN_REGISTRY);
          expect(redone.history.present).toEqual(after.history.present);
        },
      ),
      { numRuns: RUNS },
    );
  });
});

describe("INV-4 command tokenizer round-trip", () => {
  it("parseCommand(formatCommand(c)) equals c, and scanning the formatted token finds it", () => {
    fc.assert(
      fc.property(commandArb, (command) => {
        const text = formatCommand(command);
        expect(parseCommand(text)).toStrictEqual(command);
        expect(formatCommand(parseCommand(text) as ParsedCommand)).toBe(text);
        expect(scanCommandTokens(text)[0]?.raw).toBe(text);
      }),
      { numRuns: RUNS },
    );
  });
});

describe("INV-5 audit monotonicity under flaw injection", () => {
  it("Spec.Audit(Doc.InjectFlaw(T)) has strictly more flags than Spec.Audit(T), for every document", async () => {
    await fc.assert(
      fc.asyncProperty(markdownArb, async (md) => {
        const tree = parseDocument(md);
        const base = await runLine(createWorkbenchState(tree), "Spec.Audit", BUILTIN_REGISTRY);
        const injected = await runLine(
          createWorkbenchState(tree),
          "Doc.InjectFlaw -> Spec.Audit",
          BUILTIN_REGISTRY,
        );
        expect(countFlags(injected)).toBeGreaterThan(countFlags(base));
      }),
      { numRuns: RUNS },
    );
  });
});

describe("INV-1 extension: View.Brief and Spec.Ledger never change the tree", () => {
  it("brief and ledger leave rawText, the node ids, and indexByCoord unchanged", async () => {
    await fc.assert(
      fc.asyncProperty(markdownArb, fc.integer({ min: 1, max: 4 }), async (md, n) => {
        const tree = parseDocument(md);
        const snapshot = JSON.parse(JSON.stringify(tree)) as typeof tree;
        const brief = await runLine(createWorkbenchState(tree), `View.Brief(${n})`, BUILTIN_REGISTRY);
        const ledger = await runLine(brief, "Spec.Ledger", BUILTIN_REGISTRY);
        expect(ledger.history.present).toEqual(snapshot);
        expect(flattenNodes(ledger.history.present).map((node) => node.rawText)).toEqual(
          flattenNodes(tree).map((node) => node.rawText),
        );
        expect(ledger.history.present.indexByCoord).toEqual(tree.indexByCoord);
        expect(ledger.history.past).toHaveLength(0);
      }),
      { numRuns: RUNS },
    );
  });
});

describe("Brief and ledger coverage", () => {
  it("every ledger row is in the brief or listed as omitted, and every brief keyword sentence has a row", () => {
    fc.assert(
      fc.property(markdownArb, fc.integer({ min: 1, max: 4 }), (md, n) => {
        const tree = parseDocument(md);
        const report = buildLedger(tree, n);
        expect(report.inBrief + report.omitted).toBe(report.rows.length);
        expect(report.unaccounted).toBe(0);
        expect(report.guardFailures).toEqual([]);
        expect(buildBrief(tree, n).guardFailures).toEqual([]);
      }),
      { numRuns: RUNS },
    );
  });
});
