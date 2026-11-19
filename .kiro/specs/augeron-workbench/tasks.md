# Tasks: Augeron Workbench

Source: BUILD_PLAN.md Section 4. Timeline: November 18 to December 4, 2026. Code freeze and video upload on December 3.

## Phase 1: Foundation and Kiro Infrastructure (Days 1 to 2, Nov 18 to 19)

- [x] Root `package.json` with npm workspaces (`packages/core`, `packages/web`, `packages/mcp-server`) and MIT `LICENSE`.
- [x] Steering files in `.kiro/steering/`: `product.md`, `architecture.md`, `oberon-nls-grammar.md`.
- [x] Spec files in `.kiro/specs/augeron-workbench/`: `requirements.md`, `design.md`, `tasks.md`.
- [x] Configure vitest and fast-check in `packages/core`. Commit `.kiro/hooks/verify-invariants.json`.
- [ ] **Gate:** `npm test` passes from the repo root. Saving a file in `packages/core/src/` triggers the Kiro hook. (Not yet verified: the hook has not been observed firing on save.)

## Phase 2: NLS AST and View-Spec Engine (Days 3 to 5, Nov 20 to 22)

- [x] Implement `ast/parser.ts`: Markdown to `DocumentTree` with `§` coordinates and `indexByCoord`.
- [x] Implement `ast/classifier.ts`: `SemanticRole` tagging, citation extraction, `BROKEN_REF` detection.
- [x] Implement `viewspec/projector.ts`: `a`, `h`, `f`, `u`, `r` projections.
- [x] Write property tests for INV-1 and INV-2. Unit tests were not requested and are not written.
- [x] **Gate:** 100% pass rate on 500+ generated random document trees in fast-check.

## Phase 3: Oberon Command Engine and Analyzers (Days 6 to 8, Nov 23 to 25)

- [x] Implement `oberon/tokenizer.ts` (`Module.Action(arg)` and `->` pipelines) with INV-4 round-trip property test.
- [x] Implement `analyzers/contradiction.ts`, `analyzers/tightener.ts`, `analyzers/extractor.ts`.
- [x] Implement `oberon/commands.ts`: `View.Spec`, `Spec.Audit`, `Spec.Tighten`, `Cite.Verify`, `Outline.ExtractTasks`, `Doc.InjectFlaw`, `System.Undo`, `System.Redo`, `System.Export`.
- [x] Implement `history/stack.ts` with INV-3 (undo/redo exact inverse) and INV-5 (audit monotonicity) property tests.
- [ ] **Gate:** A CLI or test script runs a multi-step pipeline on sample specs with zero DOM dependencies. (Not yet met as a kept script: the pipeline was checked with a temporary test that was then deleted.)

## Phase 4: Zero-Menu Tiled Web Workbench (Days 9 to 11, Nov 26 to 28)

- [x] Scaffold `packages/web` (Vite, React, TypeScript, Tailwind CSS).
- [x] Build `TrackLayout.tsx`: resizable two-track split with Document Track on the left and `System.Tool` and `System.Log` on the right.
- [x] Build `NlsDocumentPane.tsx`: `§` gutter badges, role indicators, inline flag highlights, and `a`/`h`/`f`/`u`/`r` hotkeys.
- [x] Build `CoordinateSplitPane.tsx`: clicking a `§` reference opens the target node side by side.
- [x] Build `SystemToolPane.tsx` (editable command pad with default recipes) and `SystemLogPane.tsx` (clickable log output).
- [x] Build `PulseOverlay.tsx`: directional pulse from selection to command.
- [x] **Gate:** The full user flow works offline in the browser with no menus or modals. (Checked with 17 headless-Chrome interaction checks against the production build; that script lives outside the repo. Fonts load from Google, so fonts fall back offline.)

## Phase 5: MCP Server, Showcase Fixtures, and Optional AI Adapter (Days 12 to 13, Nov 29 to 30)

- [x] Implement `packages/mcp-server/src/index.ts` with a stdio MCP server. Tools: `augeron_parse_document`, `augeron_project_viewspec`, `augeron_run_pipeline`, `augeron_verify_audit`. The tool name is `augeron_verify_audit` (not `augeron_verify_invariants`, which was in the earlier draft). It returns coordinate bijection plus every CONTRADICTION and BROKEN_REF flag. Checked with an SDK stdio client.
- [ ] Register the server in `.kiro/settings/mcp.json`. **Blocked:** a permission rule (`kiro-scope`) denied the write. Retry once the user lifts the rule or confirms the file.
- [x] Author three fixtures in `packages/web/src/fixtures/`: distributed edge cache RFC, AI safety literature brief (`research-synthesis.ts`), zero-downtime billing migration PRD (`product-spec-checkout.ts`). Switch with `Doc.Load(rfc|brief|prd)` in System.Tool. Each load is one history snapshot, so `System.Undo` restores the previous document.
- [x] Add `optionalLlmAdapter.ts`, configured with `AI.Config(key)`. It adds an advisory AI.Review after Spec.Audit. On a missing key, offline, or any failure it falls back to the deterministic output, and the key stays in memory only.
- [ ] **Gate:** Kiro IDE invokes the MCP tools successfully. The deployed preview URL works in an incognito browser. (Not yet verified inside Kiro. Blocked on the MCP config above.)

## Phase 6: Polish, Demo Video, and Submission (Days 14 to 16, Dec 1 to 4)

- [x] `System.Export` downloads `augeron-audited-spec.md` (anchors and Audit Summary table) and logs a confirmation. Checked in headless Chrome.
- [x] README: overview, quickstart, View-Spec hotkeys, Oberon command catalog, and "Built with Kiro" section.
- [x] **Dec 1:** Clean `git clone` check in a fresh directory: install, build, `npm test`, and `test:pbt` all exit 0.
- [ ] **Dec 1:** Typography polish and keyboard shortcut cheatsheet in `System.Tool`.
- [ ] **Dec 2:** Record the demo video under 3 minutes. Write the Kiro usage write-up. Add README screenshots.
- [ ] **Dec 3 to 4:** Final submission check: public repo, MIT badge, `/.kiro` at root, live URL, YouTube link. Submit before Dec 4, 2:00 PM PT.

## Risk Mitigations

- Demo reliability: all commands run offline and deterministically. The LLM path is optional.
- Scope creep: no retro skins, no accounts, no collaboration (see requirements Scope).
