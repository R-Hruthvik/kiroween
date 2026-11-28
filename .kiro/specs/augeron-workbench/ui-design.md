# Augeron Web UI Design Specification (`packages/web`)

This file describes the consolidated drafting-sheet UI on `master` (from `7ab8210`). The code is the source of truth. Where this file and the code disagree, fix this file.

## 1. Visual System

### 1.1 Principles

- Style comes from layout and type. The UI has no CRT skin: no scanlines, curvature, glow, flicker, phosphor colour, or bezels (`product.md` rule 2).
- The look is a drafting sheet. Hairline grid, registration marks, and a redline for anything that needs attention.
- Two signal colours only: ink (a command you can run or follow) and redline (look here: a flag, a broken reference, an error).
- Surfaces are square. The sheet has no radius. Chips use a 2px radius.

### 1.2 Themes

Three themes are set by a `data-theme` attribute on `<html>`:

| Theme | Use |
| --- | --- |
| `light` (default) | Drafting film. |
| `dark` | Night sheet. Same roles as light. |
| `halloween` | The drafting sheet at night, in aubergine and bone-white. |

- Switch with `View.Theme(light)`, `View.Theme(dark)`, or `View.Theme(halloween)`. The theme chips in the status line run the same command. Any other name logs an error and changes nothing.
- The choice is saved in `localStorage` under `augeron.theme`. `index.html` applies it before first paint. A missing or invalid saved value falls back to `light`.
- Themes are chosen by command only. There is no toggle and no settings panel.

### 1.3 Colour Tokens

Tokens are defined in `packages/web/src/styles/tokens.css`. Every stylesheet reads these names, and raw values live only in that file.

| Token | `light` | `dark` | `halloween` | Role |
| --- | --- | --- | --- | --- |
| `--sheet` | `#eef1f3` | `#111820` | `#14101d` | Page background |
| `--paper` | `#f8fafb` | `#17202a` | `#1e1729` | Document sheet and command line surface |
| `--graphite` | `#1e262e` | `#dce3ea` | `#efe6d4` | Body text |
| `--lead` | `#5b6772` | `#8d99a5` | `#b2a7c2` | Secondary text and § addresses |
| `--grid` | `#d3dae0` | `#26313c` | `#3e3352` | Hairlines |
| `--mark` | `#d3dae0` | `#26313c` | `#8a7da0` | Registration marks (non-text) |
| `--ink` | `#1f3fbf` | `#7c97ff` | `#a9bdf5` | Commands, links, focus ring |
| `--redline` | `#c8321e` | `#ff7a62` | `#ff9b4a` | Flags, broken references, errors |
| `--shade` | `#1e262e` | `#000000` | `#000000` | Shadow tone |

Shadows are dark in every theme. The dark themes use a black shade because a light shadow reads as glow on a dark sheet.

Text colour pairs were checked by hand from these hex values. The lowest computed pair, light `--redline` on `--sheet`, is 4.71:1, above the WCAG AA text minimum of 4.5:1. No automated test checks contrast.

### 1.4 Typography

- **Serif (IBM Plex Serif):** document text, headings, and UI labels. Weights 400 and 600, with italics.
- **Mono (IBM Plex Mono):** addresses, commands, logs, and the command line. Weights 400 and 500. Flag labels use 500.
- Both families are bundled from the `@fontsource` npm packages and loaded in `packages/web/src/main.tsx`. The app makes no request to Google Fonts.
- Type scale: a perfect fourth (1.333) from a 16px base, in rem units. Document body is 18px.
- Line height: 1.67 for body text, 1.4 for UI text, and 1.15 for tight display text. Document measure is 68 characters.

## 2. Layout

The layout is one full-viewport column (`100dvh`): the status line on top, then two tracks.

- **Tracks.** A fixed grid of 5 parts to 3. There is no draggable splitter.
- **Document Track (left).** A header with the node count (`N nodes`), a scrolling document body, and a footer (`HiddenFooter`) that says what the current view hides. When a § reference is opened, a split pane (`CoordinateSplitPane`) appears below the document at roughly 3:1.
- **System Track (right).** Three parts from top to bottom:
  1. The command line (`CommandLine`), placeholder `Type / for commands`.
  2. System.Tool, the editable command pad. It takes at most 42% of the track height.
  3. System.Log, the append-only output. It takes the remaining height.
