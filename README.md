# Augeron

Augeron is a local-first workbench for reading and checking AI-generated specs. It brings back two ideas from computing history:

- **Engelbart's NLS (1968):** every section has a permanent address (`§2.1b`), and single-key View-Specs (`a`, `h`, `f`, `u`, `r`) filter the view without changing the text.
- **Wirth's Oberon System (1986):** no menus and no modal dialogs. Any `Module.Action` token is a live command. Middle-click it, or Ctrl/Cmd-click it, to run it against the selection. Commands chain with `->`.

Every core command runs offline with deterministic analyzers. An optional OpenAI-compatible key, entered with `AI.Config(key)`, adds an advisory review after `Spec.Audit`. It never changes the flags.

## Quickstart

```bash
npm install
npm run dev        # builds core, then starts the workbench at http://127.0.0.1:5173
npm test           # unit and property tests, all workspaces
npm run test:pbt   # the five fast-check invariants
npm run build      # core, web, and mcp-server, in that order
npm run start:mcp  # stdio MCP server (run npm run build first)
```

Requires Node.js 22 or newer.

## View-Spec hotkeys

Press a key with the Document Track focused. Hotkeys are off while you type in System.Tool.

| Key | View | Shows |
| --- | --- | --- |
| `a` | All | Every node. This is the original document, byte for byte. |
| `h` | Headings | Headings only. |
| `f` | First sentence | Each paragraph's opening sentence, with `[+Nw]` for hidden words. |
| `u` | Unverified | Numeric claims and assumptions with no citation or § reference. |
| `r` | Requirements | SHALL and MUST requirements, plus nodes with CONTRADICTION or BROKEN_REF. |

## Oberon command catalog

Tokens take the form `Module.Action` or `Module.Action(arg)`. Pipelines look like `Spec.Audit -> Outline.ExtractTasks`. The whole line is validated before any stage runs. The first error stops the chain.

| Token | Mutates text | What it does |
| --- | --- | --- |
| `View.Spec(a\|h\|f\|u\|r)` | No | Switches the View-Spec. Same as the hotkeys. |
| `Spec.Audit` | No | Flags contradictions, broken `§` references, unverified claims, and vague terms. |
| `Spec.Tighten` | Yes | Strips filler and rewrites passive phrasing as EARS requirements. |
| `Cite.Verify` | No | Checks `§` references and citations. |
| `Outline.ExtractTasks` | No | Builds a prioritized checklist. P0 is contradictions and broken references, P1 is requirements, and P2 is other flagged nodes. |
| `Doc.InjectFlaw` | Yes | Demo helper. Appends a latency conflict and a broken reference. |
| `Doc.Load(rfc\|brief\|prd)` | Yes | Loads a showcase fixture. Undoable. |
| `System.Undo` / `System.Redo` | Yes | Steps through the history stack. |
| `System.ClearLog` | No | Clears the log and keeps the welcome block. |
| `System.Export` | No | Logs the audited Markdown, and downloads `augeron-audited-spec.md`. |
| `AI.Config(key)` | No | Turns on the advisory AI review for this session. `AI.Config()` turns it off. |
| `Edit.Source` / `Edit.Done` | Yes | Opens the Markdown source for editing, and re-parses it on Done. |

## Architecture

| Path | Purpose |
| --- | --- |
| `packages/core` | Domain engine: parser, View-Specs, analyzers, tokenizer, command registry, history. No DOM, React, `fs`, or network calls. |
| `packages/web` | React and Vite workbench. Owns DOM events, hotkeys, localStorage, and the optional LLM adapter. |
| `packages/mcp-server` | Stdio MCP server with four tools over `@augeron/core`: `augeron_parse_document`, `augeron_project_viewspec`, `augeron_run_pipeline`, and `augeron_verify_audit`. |

## Invariants

`packages/core/tests/invariants.prop.test.ts` checks five properties with fast-check, 600 runs each:

- **INV-1:** Projections never change `rawText`, drop nodes, or touch the index.
- **INV-2:** Every node has a unique `§` coordinate that resolves back to its id.
- **INV-3:** Undoing a mutating command restores the earlier tree, and redo restores the result.
- **INV-4:** `parseCommand(formatCommand(c))` equals `c`.
- **INV-5:** Auditing a document after `Doc.InjectFlaw` gives strictly more flags than auditing it before, for every input.

## Built with Kiro

This project was built with Kiro as a spec-driven workflow. The repository keeps its Kiro artifacts at the root, on purpose.

- **`.kiro/specs/augeron-workbench/`:** `requirements.md`, `design.md`, `tasks.md` (the phase checklist), and `ui-design.md` (the Swiss editorial design system).
- **`.kiro/steering/`:** `product.md` (zero-menu UX and scope), `architecture.md` (package boundaries and the deterministic-fallback rule), and `oberon-nls-grammar.md` (the `§` coordinate and command token grammar).
- **`.kiro/hooks/verify-invariants.json`:** a PostFileSave hook. Saving a file in `packages/core/src` runs the fast-check invariant suite.
- **`.kiro/skills/`:** `augeron-ui-gate` (checks React changes against the UI rules) and `kiroween-preflight` (checks repo structure and submission readiness).
- **`.kiro/settings/mcp.json`:** registers the local `augeron` stdio server. Kiro starts it from the repo root with `node packages/mcp-server/dist/index.js`, which needs `npm run build` first. `kiro-cli` 3.5.0 loads it and calls `augeron_verify_audit`.

## License

MIT. See [LICENSE](./LICENSE).

---

## Hackathon context

Built for Kiroween 2026 (Kiro × Devpost). Category: Resurrection. Research notes are in `docs/`, which is not tracked in git.
