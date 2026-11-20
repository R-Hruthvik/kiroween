# Augeron Frontend UI/UX Design Specification (`packages/web`)

## 1. Visual System and Editorial Design Tokens

Augeron rejects fake 1980s CRT and green-phosphor skins: no scanlines, curvature, glow, flicker, or bezels. Style comes from layout and type, paired with Oberon's tiled viewer discipline.

### 1.1 Themes and the `View.Theme` command

Two themes are defined as CSS custom properties on `<html data-theme="…">` (`packages/web/src/index.css`, `packages/web/src/theme.ts`):

- **`exhumed` (default): "Nocturnal Archival Exhumation".** A dark archive reading room for a technology dug back up from 1968 and 1986. Flat surfaces and hairlines only; the dark ground is the whole effect.
- **`paper`:** the warm ivory Swiss editorial theme.

Switching is a text command, never a toggle, menu, or settings panel: `View.Theme(exhumed)` and `View.Theme(paper)` sit in the default `System.Tool` pad and run on middle-click or Ctrl/Cmd-click. The choice is saved in `localStorage` (`augeron.theme`) and applied before first render. `View.Theme` is a web-only command: it logs a one-line confirmation, rejects unknown names with an error entry, and cannot appear inside a `->` pipeline.

A quiet colophon under the Document Track header names the lineage: `AUGERON · EXHUMED FROM 1968 NLS & 1986 OBERON`.

### 1.2 Color tokens

| Token | `exhumed` | `paper` | Use |
| --- | --- | --- | --- |
| `--bg-paper` | `#0E1015` | `#FAF9F6` | Reading and editing panes |
| `--bg-track` | `#151922` | `#F3F1EC` | System.Tool pad, pane headers |
| `--border-hairline` | `#272E3D` | `#E5E2DC` | 1px rules between panes and sections; no drop shadows |
| `--ink-primary` | `#EDE7DB` | `#141413` | Body text |
| `--ink-muted` | `#9CA3B4` | `#57534E` | § badges, timestamps, role tags, `[+Nw]` |
| `--cmd-ink` / `--cmd-bg` | `#FBBF24` on `#231C10` | `#3730A3` on `#EEF2FF` | Oberon command tokens |
| `--cmd-underline` | `#D97706`, 1px dotted | `#6366F1`, 1px dotted | Token underline (solid for a System.Tool chain line) |
| `--scope-accent` / `--scope-bg` | `#2DD4BF` / `#102427` | `#0F766E` / `#F0FDFA` | Selected node row (3px inset bar) and active scope label. Teal so selection never reads as an amber caution flag |
| Danger flag ink / bg / bar | `#F87171` / `#2A1216` / 2px `#EF4444` | `#991B1B` / `#FEF2F2` / 2px `#DC2626` | `CONTRADICTION`, `BROKEN_REF` |
| Caution flag ink / bg / bar | `#FCD34D` / `#261E0F` / 2px `#F59E0B` | `#92400E` / `#FFFBEB` / 2px `#D97706` | `UNVERIFIED_CLAIM`, `AMBIGUOUS_TERM` |
| `--pulse-default` / `--pulse-danger` / `--pulse-tighten` | `#F59E0B` / `#EF4444` / `#2DD4BF` | `#D97706` / `#DC2626` / `#0F766E` | Pulse beam tones (section 4.4) |
| `--focus-ring` | `#2DD4BF` | `#0F766E` | 2px `:focus-visible` outline |

Every text and background pair meets WCAG AA (at least 4.5:1) in both themes.

### 1.3 Typography

- **NLS document prose:** `'Newsreader', 'Source Serif 4', Georgia, serif` at 18px, line-height 1.65, maximum measure 66ch. Headings render as real `<h1>`..`<h6>` at 1.6, 1.3, and 1.1rem, weight 600.
- **Coordinates, commands, and logs:** `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace`. 13px in `System.Tool` and `System.Log`. `§` gutter badges are 12.5px tabular, slashed-zero numerals in a 1px hairline box, like an etched index marker. Role tags are 11.5px uppercase.
- **Ligatures are off** (`font-variant-ligatures: none`) in every monospace pane, so `<!--`, `->`, and `!=` show as typed.

## 3. Spatial Architecture: Zero-Menu Two-Track Tiled Layout (`TrackLayout.tsx`)

Full-viewport layout (`100vw` by `100vh`, `overflow: hidden`), separated by draggable 1px hairline splitters. Zero icon toolbars, zero dropdown menus, zero modal popups.

```text
+-------------------------------------------------------+---------------------------------------+
| LEFT TRACK: NLS Document Viewer                       | RIGHT TRACK TOP: System.Tool          |
| [Doc Title]                 View-Spec: [a] h f u r    | (Editable plain-text command pad)     |
|-------------------------------------------------------|                                       |
| §1     # Distributed Edge Cache RFC                   |  View.Spec(a)  View.Spec(h)           |
| §1.1a  The edge tier SHALL serve reads in < 50 ms.    |  View.Spec(f)  View.Spec(u)           |
| §1.1b  Requests are routed via consistent hashing.    |  Spec.Audit    Spec.Tighten           |
|                                                       |  Cite.Verify   Outline.ExtractTasks   |
|-------------------------------------------------------|  Spec.Audit -> Outline.ExtractTasks   |
| OPTIONAL SPLIT COMPANION: CoordinateSplitPane         |  Doc.InjectFlaw                       |
| [Pinned Target: §4.3a]                        [Close] |  System.Undo   System.Redo           |
| §4.3a  P99 cache read latency is 200 ms under load.   |  System.Export System.ClearLog        |
|        [CONTRADICTION <-> §1.1a]                      |---------------------------------------|
|                                                       | RIGHT TRACK BOTTOM: System.Log        |
|                                                       | (Append-only clickable output stream) |
|                                                       |  Spec.Audit -> 2 flags                |
|                                                       |  • CONTRADICTION at §1.1a <-> §4.3a   |
|                                                       |  • BROKEN_REF at §2.2b (-> §9.9z)     |
+-------------------------------------------------------+---------------------------------------+
```