- **Status line.** Plain text and chips, left to right:
  - `Augeron`. Runs `System.Veil`.
  - The document title.
  - View chips `a`, `h`, `f`, `u`, `r`. A `brief` chip for `View.Brief`.
  - A `headings to level N` note while `View.Level` is active.
  - Focus: a § button for the focused node, or `none`.
  - Scope: `selection §x`, `selection, N paragraphs` with a `clear` action, or `whole document`.
  - Theme chips: `light`, `dark`, `halloween`.
  - History: `undo N` and `redo N`.
- **Narrow screens.** Under 1024px the two tracks stack, and the command line pins to the bottom.
- **Inert.** While the entry page is open, the status line and both tracks are `inert`. The entry page and the tooltip sit outside that region.
- **No menus.** There are no icon toolbars, dropdowns, sidebars, settings panels, or confirmation dialogs. The entry page is the one overlay allowed by `product.md` rule 1 (section 5.3).

## 3. Components

| File | Purpose |
| --- | --- |
| `App.tsx` | Shell. Single-key shortcuts, inert handling, and the entry page. |
| `TrackLayout.tsx` | The two-track grid. |
| `StatusLine.tsx` | Status line: view chips, focus, scope, themes, history. |
| `ViewChip.tsx` | A status-line chip that runs its command. |
| `NlsDocumentPane.tsx` | The document sheet: nodes, folds, flags, selection. |
| `BriefView.tsx` | Layout for `View.Brief`. |
| `HiddenFooter.tsx` | States what the current view hides. |
| `CoordinateSplitPane.tsx` | The pane pinned to one § address. |
| `MarkdownBlock.tsx` | Renders paragraph Markdown. |
| `RedlineCallout.tsx` | A flag label with its reason and a leader line. |
| `OberonTextRenderer.tsx` | Finds live command tokens and § references in text. |
| `CommandToken.tsx` | One live command button. |
| `CommandLine.tsx` | The command input, with slash-command expansion. |
| `SystemToolPane.tsx` | System.Tool, the command pad. |
| `SystemLogPane.tsx` | System.Log, the output stream. |
| `LogEntry.tsx` | One log entry, expandable. |
| `ThresholdVeil.tsx` | The entry page. |
| `ObsidianTooltip.tsx` | The shared tooltip for `data-tip` elements. |
| `motion.ts` | Reduced-motion check. |
| `usePaneNudge.ts` | The short hint shown in a pane for 2.6 seconds. |
| `state/useWorkbenchStore.ts` | Store, command dispatch, storage, theme, and veil state. |
| `state/slashCommands.ts` | Parses and expands slash commands. |
| `audio/soundscape.ts` | Optional sound cues, off by default. |

## 4. Interaction

### 4.1 Keys

- `a`, `h`, `f`, `u`, `r`: switch the view (`View.Spec(key)`). These keys do nothing while the user types in a field, while Ctrl, Cmd, or Alt is held, or while the entry page is open.
- `/`: focus the command line.
- `Escape`: clear the selection.
- Command line: `Enter` runs the line. `Escape` clears it.
- System.Tool: `Escape` leaves the editor. `Ctrl/Cmd+Enter` runs the line at the cursor. Plain `Enter` adds a new line.
- Live token: `Enter` runs it.
- Log entry heading: `Enter` or `Space` expands it.
- Document node row: `Enter` or `Space` selects it.

### 4.2 Mouse

- **Middle-click or Ctrl/Cmd-click** runs a live token. Middle-click cancels the browser's auto-scroll.
- **Plain click** runs a token only where that token is marked to run on click: entry page specimens, empty-document prompts, `Edit.Source`, `Edit.Done`, and `Spec.Audit` in an empty log. Anywhere else, the pad or log shows a hint: `To run X, middle-click it or Ctrl/Cmd-click it.`
- **In the document,** a plain click selects that paragraph. Clicking the only selected paragraph clears the selection.
- **A § reference** opens that node in the split pane.
- **Ctrl/Cmd-click on a flag** runs `Link.Back` for that coordinate.

### 4.3 Selection and Scope

- Dragging across rows, or extending a selection with Shift+arrow keys, selects each row the text range touches. It never selects ancestor headings, because each row is tested on its own.
- The scope shows in the status line.
- `Spec.Tighten` and `Outline.ExtractTasks` act on the selection when one exists. Otherwise they act on the whole document.
- `Spec.Audit` and `Cite.Verify` always check the whole document.

