# Augeron Frontend UI/UX Design Specification (`packages/web`)

## 1. Visual System and Editorial Design Tokens

Augeron rejects fake 1980s CRT and green-phosphor skins in favor of high-contrast Swiss editorial typography, paired with Oberon's tiled viewer discipline.

### Color Palette
- **Primary paper surface (`--bg-paper`):** `#FAF9F6` (warm ivory paper for the main reading and editing panes)
- **Secondary track surface (`--bg-track`):** `#F3F1EC` (stone tint for the `System.Tool` pad, coordinate gutters, and pane headers)
- **Primary ink (`--ink-primary`):** `#141413`
- **Secondary ink (`--ink-muted`):** `#57534E` (coordinate badges, timestamps, hidden word counts)
- **Structural hairline (`--border-hairline`):** `#E5E2DC` (1px solid rules between tiled panes and section blocks; no drop shadows)
- **Oberon command pill (`--cmd-bg` / `--cmd-ink`):** `#EEF2FF` background, `#3730A3` text, `1px dotted #6366F1` underline
- **Tactile pulse and active target (`--accent-amber`):** `#D97706` (selection-to-command pulse beam and active target outline)
- **Semantic audit highlights:**
  - `CONTRADICTION` / `BROKEN_REF`: `#FEF2F2` background tint, `2px solid #DC2626` left accent bar, `#991B1B` flag badge
  - `UNVERIFIED_CLAIM` / `AMBIGUOUS_TERM`: `#FFFBEB` background tint, `2px solid #D97706` left accent bar, `#92400E` flag badge

### Typography
- **NLS document prose:** `'Newsreader', 'Source Serif 4', Georgia, serif` at 17px, line-height 1.65, maximum measure 68ch inside the left track.
- **Coordinates, commands, and logs:** `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace`. 13px in `System.Tool` and `System.Log`; 11.5px tabular numerals for `§` gutter badges.

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
  - `onMouseDown`: if `e.button === 1` (middle-click), call `e.preventDefault()` to block the browser auto-scroll circle, then dispatch the full line or pipeline that contains the token.
  - `onClick`: if `e.metaKey || e.ctrlKey`, dispatch the command. In `System.Log` and other non-editing contexts, a plain click also dispatches.
- Coordinate trigger binding: clicking an inline `§` reference opens `CoordinateSplitPane` on that coordinate. If the coordinate is missing from `indexByCoord`, log a clear `BROKEN_REF` notice in `System.Log`.

### 4.2 NlsDocumentPane.tsx and CoordinateSplitPane.tsx

- Gutter and node row: each `ProjectedNode` renders with `data-coord={node.coordinate}`, a left-aligned monospace `§` badge in a fixed 4.5rem gutter, a semantic role micro-tag (REQ, CLAIM, EVID, ASSUMP), and inline `NodeFlag` callout strips under flagged paragraphs.
- View-Spec rendering (`a`, `h`, `f`, `u`, `r`):
  - Single-key hotkeys switch `activeViewSpec` immediately whenever `document.activeElement` is not a `<textarea>` or a contentEditable element.
  - A plain-text status strip at the top of the left track shows the active View-Spec: `[a] all | [h] headings | [f] first-sentence | [u] unverified | [r] requirements`. Each letter is clickable as plain text, never an icon button.
  - In `f` mode, truncated nodes show the first sentence followed by an inline monospace badge `[+{hiddenWordCount}w]`.
- Selection and source editing:
  - Clicking a node sets `selectedNodeIds = [node.id]`. Dragging across text updates `selectedText` and every intersecting node.
  - Selection state is persisted in `useWorkbenchStore` on `mouseup` and `keyup`, so clicking inside `System.Tool` never clears the target selection.
  - A plain-text `Edit.Source` / `Edit.Done` toggle (or double-click on a paragraph) edits the raw Markdown and re-parses it live through `packages/core`.

### 4.3 SystemToolPane.tsx and SystemLogPane.tsx

- `SystemToolPane.tsx`: a monospace plain-text pad, pre-populated with grouped Oberon command recipes and pipeline examples (`Spec.Audit -> Outline.ExtractTasks`, `Cite.Verify -> View.Spec(u)`). Users can type their own command lines and middle-click or Ctrl/Cmd+Click them immediately.
- `SystemLogPane.tsx`: an append-only chronological stream of command outcome cards (timestamp, log title, affected coordinates rendered as clickable `§` links, and log body rendered through `OberonTextRenderer`, so follow-up commands in logs are clickable).

### 4.4 PulseOverlay.tsx (tactile visual feedback)

- A fixed `pointer-events: none` SVG overlay spanning the viewport.
- When a command executes, compute the bounding boxes of `[data-coord="<primaryTargetCoord>"]` and `[data-cmd-id="<invokedCmdId>"]`. Animate a 350ms `#D97706` cubic-bezier beam with an expanding node ring. Then highlight all affected coordinates for 1.2s.
