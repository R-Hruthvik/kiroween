# Oberon and NLS Grammar

Use this grammar when you write parsers, tokenizers, command handlers, UI click handling, or tests. Source: SPEC.md Sections 2 and 5, BUILD_PLAN.md Section 3.

## 1. NLS coordinates (`§`)

### 1.1 Form

A coordinate has one of these forms:

| Kind | Example | Regex |
| --- | --- | --- |
| Heading, top level | `§1` | `^§[1-9]\d*$` |
| Heading, nested | `§1.2`, `§1.2.1` | `^§[1-9]\d*(\.[1-9]\d*)+$` |
| Body paragraph | `§1.2a`, `§2.1b`, `§1.1aa` | `^§[1-9]\d*(\.[1-9]\d*)*[a-z]+$` |
| Preamble body (text before the first heading) | `§0a` | `^§0[a-z]+$` |

The full validity regex is: `^§(0[a-z]+|[1-9]\d*(\.[1-9]\d*)*([a-z]+)?)$`

### 1.2 Assignment rules (§1.2a rules)

1. **Heading numbering (per parent).** A heading's coordinate is its parent heading's coordinate, a dot, and the heading's position among its parent's heading children, counted from 1. Top-level headings (no parent heading) use `§` plus their position among top-level headings.
   - `# A` is `§1`. `## B` under `# A` is `§1.1`. `## C` is `§1.2`. `# D` is `§2`.
   - A skipped level is not a gap. `# A` then `### B` gives `§1.1`, not `§1.0.1`. Coordinates use the same parent-relative count in both cases.
   - Under `# A`, the sequence is `## B` (`§1.1`), `### X` (`§1.1.1`), `## C` (`§1.2`), and then `# D` (`§2`).
   - Only heading children are counted. Body paragraphs have letter suffixes and do not use up a heading number.
2. **Body letters.** Body paragraphs under a heading get that heading's coordinate plus a letter suffix. Indices start at 0.
   - Index 0 is `a`, 1 is `b`, and so on through 25 (`z`). Index 26 is `aa`, 27 is `ab`. This is bijective base-26 applied to `index + 1`.
   - The first paragraph under `§1.2` is `§1.2a`. The 27th is `§1.2aa`.
3. **Body letters do not reset per heading.** Each heading has its own paragraph index. Its sequence restarts at `a`.
4. **Headings have no letter suffix.** Only body paragraphs get letters.
5. **Preamble.** Body text before any heading takes `§0` plus letters: `§0a`, `§0b`.
6. **Stability.** A coordinate is assigned at parse time. Each node also gets an immutable `id` that never changes when coordinates shift. Cross-references may resolve by either.
7. **Uniqueness.** Every coordinate in a `DocumentTree` is unique. `indexByCoord` has exactly one entry per node (INV-2).

### 1.3 Cross-references

- An inline reference is any `§` coordinate in text that matches the validity regex in 1.1.
- A reference that does not exist in `indexByCoord` gets a `BROKEN_REF` flag on the node that contains it (REQ-1.3). `Doc.InjectFlaw` picks its broken target at run time, checking it against the injected index. It starts at `§99.99z` and moves to the next candidate if that one exists.
- Clicking a valid reference opens the target node in the split-pane viewer (REQ-4.2).

## 2. Command tokens

### 2.1 Form

- Token: `Module.Action` or `Module.Action(arg)`.
- `Module` and `Action` start with an uppercase letter. Each may then contain letters and digits. No underscores or hyphens.
- `arg` is any run of characters other than `)`.

| Form | Regex (whole token) |
| --- | --- |
| Full token | `^[A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*(\([^)]*\))?$` |
| Scanning inside text | `/\b([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*)(?:\(([^)]*)\))?/g` |

Example: `View.Spec(u)` gives `module = "View"`, `action = "Spec"`, `arg = "u"`.

### 2.2 Pipelines (`->`)

- A pipeline is one or more tokens separated by `->`. Whitespace around `->` is optional.
- Example: `Spec.Audit -> Cite.Verify -> View.Spec(u)`.
- Split the line on `->`. Trim each stage. Validate every stage against the registry before running any of them.
- Run stages left to right. Each stage gets the `CommandContext` returned by the previous stage.
- If a stage returns `error`, stop. Do not run later stages. Log the failed stage and its error.
- Each stage's output appends to one combined `System.Log` entry.

### 2.3 Click behavior (web)

- Middle-click (`e.button === 1`): run the command. Call `preventDefault()` on `mousedown` so the browser does not start auto-scroll.
- Ctrl or Cmd with click (`e.ctrlKey || e.metaKey`): run the command.
- Target: the current selection, or the focused `§` node if nothing is selected.
- Selection is captured on `mouseup` and `selectionchange` in the Document Track, so clicking into `System.Tool` or `System.Log` does not clear it.

### 2.4 Round-trip requirement (INV-4)

- `formatCommand(parseCommand(s))` must equal `s` for every valid token `s`, and `parseCommand(formatCommand(c))` must equal `c` for every valid `ParsedCommand` `c`.
- `formatCommand` emits `Module.Action` when `arg` is undefined and `Module.Action(arg)` otherwise.
- An empty `arg` (`View.Spec()`) is invalid for handlers that need an argument. The parser still returns `arg: ""`, and the handler rejects it.

## 3. Mutation and history

- A command's catalog entry states whether it mutates the tree.
- Mutating commands (`Spec.Tighten`, `Doc.InjectFlaw`, `System.Undo`, `System.Redo`) must push an immutable snapshot before the change (REQ-5.3).
- `System.Undo` after any mutation restores the tree exactly (INV-3).
- Non-mutating commands (`View.Spec`, `Spec.Audit`, `Cite.Verify`, `Outline.ExtractTasks`, `System.ClearLog`, `System.Export`) never change `rawText`.
