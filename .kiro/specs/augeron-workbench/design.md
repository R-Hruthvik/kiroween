# Design: Augeron Workbench

Source: BUILD_PLAN.md Sections 1 to 3 and SPEC.md Section 4 (data models).

## Architecture

Three TypeScript npm workspaces. Dependencies point inward toward `packages/core`.

```text
augeron/
├── packages/core          Pure domain and command engine. 0 DOM, React, window, document, or node:fs imports.
├── packages/web           React + Vite + Tailwind. Handles DOM events, hotkeys, localStorage, pulse animation.
└── packages/mcp-server    Stdio MCP server (@modelcontextprotocol/sdk). Imports core.
```

- `core` takes plain objects and returns plain objects. It has no side effects.
- `web` owns all DOM interaction and persistence. It calls `core` for every decision about document content.
- `mcp-server` exposes the same core functions to Kiro IDE.

## Core Modules (`packages/core/src`)

| Module | Responsibility |
| --- | --- |
| `types.ts` | Canonical interfaces from SPEC.md Section 4. |
| `ast/parser.ts` | Markdown to `DocumentTree`. Assigns `§` coordinates and `indexByCoord`. Also exports `rebuildDocument` (edited markdown to tree, keeping the id and bumping the version) and `appendMarkdown`. |
| `ast/classifier.ts` | Assigns `SemanticRole`, extracts citations, computes first sentence and hidden word count, and produces `BROKEN_REF` and `UNVERIFIED_CLAIM` flags. |
| `ast/coordinate.ts` | `§` grammar: reference and citation patterns, the coordinate validity pattern, and `letterSuffix` (bijective base-26). |
| `ast/flatten.ts` | Pre-order (document order) traversal and `serializeTree`. Used by every command that needs the node list. |
| `viewspec/projector.ts` | Pure `a`, `h`, `f`, `u`, `r` projections. Returns `ProjectedNode` trees. Non-matching nodes are dropped and their visible descendants move up to the nearest shown ancestor. |
| `oberon/tokenizer.ts` | `parseCommand` and `formatCommand` (inverse pair), `scanCommandTokens` for free text, and `splitPipeline` for `->`. |
| `oberon/registry.ts` | `createRegistry` (rejects duplicate tokens), `WorkbenchState`, and `runLine`. `runLine` validates every stage before running any, runs stages left to right, halts on the first error, and writes one combined log entry. It also handles the history and log controls (`System.Undo`, `System.Redo`, `System.ClearLog`), which need state that a handler cannot see. |
| `oberon/commands.ts` | Handlers for `View.Spec`, `Spec.Audit`, `Spec.Tighten`, `Cite.Verify`, `Outline.ExtractTasks`, `Doc.InjectFlaw`, and `System.Export`, plus `BUILTIN_REGISTRY`. |
| `analyzers/contradiction.ts` | Extracts `(subject, comparator, value, unit)` metrics from `Requirement` and `Claim` nodes. Flags pairs with no overlapping value range. |
| `analyzers/audit.ts` | `computeAuditFlags` (full recomputation: broken refs, unverified claims, vague terms, contradictions), `citeVerifyFlags` (reference and claim flags only), `applyFlags` (returns a new tree), and `flagCount`. |
| `analyzers/tightener.ts` | Deterministic filler removal and EARS rewrites. Numbers and § references are never changed. Returns the input unchanged when no rule applies. |
| `analyzers/extractor.ts` | Builds the prioritized task checklist (P0 contradictions and broken references, P1 requirements, P2 other flagged nodes). |
| `history/stack.ts` | Immutable history. `commit` adds a snapshot, `replacePresent` swaps the state without a snapshot (flag-only updates), and `undo` and `redo` return the same object when nothing applies. |


## Coordinate Rules

- Headings are numbered per parent. A heading's coordinate is its parent heading's coordinate, a dot, and its position among that parent's heading children (counted from 1). Top-level headings are `§1`, `§2`, and so on. Skipped heading levels leave no gap: `#` then `###` gives `§1.1`. The full rule is in `.kiro/steering/oberon-nls-grammar.md` section 1.2.
- Body paragraphs take the parent heading's coordinate plus a letter suffix: `§1.2a`, `§1.2b`. Body text before the first heading uses `§0a`, `§0b`.
- Letters use bijective base-26 with index 0 mapping to `a`: `a` to `z`, then `aa`, `ab`, and so on (`ast/coordinate.ts`).
- Each node stores an immutable `id`. The coordinate is derived at parse time. Ids are assigned in document order (`n1`, `n2`, ...), so an edit that changes the structure re-assigns them.
- Mutating commands rebuild the tree from markdown with `rebuildDocument`, which keeps the document id and bumps the version.

## Data Models

The interfaces are defined verbatim in SPEC.md Section 4 and copied to `packages/core/src/types.ts`. `CommandHandler` is `(ctx, arg?) => Promise<CommandOutcome> | CommandOutcome`.

## Command Tokenizer

- Token regex (scan): `/\b([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*)(?:\(([^)]*)\))?/g`
- Whole-token validation (SPEC.md Section 2.3): `/^[A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*(\([^)]*\))?$/`
- Pipelines split on `->`. `runLine` validates every stage against the registry before any stage runs.
- Stages run left to right. A stage error halts the pipeline and logs the error.
- `Doc.InjectFlaw` guarantees INV-5 on every input. It appends K = floor(D/2) + 1 copies of an "under 50 ms" requirement and one "at 200 ms" requirement, where D is the number of dangling reference occurrences in the input. The reference target is chosen at run time so that it does not exist after injection.

## Interaction Model (web)

- Middle-click (`e.button === 1`) and Ctrl/Cmd-click run a command. `mousedown` calls `preventDefault` to suppress browser auto-scroll.
- `lastSelectedNodeIds` and `lastSelectedText` are kept in state, so running a command from `System.Tool` keeps the Document Track selection.
- `PulseOverlay` measures `[data-coord="§2.1a"]` and `[data-cmd-id="..."]` and draws a 350 ms SVG pulse between them.

## Persistence and Offline Behavior

- State is saved to `localStorage`. Export is a file download.
- Core analyzers are the default path. `optionalLlmAdapter.ts` is used only when a key is configured and is always bypassed on error or offline mode.

## Testing Strategy

- Unit tests with vitest: parser, commands.
- Property tests with fast-check: INV-1 to INV-5 in `packages/core/tests/invariants.prop.test.ts`. Gate: 100% pass on 500+ generated trees.
- Kiro hook `verify-invariants` runs `npm --workspace=packages/core run test:pbt` on each save in `packages/core/src`.

## Phase 1 Scaffold

- Root `package.json` with workspaces and `test` and `test:pbt` scripts.
- `tsconfig.base.json` with strict mode. The `lib` setting is `ES2022` only, so DOM types are unavailable to core.
- `packages/core` with TypeScript, vitest, and fast-check.
