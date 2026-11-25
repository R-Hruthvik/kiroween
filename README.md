# Augeron

Augeron is a local-first workbench for reviewing AI-generated specs. A dense spec in a flat editor hides its structure, its contradictions, and its broken links. Two paragraphs can disagree on a retention period, and a `§` reference can point at a section that was renamed, and a reader will not see either without a careful read. Augeron parses the spec into numbered sections and paragraphs, then runs deterministic checks that point at those problems.

It borrows two interaction ideas from computing history:

- **Engelbart's NLS (1968)** inspired the view codes. Every section and paragraph gets a structural `§` coordinate (`§2.1b`). Coordinates are re-indexed on edit, so inserting a paragraph renumbers the ones after it. The view codes `a`, `h`, `f`, `u`, and `r` are Augeron's own, and they are not NLS's letters.
- **Wirth's Oberon System (1986)** inspired the command model. There are no menus and no modal dialogs. Any `Module.Action` token in the text is a live command.

Every core command runs offline with deterministic analyzers. An optional OpenAI-compatible key, entered with `AI.Config(key)`, adds an advisory review after `Spec.Audit`. The review never changes the flags.

## Quickstart

```bash
npm install
npm run dev        # builds core, then starts the workbench at http://127.0.0.1:5173
npm test           # core unit and property tests, then mcp-server tool tests
npm run test:pbt   # the five fast-check invariants in core
npm run build      # core, web, and mcp-server, in that order
npm run start:mcp  # stdio MCP server (run npm run build first)
```

`npm test` runs the `test` script of each workspace that has one: `packages/core` (vitest unit tests and fast-check property tests) and `packages/mcp-server` (vitest tests for the MCP tool logic). `packages/web` has no test script. The repository declares no `engines` field. CI runs on Node.js 22.

## View codes

Press a key with the Document Track focused. The keys are off while you type in System.Tool.

| Key | View | Shows |
| --- | --- | --- |
| `a` | All | Every node, with its text unchanged. Also clears any `View.Level` clip. |
| `h` | Headings | Headings only. |
| `f` | First sentence | Each paragraph's opening sentence and every sentence with an RFC 2119 keyword (SHALL, MUST, SHOULD, MAY, OPTIONAL, RECOMMENDED, and the rest), with `[+Nw]` for hidden words. Node roles and audit flags do not depend on this list. |
| `u` | Unverified | Claims and assumptions with no citation or `§` reference. |
| `r` | Requirements | SHALL and MUST requirements, plus nodes with CONTRADICTION or BROKEN_REF. |

View codes are projections. They never change the document text or the coordinate index.

### Level clipping: `View.Level(n)`

`View.Level(n)` clips the view to heading depth `n`, as NLS level clipping does. A heading deeper than `n` is hidden with its whole subtree. Body text follows the heading that owns it, so `View.Level(1)` shows the top-level sections and their paragraphs only.

The clip layers on the active view code. `View.Level(1)` followed by `View.Spec(u)` shows unverified claims under top-level headings only. `View.Spec(h)`, `f`, `u`, and `r` keep the clip. `View.Spec(a)` clears it. `n` must be a positive integer. Other arguments return an error and leave the clip as it was.

Level clipping is a projection. It does not change the tree, `rawText`, or the coordinates.

## Oberon command catalog

Tokens take the form `Module.Action` or `Module.Action(arg)`. Pipelines look like `Spec.Audit -> Outline.ExtractTasks`. The whole line is validated before any stage runs. The first error stops the chain.

