# Requirements: Augeron Workbench

Source: SPEC.md Sections 1 to 3 and 5 to 6. Requirements use EARS phrasing.

## Scope

- Local-first, zero-install browser workbench. No cloud accounts, no database, no multi-user collaboration.
- No retro skins (no CRT scanlines, phosphor text, or 1980s OS chrome).
- Every core command works offline with deterministic engines. No API key is required.

## Glossary

- **DocumentTree:** Parsed document. Holds `DocNode` items with permanent `§` coordinates.
- **§ coordinate:** Stable address such as `§1`, `§2.1`, or `§2.1b`. Headings get numeric coordinates. Body paragraphs add a lowercase letter suffix.
- **View-Spec:** Non-destructive projection of the tree. Codes: `a` (all), `h` (headings), `f` (first sentence), `u` (unverified), `r` (requirements and conflicts).
- **Command token:** `Module.Action` or `Module.Action(arg)`. Clickable anywhere on screen.
- **Pipeline:** Command tokens joined by `->`, executed left to right.

## REQ-1: Addressable Document Parsing and Coordinate Stability

- **REQ-1.1:** WHEN a user pastes, loads, or edits text in the Document Track, THE SYSTEM SHALL parse the text into a `DocumentTree` where every heading and paragraph has a unique `id` and `§` coordinate.
- **REQ-1.2:** WHEN a document is parsed, THE SYSTEM SHALL build an `indexByCoord` lookup table mapping every `§` coordinate to its `nodeId` in O(1) time.
- **REQ-1.3:** WHEN a node contains an inline `§` reference (for example `§2.1a`) that does not exist in `indexByCoord`, THE SYSTEM SHALL attach a `BROKEN_REF` flag to that node.

## REQ-2: Non-Destructive View-Spec Projection

- **REQ-2.1:** WHEN the user presses a View-Spec hotkey (`a`, `h`, `f`, `u`, `r`) while not typing in an editable input, or triggers `View.Spec(code)`, THE SYSTEM SHALL render the filtered projection within 50 ms.
- **REQ-2.2:** WHILE any View-Spec filter (`h`, `f`, `u`, `r`) is active, THE SYSTEM SHALL NOT mutate `DocNode.rawText`. Switching back to `a` restores the original document byte for byte.

## REQ-3: Text-As-Command Tokenization and Execution

- **REQ-3.1:** THE SYSTEM SHALL detect all valid `Module.Action` and `Module.Action(arg)` tokens in `System.Tool`, `System.Log`, and the Document Track.
- **REQ-3.2:** WHEN a user middle-clicks (button `1`) or Ctrl/Cmd-clicks a valid command token, THE SYSTEM SHALL resolve the current selection (or focused `§` node), execute the registered handler, and append a structured entry to `System.Log`.
- **REQ-3.3:** WHEN a clicked command is part of a `->` chain on the same line, THE SYSTEM SHALL pass the updated `CommandContext` from left to right and halt at the first stage that returns an error.

## REQ-4: Zero-Menu Workspace and Coordinate Navigation

- **REQ-4.1:** THE SYSTEM SHALL present the workspace without icon toolbars, dropdown menus, or blocking modal popups. Every action SHALL be invocable by text command or documented keyboard shortcut.
- **REQ-4.2:** WHEN a user clicks an inline `§` coordinate badge or cross-reference, THE SYSTEM SHALL open a split-pane reference viewer at the target node and keep the main pane's scroll position.
- **REQ-4.3:** WHEN a command executes, THE SYSTEM SHALL show a brief visual pulse from the active selection or node to the invoked command token, and highlight every modified or flagged `§` node.

## REQ-5: Deterministic Offline Analyzers, History, and Export

- **REQ-5.1:** THE SYSTEM SHALL execute `Spec.Audit`, `Spec.Tighten`, `Cite.Verify`, `Outline.ExtractTasks`, and `Doc.InjectFlaw` locally with deterministic TypeScript engines and zero required network calls.
- **REQ-5.2:** WHERE a user supplies an OpenAI-compatible API key through `AI.Config(...)` in `System.Tool`, THE SYSTEM MAY enrich `Spec.Tighten` and `Spec.Audit` with LLM output. On error or offline mode, THE SYSTEM SHALL fall back to the deterministic engine.
- **REQ-5.3:** WHEN a command mutates the `DocumentTree`, THE SYSTEM SHALL push an immutable snapshot onto the history stack so `System.Undo` and `System.Redo` restore exact prior states.

## Command Catalog

| Command token | Mutates tree | Scope | Behavior |
| --- | --- | --- | --- |
| `View.Spec(a\|h\|f\|u\|r)` | No | Full doc | Switches the active View-Spec and logs visible and hidden node counts. |
| `Spec.Audit` | Flags only | Selection or full doc | Detects numeric and unit contradictions across `§` nodes, flags ungrounded claims, and flags vague terms (`fast`, `scalable`, `TBD`). |
| `Spec.Tighten` | Yes | Selected nodes | Strips hedging filler, converts passive statements to EARS requirements, and updates `rawText` in place. |
| `Cite.Verify` | Flags only | Selection or full doc | Validates every `§` cross-reference against `indexByCoord` and checks that numeric claims carry a citation. |
| `Outline.ExtractTasks` | No | Selection or full doc | Extracts `Requirement` and flagged nodes into a prioritized Markdown checklist with `§` tags in `System.Log`. |
| `Doc.InjectFlaw` | Yes | Full doc | Demo helper. Injects a conflicting latency requirement and a broken `§9.9z` reference. |
| `System.Undo` | Yes | History stack | Restores the previous `DocumentTree` snapshot. |
| `System.Redo` | Yes | History stack | Reapplies the last undone snapshot. |
| `System.ClearLog` | No | `System.Log` | Clears log entries and keeps the welcome and help block. |
| `System.Export` | No | Full doc | Exports clean Markdown with `§` anchors and an appended Audit Summary table. |

## Invariants (fast-check property tests)

- **INV-1 (View-Spec non-destructiveness):** For any tree T and any View-Spec v, applying v never alters `rawText` and never drops a node.
- **INV-2 (Coordinate bijection):** Every node's `coordinate` resolves through `indexByCoord` to its exact `id`, and the index size equals the flattened node count.
- **INV-3 (Undo/Redo exact inverse):** For any tree T and any mutating command C, `undo(exec(T, C))` is structurally identical to T.
- **INV-4 (Tokenizer round-trip):** For any valid parsed command c, `parseCommand(formatCommand(c))` equals c.
- **INV-5 (Audit monotonicity):** For any tree T, `flagCount(Spec.Audit(Doc.InjectFlaw(T)))` is greater than `flagCount(Spec.Audit(T))`.

## Kiro Submission Compliance

- Public GitHub repo with MIT `LICENSE` at the root.
- `/.kiro` at root with `specs/`, `steering/`, `hooks/`, and `settings/mcp.json`. Not listed in `.gitignore`.
- Deployed static build that needs no login or paid key.
- Demo video under 3 minutes, public on YouTube, with no copyrighted music or third-party trademarks.
- Kiro usage write-up covering specs, steering, hooks, MCP, and PBT.