## 4. Component Specifications and Interaction Choreography

### 4.1 OberonTextRenderer.tsx (universal command and coordinate parser)

Used in `System.Tool`, `System.Log`, and `NlsDocumentPane`, so any command or `§` coordinate on screen is interactive.

- Scans text segments for:
  - `Module.Action` and `Module.Action(arg)` tokens. Each gets a `data-cmd-id` attribute for pulse targeting.
  - Inline `§` coordinates (`§1`, `§2.1b`, `§9.9z`).
- Command trigger bindings:
  - Only registered commands (the core registry plus the web-only `Doc.Load`, `AI.Config`, `Edit.Source`, `Edit.Done`, `View.Theme`) render as live tokens. Prose such as "U.S" or "Foo.Bar" stays plain text.
  - `onMouseDown`: if `e.button === 1` (middle-click), call `e.preventDefault()` to block the browser auto-scroll circle, then dispatch the token.
  - `onClick`: if `e.metaKey || e.ctrlKey`, dispatch the token. A plain click does not run a token in `System.Tool`, `System.Log`, or the document; it shows a short non-modal hint in the pane header instead. Only the explicit `Edit.Source` / `Edit.Done` controls run on a plain click.
  - A token runs alone, except in `System.Tool` on a line made only of core commands joined by `->` (core `asPipeline`): that line runs as one pipeline, and its tokens get a solid underline.
- Coordinate trigger binding: clicking an inline `§` reference opens `CoordinateSplitPane` on that coordinate. If the coordinate is missing from `indexByCoord`, log a clear `BROKEN_REF` notice in `System.Log`.

### 4.2 NlsDocumentPane.tsx and CoordinateSplitPane.tsx

- Gutter and node row: each `ProjectedNode` renders with `data-coord={node.coordinate}`, a left-aligned monospace `§` badge in a fixed 4.5rem gutter, a semantic role micro-tag (REQ, CLAIM, EVID, ASSUMP), and inline `NodeFlag` callout strips under flagged paragraphs.
- View-Spec rendering (`a`, `h`, `f`, `u`, `r`):
  - Single-key hotkeys switch `activeViewSpec` immediately whenever `document.activeElement` is not a `<textarea>` or a contentEditable element.
  - A plain-text status strip at the top of the left track shows the active View-Spec: `[a] all | [h] headings | [f] first-sentence | [u] unverified | [r] requirements`. Each letter is clickable as plain text, never an icon button.
  - In `f` mode, truncated nodes show the first sentence followed by an inline monospace badge `[+{hiddenWordCount}w]`.
- Selection and source editing:
  - Clicking a node's text, § badge, role tag, or flag strip sets `selectedNodeIds = [node.id]`. Dragging across text selects each node whose own row the range touches (never its ancestor headings).
  - Clearing: Escape, clicking the only selected node again, or clicking whitespace that is not over a node's content. `Edit.Done` and `Doc.Load` also clear it, and so does any command after which a selected node moved to a different coordinate.
  - The header shows the scope: `Scope: Full doc`, or `Scope: §3.1a (Esc to clear)`. `Spec.Tighten` and `Outline.ExtractTasks` act on the scope; `Spec.Audit` and `Cite.Verify` always check the full document.
  - Keyboard: each node row is focusable (`tabIndex=0`) with a visible focus ring. Enter or Space selects it, or clears it when it is the only selection.
  - Selection state is persisted in `useWorkbenchStore` on `mouseup` and `keyup`, so clicking inside `System.Tool` never clears the target selection.
  - Empty states: an empty document says so and offers `Edit.Source`; a filtered view with no matches says to press `a`.
  - A plain-text `Edit.Source` / `Edit.Done` toggle (or double-click on a paragraph) edits the raw Markdown and re-parses it live through `packages/core`.

### 4.3 SystemToolPane.tsx and SystemLogPane.tsx

- `SystemToolPane.tsx`: a monospace plain-text pad, pre-populated with grouped Oberon command recipes and pipeline examples (`Spec.Audit -> Outline.ExtractTasks`, `Cite.Verify -> View.Spec(u)`). Users can type their own command lines and middle-click or Ctrl/Cmd+Click them immediately.
- `SystemLogPane.tsx`: an append-only chronological stream of command outcome cards (timestamp, log title, affected coordinates rendered as clickable `§` links, and log body rendered through `OberonTextRenderer`, so follow-up commands in logs run on middle-click or Ctrl/Cmd-click). A single-command entry does not repeat its title in the body. The stream has 3rem of bottom padding so the newest entry is never flush with the edge.
- `System.Export` downloads `augeron-audited-spec.md` and logs a short receipt (file name, node count, flag rows, size) instead of the whole document.

### 4.4 PulseOverlay.tsx (tactile visual feedback)

- A fixed `pointer-events: none` SVG overlay spanning the viewport.
- When a command executes, compute the bounding boxes of `[data-coord="<primaryTargetCoord>"]` and `[data-cmd-id="<invokedCmdId>"]`. Animate a 350ms cubic-bezier beam with an expanding node ring. Then highlight all affected coordinates for 1.2s.
- Beam tone: crimson (`--pulse-danger`) after `Doc.InjectFlaw` or any output with a contradiction, teal (`--pulse-tighten`) after `Spec.Tighten`, amber (`--pulse-default`) otherwise.
- With `prefers-reduced-motion: reduce`, no beam is drawn; the affected-node highlight still marks what changed, without a transition.
