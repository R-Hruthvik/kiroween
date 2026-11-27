# Tasks: Augeron Workbench

Source: the phase plan below. The original BUILD_PLAN.md is not in the repository or its history. The plan's timeline ran November 18 to December 4, 2026, with code freeze and video upload on December 3. The commits ran from November 18 to 27, 2026, by git commit date (`git log --format='%h %ad %s' --date=short`).

## Status at a glance

| Item | State | Evidence |
| --- | --- | --- |
| Working kiro-cli MCP server | Done | `.kiro/settings/mcp.json` committed in `a3d96cd` (2026-11-19). kiro-cli 3.5.0 lists the server, and a live `augeron_verify_audit` call returned correct JSON (`docs/audit/02-skeptic.md`, row 11). The Kiro IDE is not verified. |
| `verify-invariants` hook | Fired | 21 completed `verify-core-invariants` runs in the main Kiro session transcript, from 2026-11-18T17:40Z to 2026-11-19T08:22Z. The transcript is in `~/.kiro/sessions/`, outside the repo. Other local sessions have more runs, and they are not deduplicated. The runs came from agent edits. Manual saves in the IDE are not recorded. |
| Deployed URL | Not done | No deployment exists yet. |
| Demo video | Not done | Not recorded. |
| Kiro usage write-up | Not done | Not written. |

## Phase 1: Foundation and Kiro Infrastructure (Nov 18 to 19)

- [x] Root `package.json` with npm workspaces (`packages/core`, `packages/web`, `packages/mcp-server`) and MIT `LICENSE`.
- [x] Steering files in `.kiro/steering/`: `product.md`, `architecture.md`, `oberon-nls-grammar.md`.
- [x] Spec files in `.kiro/specs/augeron-workbench/`: `requirements.md`, `design.md`, `tasks.md`, `ui-design.md`.
- [x] Configure vitest and fast-check in `packages/core`. Commit `.kiro/hooks/verify-invariants.json`.
- [x] **Gate:** `npm test` passes from the repo root, and the Kiro hook fires. The hook ran 21 times in the recorded session. Manual IDE saves are not recorded, so that path is unverified.

## Phase 2: NLS AST and View-Spec Engine (Nov 19 to 20)

- [x] Implement `ast/parser.ts`: Markdown to `DocumentTree` with `§` coordinates and `indexByCoord`.
- [x] Implement `ast/classifier.ts`: `SemanticRole` tagging, citation extraction, `BROKEN_REF` detection.
- [x] Implement `viewspec/projector.ts`: `a`, `h`, `f`, `u`, `r` projections.
- [x] Property tests for INV-1 and INV-2, 600 generated cases each. Unit tests for the parser and analyzers came later, in `packages/core/tests/`.
- [x] **Gate:** all property tests pass on generated random document trees.

## Phase 3: Oberon Command Engine and Analyzers (Nov 19 to 21)

- [x] Implement `oberon/tokenizer.ts` (`Module.Action(arg)` and `->` pipelines) with an INV-4 round-trip property test.
- [x] Implement `analyzers/contradiction.ts`, `analyzers/tightener.ts`, `analyzers/extractor.ts`.
- [x] Implement `oberon/commands.ts`: `View.Spec`, `View.Level`, `Spec.Audit`, `Spec.Tighten`, `Cite.Verify`, `Outline.ExtractTasks`, `Doc.InjectFlaw`, `System.Undo`, `System.Redo`, `System.ClearLog`, `System.Export`.
- [x] Implement `history/stack.ts` with an INV-3 (undo/redo exact inverse) and INV-5 (audit monotonicity under flaw injection) property tests.
- [x] **Gate:** core tests run multi-step pipelines through `runLine` with no DOM dependency. `packages/core/tests/` holds those tests, for example the `Doc.InjectFlaw -> Spec.Audit` checks in `contradictions.test.ts`.

## Phase 4: Zero-Menu Tiled Web Workbench (Nov 19)

- [x] Scaffold `packages/web` (Vite, React, TypeScript).
- [x] Build `TrackLayout.tsx`: resizable two-track split with Document Track on the left and `System.Tool` and `System.Log` on the right.
- [x] Build `NlsDocumentPane.tsx`: `§` gutter badges, role indicators, inline flag highlights, and `a`/`h`/`f`/`u`/`r` keys. The pane shows the `View.Level` clip as a status note.
- [x] Build `CoordinateSplitPane.tsx`: clicking a `§` reference opens the target node side by side.
- [x] Build `SystemToolPane.tsx` (editable command pad with default recipes, including `View.Level(1)` and `View.Level(2)`) and `SystemLogPane.tsx` (clickable log output).
- [x] Build `PulseOverlay.tsx`: directional pulse from selection to command (`4ed7c9f`). Removed in `f4d5428`; no pulse styling remains.
- [x] **Gate:** the full user flow works offline in the browser with no menus or modals. This was checked with 17 headless-Chrome interaction checks against the production build. That script is not in the repo. Fonts were loaded from Google Fonts at that point, so they fell back offline. Since `f4d5428`, IBM Plex Mono and IBM Plex Serif are bundled from `@fontsource` packages and load offline.