| Token | Mutates text | What it does |
| --- | --- | --- |
| `View.Spec(a\|h\|f\|u\|r)` | No | Switches the view code. Same as the keys. `View.Spec(a)` also clears the level clip. |
| `View.Level(n)` | No | Clips the view to heading depth `n`. See [Level clipping](#level-clipping-viewleveln). |
| `View.Brief(n)` | No | Excerpt view. Keeps up to `n` whole sentences per section (default 2), picked by RFC 2119 keyword, then numbers and definitions, then words shared with the heading. Each sentence shows its `§` address. A footer gives the word counts. Any View-Spec or `View.Level` turns it off. |
| `View.Theme(exhumed\|paper)` | No | Web only. Switches the theme. `exhumed` is the default, "Nocturnal Archival Exhumation", a dark archive. `paper` is the warm ivory theme. The choice is saved in the browser. |
| `Spec.Audit` | No | Flags contradictions, broken `§` references, unverified claims, and vague terms. The checks are deterministic text rules, so on real specs they can produce false positives. Treat each flag as a prompt to look. |
| `Spec.Ledger(n)` | No | Lists every sentence with an RFC 2119 keyword: address, modal, condition or exception clause, and whether `View.Brief(n)` keeps it (default `n` is 2). Also checks that every row is in the brief or marked omitted. |
| `Review.Mark(§x)` | No | Web only. Marks one `§` paragraph reviewed. The mark is kept in the browser, outside the text, and stops counting when that paragraph changes. |
| `Review.Clear(§x)` | No | Web only. Removes the review mark from one `§` paragraph. The text is unchanged. |
| `Spec.Tighten` | Yes | Removes filler phrases such as "basically", "very", and "it is important to note that". Turns "in order to" into "to". Turns "The system should", "will", or "should try to" into "The system SHALL", and "X is required to" into "X SHALL". It does not rewrite passive voice into EARS form. It skips headings and code fences, and it acts on the selection when one exists. |
| `Cite.Verify` | No | Checks `§` references and citations. |
| `Outline.ExtractTasks` | No | Builds a prioritized checklist. P0 is CONTRADICTION or BROKEN_REF, P1 is other requirements, and P2 is other flagged nodes. |
| `Doc.InjectFlaw` | Yes | Demo helper. Appends a latency conflict and a broken reference. |
| `Doc.Load(rfc\|brief\|prd)` | Yes | Web only. Loads a showcase fixture. Undoable. |
| `System.Undo` / `System.Redo` | Yes | Steps through the history stack. |
| `System.ClearLog` | No | Clears the log and keeps the welcome block. |
| `System.Export` | No | Logs the audited Markdown. The web app downloads `augeron-audited-spec.md` and logs a receipt. |
| `Find.Look(text)` | No | Acme-style Look. Lists every paragraph and heading that contains `text`, ignoring case, with its `§` address and an excerpt. Empty text is an error. |
| `Link.Back(§x)` | No | Lists every paragraph and heading whose text refers to `§x`, with an excerpt. An address that does not exist is an error. |
| `Help.Show(Module.Action)` | No | Describes one command: what it does, its argument, whether it changes the tree, and an example. With no argument, lists every command by module. |
| `Tool.Check` | No | Web only. Checks every line of System.Tool. Each token and `->` pipeline must parse and name a known command. Gives the line number of each problem, and for each line what it reads and whether it changes the tree. |
| `System.History` | No | Web only. Lists the core commands that ran this session. The browser also appends them to System.Tool under `# HISTORY`, where each line runs again on a click. Only the pad changes. |
| `AI.Config(key)` | No | Web only. Turns on the advisory AI review for this session. `AI.Config()` turns it off. |
| `Edit.Source` / `Edit.Done` | Yes | Web only. Opens the Markdown source for editing, and re-parses it on Done. |

## Using commands

- **Middle-click** or **Ctrl/Cmd-click** a token to run it. The target is the current selection. With no selection, `Spec.Tighten` and `Outline.ExtractTasks` act on the full document. `Spec.Audit` and `Cite.Verify` always check the full document.
- **Ctrl/Cmd+Enter** in System.Tool runs the command line at the cursor. A line with `->` runs as one pipeline, and a bad stage stops the whole line before anything runs. A line with several tokens runs the token under the cursor, or the nearest token before it.
- A plain click on a token in System.Tool or System.Log shows a hint. It does not run the command. The exception is `Edit.Source` and `Edit.Done`, which run on a plain click.
- Click a `§` coordinate to open that node in the split pane.

## Architecture

| Path | Purpose |
| --- | --- |
| `packages/core` | Domain engine: parser, view projections, level clip, analyzers, tokenizer, command registry, history. No DOM, React, `fs`, or network calls. |
| `packages/web` | React and Vite workbench. Owns DOM events, hotkeys, localStorage, and the optional LLM adapter. |
| `packages/mcp-server` | Stdio MCP server with four tools over `@augeron/core`: `augeron_parse_document`, `augeron_project_viewspec`, `augeron_run_pipeline`, and `augeron_verify_audit`. |

### MCP server

- `augeron_run_pipeline` returns the log, `affectedCoordinates`, `mutated`, and `nextViewSpec`. It leaves out the full `updatedTree` unless the caller passes `includeTree: true`, which defaults to `false`.
- `targetCoord` selects a `§` coordinate before the pipeline runs. Only commands whose catalog scope includes the selection honor it.
- `System.Undo`, `System.Redo`, `System.ClearLog`, `System.History`, `Tool.Check`, `Review.Mark`, and `Review.Clear` are rejected, because they need browser state. The browser-only tokens are rejected too. `Find.Look`, `Link.Back`, and `Help.Show` run here.
- `View.Level` is accepted and logs the clip. The MCP runner carries only the view code between stages, so the clip does not carry into later tool calls or into the returned payload.

## Invariants

`packages/core/tests/invariants.prop.test.ts` checks five properties with fast-check. Each property runs 600 generated cases.

- **INV-1:** View-Spec projections leave the tree unchanged. The `a` view shows every node, and `rawText` is never altered.
- **INV-2:** Every node has a unique `§` coordinate that resolves back to its id.
- **INV-3:** Undoing a mutating command restores the earlier tree, and redo restores the result.
- **INV-4:** `parseCommand(formatCommand(c))` equals `c`.
- **INV-5:** Auditing a document after `Doc.InjectFlaw` gives strictly more flags than auditing it before.

`View.Level` has unit tests in `packages/core/tests/view-level.test.ts`. It is not part of the property suite.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request. It uses Node.js 22 and runs `npm ci`, `npm run typecheck --workspaces --if-present`, `npm run build`, and `npm test`.

## Built with Kiro

This project was built with Kiro as a spec-driven workflow. The repository keeps its Kiro artifacts at the root, on purpose.

- **`.kiro/specs/augeron-workbench/`:** `requirements.md`, `design.md`, `tasks.md` (the phase checklist), and `ui-design.md` (the Swiss editorial design system).
- **`.kiro/steering/`:** `product.md` (zero-menu UX and scope), `architecture.md` (package boundaries and the deterministic-fallback rule), and `oberon-nls-grammar.md` (the `§` coordinate and command token grammar).
- **`.kiro/hooks/verify-invariants.json`:** a PostFileSave hook named `verify-core-invariants`. It matches saves under `packages/core/src` and runs the fast-check suite.
- **`.kiro/skills/`:** `augeron-ui-gate` (checks React changes against the UI rules and the core isolation rule) and `kiroween-preflight` (checks repo structure and submission readiness).
- **`.kiro/settings/mcp.json`:** registers the local `augeron` stdio server. Kiro starts it from the repo root with `node packages/mcp-server/dist/index.js`, which needs `npm run build` first. kiro-cli 3.5.0 loads it and lists the server.

## License

MIT. See [LICENSE](./LICENSE).

---

## Hackathon context

Built for Kiroween 2026 (Kiro × Devpost). Category: Resurrection. Research notes are in `docs/`, which is listed in `.gitignore` and not tracked in git.
