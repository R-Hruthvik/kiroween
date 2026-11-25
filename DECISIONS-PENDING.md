# Decisions pending (owner)

Saved 2026-11-24. The owner paused reading the 2026-11-24 report and will answer these later. Remind the owner before starting new build work.

## Unread reports

- `docs/research/2026-11-24-oberon-in-practice.md` (how Oberon worked, what Augeron lacks)
- `docs/research/2026-11-23-nls-in-practice.md` (how NLS/AUGMENT was used, from 1978-1991 manuals)
- `docs/research/2026-11-23-nls-usecase-scope.md` (use cases by scale, 11 tool texts, gaps)

## Open questions

1. Remove the remaining glow and ghost `§` glyphs from `packages/web/src/haunted.css` and the landing page? The product rules forbid them.
2. Load the sample RFC by default instead of the KEP template?
3. Review marks: keep plain click, or require Ctrl-click like other commands?
4. Phase 5: may `AI.Accept` be the command that changes the document? (Undoable, offline fallback kept.)
5. Cross-file address syntax for the canvas: `doc§3.1a`, or another form?
6. New: slash commands on the surface (`/audit`, `/explainThis`) that expand to the canonical `Module.Action` commands underneath. See "Slash commands" below.

## Slash commands (owner idea, 2026-11-24)

- The user types `/audit` or `/brief`. The pad expands it to the real command (`Spec.Audit`, `View.Brief(2)`) on the line, the way NLS expanded `cs` to "Copy Statement" on its feedback line. The log always records the real command.
- An unknown slash command such as `/explainThis` goes to the resolver: first an exact alias, then a fixed phrase list (offline), then optional AI. The AI may only pick or chain registered commands, and shows the plan before running.
- Open points: no popup autocomplete (that is a menu, banned by product rule 1); show the expansion inline instead. Slash commands are a new surface on top of the existing grammar, so INV-4 still applies to the expanded form.

## UI/UX

Old UI plans were removed on 2026-11-24. A new UI/UX design starts once the owner provides the skills or plugins to use. The hero page (ThresholdVeil) stays.

New research to read: `docs/research/2026-11-24-slash-commands-scope.md` and `docs/research/2026-11-24-scale-and-users.md`.