### 4.4 Slash Commands

The command line expands slash names into canonical commands. The expansion is shown inline. The log always records the canonical command.

| Input | Expands to |
| --- | --- |
| `/audit`, `/ledger`, `/tighten` | `Spec.Audit`, `Spec.Ledger`, `Spec.Tighten` |
| `/undo`, `/redo` | `System.Undo`, `System.Redo` |
| `/brief [n]` | `View.Brief(n)`, with `n` defaulting to 2 |
| `/view a\|h\|f\|u\|r` | `View.Spec(x)` |
| `/find text` | `Find.Look(text)` |
| `/backlinks §x`, `/explain §x` | `Link.Back(§x)` |
| `/help [token]` | `Help.Show` or `Help.Show(token)` |

Names are case-insensitive. An unknown name logs `No command named /x.` and offers the three closest names as buttons. Choosing one replaces the input.

There is no popup autocomplete. That would be a menu, which the product rules forbid.

## 5. Motion, Sound, and the Entry Page

### 5.1 Motion

| Effect | Trigger | Duration |
| --- | --- | --- |
| Undo and redo fade | `System.Undo`, `System.Redo` | 160 ms |
| View change fold | `View.Spec`, `View.Level` | 280 ms |
| Flag drop-in | `Spec.Audit` | 530 ms each, 30 ms apart, at most 12 staggered |
| Leader line | `Spec.Audit` | 280 ms, starting at 180 ms |
| Section outline | Split pane opens | 1060 ms |
| Tooltip | Hover | 260 ms delay |

There is no pulse or beam overlay. The earlier `PulseOverlay` was removed in `f4d5428`. Feedback comes from the log, the flags, and the leader lines.

### 5.2 Reduced Motion

Reduced motion works in three places:

- The duration tokens drop to 0 ms (`tokens.css`).
- A global rule sets animation and transition durations to 0 (`index.css`).
- `prefersReducedMotion()` in `motion.ts` skips the view-change fold and starts the entry page on its last frame.

The `Spec.Audit` flag stagger has no JavaScript check. The global rule above ends it at once.

### 5.3 Entry Page

The entry page covers the workbench once per browser session. Its state is kept in `sessionStorage` under `augeron.veil.seen`.

- **Load sequence:** about 2.4 seconds. Grid rules draw, a specimen paragraph appears, its § address stamps in, `/audit` types into a command line, and a redline callout lands.
- **Skip:** any key during the sequence jumps to the final frame.
- **Close:** after the sequence, `Enter`, `Escape`, or the "Open the workbench" button closes it. `Exhume.Workbench` closes it too.
- **Specimens:** three buttons run `Doc.Load(rfc)`, `Doc.Load(brief)`, and `Doc.Load(prd)`.
- **Reopen:** `System.Veil` or the status-line `Augeron` button reopens it.
- **Dialog semantics:** `role="dialog"` with `aria-modal="true"`. The workbench is `inert` behind it.

This entry page is the one allowed overlay in `product.md` §1.

### 5.4 Sound

- Sound is off by default. `Audio.On` and `Audio.Off` turn it on and off.
- A run plays at most one cue:
  - A bell after `Spec.Audit` or `Doc.InjectFlaw` finds a `[CONTRADICTION]`.
  - A chime after `Spec.Tighten`.
  - A whoosh after `View.Spec`.
- Sound cues play whether or not reduced motion is set. Reduced motion covers motion only.

## 6. Accessibility

Checked in the code, not in a test run:

- The entry page has `role="dialog"`, `aria-modal="true"`, and a label and description. Focus moves to its button when it opens. The code has no focus trap. Focus stays out of the workbench because the workbench is `inert`.
- The focus ring is 4px wide at 50% of `--ink`, with a 1px offset.
- The command hint has `role="status"`. The log has `role="log"`. Pad errors have `role="alert"`. View chips use `aria-pressed`.
- Flags carry text labels. Colour is not the only signal.

## 7. Known Gaps

- `packages/web` has no test script, so no automated UI tests run in CI.
- No automated test checks colour contrast.
- `tokens.css` cites `docs/frontend/brief.md` and `docs/frontend/report.md`. Those files are in the gitignored `docs/` folder and are not in the repository.