## Phase 5: MCP Server, Showcase Fixtures, and Optional AI Adapter (Nov 19)

- [x] Implement `packages/mcp-server/src/index.ts` with a stdio MCP server. Tools: `augeron_parse_document`, `augeron_project_viewspec`, `augeron_run_pipeline`, `augeron_verify_audit`. The tool name is `augeron_verify_audit`, not `augeron_verify_invariants` as in the earlier draft.
- [x] Author three fixtures in `packages/web/src/fixtures/`: distributed edge cache RFC, AI safety literature brief (`research-synthesis.ts`), and zero-downtime billing migration PRD (`product-spec-checkout.ts`). Switch with `Doc.Load(rfc|brief|prd)` in System.Tool. Each load is one history snapshot.
- [x] Add `optionalLlmAdapter.ts`, configured with `AI.Config(key)`. It adds an advisory AI.Review after Spec.Audit. On a missing key, offline, or any failure it falls back to the deterministic output, and the key stays in memory only.
- [x] Register the server in `.kiro/settings/mcp.json`, and load it in kiro-cli.
- [ ] **Gate:** the Kiro IDE invokes the MCP tools. Not verified. kiro-cli is verified (see the status table).
- [ ] **Gate:** the deployed preview URL works in an incognito browser. Not done. No deployment exists.

## Sprint history after the first build (git history)

- [x] **Sprint 1 and 1.5** (`bb7f807`, 2026-11-20): usability fixes in the web workbench, including Escape to clear the selection and the Nocturnal Archival Exhumation theme (`View.Theme(exhumed|paper)`). Replaced in `f4d5428` by `View.Theme(light|dark|halloween)`.
- [x] **Sprint 2** (`32ee626`, 2026-11-21): parser and analyzer hardening for real-world specs.
- [x] **Sprint 2.5** (`1b0da7f`, 2026-11-21): tests that kill the mutation gaps M1, M2, and M13.
- [x] **Sprint 2.6** (`d945c85`, 2026-11-21): recognize numbered reference headings and wrapped reference keys.
- [x] **Sprint 3, 3A** (`56c2e0e`, 2026-11-22): MCP tool logic moved to `packages/mcp-server/src/tools.ts`, `includeTree`, tool tests, and the CI workflow `.github/workflows/ci.yml`.
- [x] **Sprint 3B** (`cb66c46`, 2026-11-22): `View.Level(n)` in core with unit tests in `packages/core/tests/view-level.test.ts`, the web pad and pane, and the docs pass.
- [x] **Redesign** (`65e6af8`, `f4d5428`, `dd08ccd`, `7ab8210`, 2026-11-25 to 27): core `View.Brief`, `Spec.Ledger`, `Find.Look`, `Link.Back`, `Help.Show`, `Review.Mark` and `Review.Clear`, `System.History`, and `Tool.Check`. The drafting-sheet web UI adds the entry page, a `/` command line (`slashCommands.ts`), `View.Theme(light|dark|halloween)`, `Audio.On` and `Audio.Off`, and self-hosted IBM Plex fonts. The MCP server calls core `runPipeline`. Master was fast-forwarded to `7ab8210`.

## Phase 6: Polish, Demo Video, and Submission (Dec 1 to 4 on the plan)

- [x] `System.Export` downloads `augeron-audited-spec.md` (anchors and Audit Summary table) and logs a receipt. Checked in headless Chrome.
- [x] README: overview, quickstart, view codes, Oberon command catalog, MCP options, CI, and "Built with Kiro" section.
- [x] Clean `git clone` check in a fresh directory: install, build, `npm test`, and `test:pbt` all exit 0 (`70a7335`).
- [ ] Typography polish and keyboard shortcut cheatsheet in `System.Tool`.
- [ ] Record the demo video under 3 minutes. Write the Kiro usage write-up. Add README screenshots.
- [ ] Final submission check: public repo, MIT badge, `/.kiro` at root, live URL, demo video link, Kiro usage write-up. Submit before Dec 4, 2:00 PM PT.

## Risk Mitigations

- Demo reliability: all commands run offline and deterministically. The LLM path is optional.
- Scope creep: no retro skins, no accounts, no collaboration (see requirements Scope).
