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

- [ ] Scaffold `packages/web` (Vite, React, TypeScript, Tailwind CSS).
- [ ] Build `TrackLayout.tsx`: resizable two-track split with Document Track on the left and `System.Tool` and `System.Log` on the right.
- [ ] Build `NlsDocumentPane.tsx`: `§` gutter badges, role indicators, inline flag highlights, and `a`/`h`/`f`/`u`/`r` hotkeys.
- [ ] Build `CoordinateSplitPane.tsx`: clicking a `§` reference opens the target node side by side.
- [ ] Build `SystemToolPane.tsx` (editable command pad with default recipes) and `SystemLogPane.tsx` (clickable log output).
- [ ] Build `PulseOverlay.tsx`: directional pulse from selection to command.
- [ ] **Gate:** The full user flow works offline in the browser with no menus or modals.

## Phase 5: MCP Server, Showcase Fixtures, and Optional AI Adapter (Days 12 to 13, Nov 29 to 30)

- [ ] Implement `packages/mcp-server/src/index.ts` and register it in `.kiro/settings/mcp.json`. Tools: `augeron_parse_document`, `augeron_project_viewspec`, `augeron_run_pipeline`, `augeron_verify_invariants`.
- [ ] Author three fixtures in `packages/web/src/fixtures/`: distributed edge cache RFC, AI safety literature brief, zero-downtime billing migration PRD.
- [ ] Add `optionalLlmAdapter.ts`, configured with `AI.Config(key)`, with automatic fallback to deterministic analyzers.
- [ ] **Gate:** Kiro IDE invokes the MCP tools successfully. The deployed preview URL works in an incognito browser.

## Phase 6: Polish, Demo Video, and Submission (Days 14 to 16, Dec 1 to 4)

- [ ] **Dec 1:** Typography polish, keyboard shortcut cheatsheet in `System.Tool`, clean `git clone` check in a fresh directory.
- [ ] **Dec 2:** Record the demo video under 3 minutes. Write the Kiro usage write-up. Add README screenshots.
- [ ] **Dec 3 to 4:** Final submission check: public repo, MIT badge, `/.kiro` at root, live URL, YouTube link. Submit before Dec 4, 2:00 PM PT.

## Risk Mitigations

- Demo reliability: all commands run offline and deterministically. The LLM path is optional.
- Scope creep: no retro skins, no accounts, no collaboration (see requirements Scope).
