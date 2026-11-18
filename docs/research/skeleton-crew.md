# Skeleton Crew — candidate topic research for Kiroween 2026

Researched 18 November 2026. All web access through one real browser tab (Devpost search, the
Kiroween Devpost site, GitHub repository search). No curl, no fetch tool, no headless scraper.

Companion docs: `docs/research/resurrection.md`, `docs/research/frankenstein.md`.
Read all three before committing a category.

---

## 0. Contest reality check (verified this session)

| Fact | Value | Source |
|---|---|---|
| Site | `https://kiroween.devpost.com/` | loaded |
| Deadline | Dec 5 2026, 03:30 GMT+5:30 (Dec 4, 2:00pm PT); site showed "17 more days" | site |
| Category text | "Build a skeleton code template lean enough to be clear but flexible enough to support various use cases. Show us its versatility with two distinct applications from your foundation." | `/rules` |
| Repo rule | "For Skeleton Crew projects only: Your repo must contain 2 separate repo folders for the 2 separate applications." | `/rules` |
| Kiro rule | `/.kiro` at repo root, not gitignored; "insufficient use of Kiro" = disqualification | `/rules` |
| Team size | max 3 participants | `/rules` |
| Judging | Impact 20%, Technological Implementation 20%, Design 20%, Innovation 20%, Presentation 20% | `/rules` |
| Project gallery | **still unpublished** — no authoritative submission list | `/project-gallery` |

### Method limits (read before trusting any number)

- Devpost search is fuzzy: it OR-matches words and searches taglines too. A query for `pdf`
  returns 21,885 "results" across every hackathon ever. Counts measure **corpus noise**, not
  competitor count. Use them only to compare one term against another.
- The Kiroween 2026 gallery is unpublished, so this-year entries were found by searching `kiro`
  and reading taglines. Entries posted late will be missed. Treat the list in §2 as a sample,
  not a census.
- GitHub search counts were read from the logged-out search page; numbers move daily.

---

## 1. Crowding sweep (as run)

Query template: `https://devpost.com/software/search?query=TERM`, first 8 titles captured.
"Low-noise" = the term is specific enough that most hits are actually about it.

| Term | Total hits | Crowding read | Notable first-page hits |
|---|---|---|---|
| skeleton crew | 74 | **high for this category specifically** | MicroAgent, Skeleton kit, Bone Kit, Skeleton Crew (agent safety), Skeleton Crew (vanilla web), SpecGuard-Crew, GhostStack, OrigamiVerse, RunSkeleton, SpecterStack |
| boilerplate | 2,286 | saturated, generic | resmgr-kit ("25-line spec → tested QNX resource manager") |
| starter kit | 741 | saturated, generic | — (search noise dominates) |
| template | 11,689 | saturated | MicroAgent, Skeleton kit, resmgr-kit |
| scaffold | 1,442 | saturated | MicroAgent, resfuzz |
| generator | 14,567 | saturated, meaningless | — |
| hooks | 6,723 | noisy | Blackout, Skeleton Core |
| spec-driven | 11,450 | noisy, but on-theme | MicroAgent, Blackout, Skeleton Core, SpecGuard-Crew |
| agent template | 2,544 | crowded within AI-agent framing | MicroAgent, Skeleton kit, FrontDesk |
| mcp server | 9,184 | crowded as a feature, rare as a product | Kiro's Haunted House, GhostBBS |
| plugin kit | 235 | **low-noise, underused** | Bone Kit |
| sdk | 25,796 | meaningless | — |
| cli tool | 7,962 | noisy | resmgr-kit, NetGraph |
| tui | 369 | **low-noise, underused** | Dolos, blind-analyst, PayPal Pulse |
| dashboard kit | 1,644 | medium | mostly Jira apps |
| crud | 2,172 | medium | — |
| local-first | 82,666 (fuzzy) | **taken this year** | Bone Kit, GhostBBS, StallSmart |
| visual novel | 1,478 | medium | The Oracle, Orator's Tale |
| save system | 17,226 (fuzzy) | not measurable via Devpost | — |
| replay | 7,163 | noisy | Stitched Blackbox, DeltaX QNX Trace |
| synth | 1,711 | low-noise | Neon Band, Monster Puppet Theater |
| pdf | 21,885 (fuzzy) | not measurable via Devpost | PaperPatch |
| state machine | 13,307 (fuzzy) | not measurable via Devpost | MicroAgent |

**Not run** (load cap ~30): chart kit, form kit, auth kit, offline-first, crdt, sync engine,
wasm, webgpu, on-device, edge, serverless, cron, scraper, crawler, ocr, docx, spreadsheet,
email, newsletter, blog engine, static site, game engine, physics, raycasting, tilemap, roguelike,
dialogue, inventory, economy, networking, lobby, matchmaking, telemetry, analytics, feature flags,
ab testing, i18n, a11y, design system, chart, map, timeline, calendar, kanban, notes, journal,
habit. Any claim about those below is marked **unverified**.

### GitHub competition check (measured this session)

| Query | Repos | Top result | Read |
|---|---|---|---|
| `dialogue graph editor` | 69 | etodd/dialogger, 357 stars, last push 2016 | small field, stale leaders |
| `deterministic replay debugger` | 100 | facebookexperimental/hermit, 1.4k stars | niche is real but thin |
| `web audio synth starter` | 0 | none | **no template exists** — open lane |

---

## 2. What the Kiroween 2026 cohort is already doing (skeleton-shaped sample)

Found by searching `kiro` (3 pages) and `skeleton crew`. Marked from taglines.

| Entry | Shape | Overlap risk |
|---|---|---|
| Bone Kit (Mandi Ghost + Séance Board) | local-first web skeleton; offline market prices + P2P notice board | **highest** — local-first, 2 apps, hook story |
| Skeleton kit | game kit; every level proved finishable; "any AI tool can play" | high — games + provable invariants |
| Skeleton Core | lean TypeScript skeleton; REST API + CLI share one core | high — dev-tool skeleton |
| MicroAgent | event-driven agent scaffold; schema validator + incident bot | high — agent domain, dual app |
| SpecGuard-Crew | Kiro Crew verification skeleton; code security auditor + clinical verifier | high — verification + PBT framing |
| OrigamiVerse | Godot origami core; 3D puzzle + crease-pattern studio | medium — engine + 2 apps, different media |
| RunSkeleton | governed AI-experiment runs; hash-chained ledger, gate verdicts | medium — ledger/replay overlap |
| GhostStack | headless microservice scaffold, self-healing cloud APIs | medium — backend shape, cost risk |
| SpecterStack | AWS stack from specs; web + PWA with MFA, IAM policy agent | medium — spec→stack generator |
| resmgr-kit | 25-line spec → tested QNX 8.0 resource manager | medium — one-spec-one-capability, niche OS |
| Skeleton Crew (vanilla) | vanilla HTML/CSS/JS skeleton, no build step | medium — "no framework" is a crowded pitch |
| Skeleton Crew (agent safety) | policy-checked tool-call harness | low — different meaning of the name |
| Patchwork / Patchwork | offline static 4-tool page; git-history warning tool | low — name collision only |
| HyperCard kits | Stackyard ×2, AfterStack, 1BitCards | category-wide, not skeleton-specific |

**Consequence:** "template + two apps" is the default entry, not a differentiator. At least 6
teams have already shipped it. Two axes remain open:

1. **A hook that generates a complete new capability from one spec line, shown live.** Almost every
   entry *uses* hooks for tests or formatting. None found advertises "type one line, get a vertical
   slice" as the demo beat. This is the 20% Technological Implementation score, and it is the only
   part of the 2025 InteractionKit pattern nobody has copied.
2. **A domain nobody picked.** Local-first web apps, game kits, TypeScript API/CLI, agent scaffolds,
   verification harnesses and HyperCard are taken.

---

## 3. The shape that wins (thesis for all candidates below)

```
skeleton/            # the lean core: model + runtime + test harness + one reference capability
apps/graveyard/      # app 1, distinct UI and domain
apps/parlour/        # app 2, same core, different domain
.kiro/hooks/         # add-<capability>.kiro.hook  -> scaffolds capability end to end
.kiro/specs/         # one spec per capability, written as a template
.kiro/steering/      # the rules that keep generated code inside the skeleton's shape
tests/               # property-based invariants over the core
```

The hook must produce, from a one-line spec: schema/type, runtime handler, UI surface, fixture,
PBT property, and a docs row. That is the thing judges can *watch*. Everything else is table stakes.

Two apps must differ in **domain and UI**, not in colour. Ideal pairing: one consumer-facing,
one operator-facing.

---

## 4. Candidates (16, ranked)

Legend: **Top 5** = worth building. Complexity is for a 3-person team in 16 days.

### 1. Replay Kit — deterministic session replay and time travel  ★ Top 5

- **Pitch:** Record every user action as a typed event; replay any session frame-exact, then step backwards through it.
- **Skeleton standardises:** event envelope (id, ts, actor, payload), seeded clock, deterministic reducer, snapshot/restore, timeline scrubber, replay assertion harness.
- **Apps:** (a) *Grave Recorder* — a canvas incident-notes board where a support engineer replays a bug report; (b) *Night Shift* — a multi-step intake form where replay reconstructs exactly what the applicant saw, including validation states.
- **Hook story:** `.kiro/hooks/add-event-type.kiro.hook`. One line: "add event `tombstone-moved` with x, y, rotation" → hook writes the event type, reducer branch, timeline lane colour, a fixture, and a PBT property that replay after snapshot equals replay from zero. Third capability added live in the demo.
- **Audience:** every dev who has shipped undo, audit logs, or "cannot reproduce". rrweb-class tools are widely starred (**unverified** — not measured this session).
- **3-min demo:** record a 20-second session → corrupt localStorage → replay to the exact frame → drag the scrubber backwards → run the hook → new event type appears in the timeline → both apps use it.
- **Kiro fit:** excellent. Specs per event family, steering for determinism rules, hook, PBT, MCP optional (replay server).
- **Complexity:** medium. No backend. The hard part is determinism: no `Date.now`, no `Math.random`, no async reordering outside the event log.
- **Crowding:** `replay` 7,163 global hits but few products; GitHub `deterministic replay debugger` only 100 repos, top 1.4k stars. Kiroween has Stitched Blackbox (QNX audit/replay) — different platform, same word. **Medium risk.**
- **Biggest failure risk:** one `setTimeout` outside the log and replay desyncs on stage. Mitigate: all nondeterminism behind a seed + clock module, and a PBT that fails loudly.

### 2. Choice Kit — branching narrative skeleton  ★ Top 5

- **Pitch:** A dialogue/choice graph core with flags, gates and saves, proved consistent by property tests, raised into two stories.
- **Skeleton standardises:** node/edge graph, typed flags, gate predicates, typewriter runtime, save slots, back-history, keyboard/screen-reader traversal, graph validator.
- **Apps:** (a) *The Reading Room* — a haunted-house murder mystery with three endings; (b) *Debt Collector* — a merchant haggling sim where the same engine runs a price negotiation tree with numeric state.
- **Hook story:** `.kiro/hooks/add-gate.kiro.hook`. One line: "add gate `requires-lantern-lit`" → hook writes the predicate, editor picker entry, runtime branch, unreachable-node test, and a fixture. Live beat: add a gate, watch the validator reject an ending that becomes unreachable, then fix it on camera.
- **Audience:** indie VN and game writers; Ink/inklesque tools are used widely (**unverified**). GitHub `dialogue graph editor` = 69 repos, top result 357 stars and last pushed 2016 — stale field.
- **3-min demo:** play 40 seconds of app 1 → jump to app 2, same graph format, totally different skin and rules → add a gate via hook → validator catches a broken ending → both apps still pass.
- **Kiro fit:** strong. Graph model spec, steering for narrative grammar and house style, hook for gates/nodes, PBT: reachability, no dead ends, no flag read before write, save round-trip.
- **Complexity:** medium. Content is the cost; keep app 1 to ~40 nodes, app 2 to ~25. CSS/SVG art only.
- **Crowding:** visual novel 1,478 global; Kiroween already has a dating sim ("Kiro: Love Is Out of Scope") and a text adventure or two. Judged as a *kit* with a validator, it is still distinct — but a third VN-flavoured entry needs the tooling story front and centre.
- **Biggest failure risk:** the demo looks like a game, not a skeleton. Show the graph and the failing property first.

### 3. Voice Kit — synthesizer/audio skeleton  ★ Top 5

- **Pitch:** One audio-voice skeleton (oscillator graph, envelope, sequencer, transport, offline render tests) that becomes a haunted music box and a rhythm ritual.
- **Skeleton standardises:** voice graph DSL, ADSR, filter, effects chain, step sequencer, tempo clock, patch format, `OfflineAudioContext` render harness, gain-safety test.
- **Apps:** (a) *Music Box* — compose and share 16-step lullabies with 6 voices; (b) *Séance Rhythm* — a call-and-response memory game driven by the same sequencer, scored on timing.
- **Hook story:** `.kiro/hooks/add-voice.kiro.hook`. One line: "add a glass-harmonica voice, sine + 3 partials, slow attack, tape echo" → hook writes the patch JSON, graph builder, knob panel, preset, and a rendered-audio regression test with a peak-ceiling assertion. Demo: add a voice, it appears in both apps.
- **Audience:** creative coders and game audio devs. GitHub `web audio synth starter` returns **0 repos** — no template occupies this lane.
- **3-min demo:** audible. Play app 1, switch to app 2, same patch file, different interaction → run hook → new instrument audible in both → show the render test and gain ceiling.
- **Kiro fit:** strong and unusual — hook generates DSP wiring plus a numeric test, which is exactly the "thoughtful strategy" the rubric rewards.
- **Complexity:** medium-high. Autoplay policies, click-free envelopes, and mobile audio unlock eat a day each.
- **Crowding:** `synth` 1,711 global, low-noise; Kiroween has Neon Band and Monster Puppet Theater (both playable instruments, neither a kit). **Low crowding, highest novelty.**
- **Biggest failure risk:** judges watch muted, and audio bugs are humiliating on a live demo. Mitigate: waveform/spectrum visuals, pre-rendered fallback stems, and a scripted demo that never depends on live audio device state.

### 4. Forge Kit — document/print skeleton  ★ Top 5

- **Pitch:** A paginated document core (A4 + receipt + certificate) where content is data and layout is a spec; two apps print real paperwork.
- **Skeleton standardises:** doc model (sections, rows, totals), page/overflow engine, print CSS, PDF export, number-to-words and currency formatting, layout invariant tests.
- **Apps:** (a) *Ledger Ghost* — freelance invoices with GST-style tax rows, due dates, payment status; (b) *Certificate of Haunting* — event certificates with QR verification and bulk generation from CSV.
- **Hook story:** `.kiro/hooks/add-document.kiro.hook`. One line: "add a delivery-note document with line items, batch numbers and a signature block" → hook writes the doc schema, template, print stylesheet, sample data, and a PBT that no block overflows its page box. Live: add a third document type in under a minute.
- **Audience:** freelancers and small shops in India who need invoices, receipts, and certificates; a real, paying, non-hackathon audience. (**unverified** sizing.)
- **3-min demo:** show data → preview → print dialog → change paper size, layout still holds → run hook → new document type renders → export PDF.
- **Kiro fit:** good. Layout invariants are genuine PBT; steering holds typographic rules; hook is a natural "new document type" generator.
- **Complexity:** low-medium. pdf-lib or browser print; no backend; assets are the only cost.
- **Crowding:** `pdf` too fuzzy to measure on Devpost (21,885). Kiroween has PaperPatch (Word diffing) and Dockside (delivery-note checking) — adjacent, not the same. **Medium.**
- **Biggest failure risk:** "another invoice generator" reads as low-innovation unless the layout engine and invariant tests carry the pitch. Also print rendering differs per browser — demo in one browser only.

### 5. Cadence Kit — recurrence/scheduling skeleton  ★ Top 5

- **Pitch:** A recurrence engine with a rules DSL, timezone-safe expansion and conflict detection, driving a clinic booker and a shift roster.
- **Skeleton standardises:** recurrence rule model, expansion to occurrences, DST/timezone handling, exception dates, conflict/overlap detection, capacity rules, calendar UI primitives, invariant tests.
- **Apps:** (a) *Clinic Hours* — patient slot booking with recurring doctor availability; (b) *Night Roster* — shift rotation for a small team with fairness constraints and swap requests.
- **Hook story:** `.kiro/hooks/add-rule.kiro.hook`. One line: "add rule `every-other-tuesday-except-holidays`" → hook writes parser branch, expansion, exception handling, UI chip, and properties: expansion is sorted, finite, idempotent, and count matches a closed-form check.
- **Audience:** anyone building booking, rosters, or reminders; RRULE is a notorious source of bugs (**unverified**).
- **3-min demo:** set a schedule → cross a DST boundary and a holiday → both apps recompute → run hook → new rule type appears in both → show property tests catching an overlap.
- **Kiro fit:** very strong on PBT and steering; weaker on visual flash.
- **Complexity:** medium. No backend. Timezone edge cases are the whole job.
- **Crowding:** `calendar`/`scheduler` queries not run (**unverified**). Judged as a rule engine rather than a calendar app, the lane looks open; Kiroween sample showed no scheduling kit.
- **Biggest failure risk:** looks like a CRUD calendar in the video. Lead with the property tests and the DST/overlap proof, not the grid.

### 6. Intake Kit — form/wizard skeleton

- **Pitch:** A step-machine form core with resumable drafts, conditional steps and server-free validation; two intake apps.
- **Skeleton standardises:** step state machine, field schema, conditional visibility, draft persistence, validation summary, a11y error wiring, submission envelope.
- **Apps:** (a) *Claim of Loss* — insurance claim with photo evidence checklist; (b) *Ward Intake* — clinic pre-registration with triage questions.
- **Hook story:** add-step hook: "add step `medication-history`, required if age > 65, three repeating rows" → scaffolds step, schema, conditional rule, a11y labels, and a reachability PBT.
- **Audience:** every internal-tools dev. **Crowding:** `form kit` not measured (**unverified**); generic form builders are plentiful.
- **Demo:** complete a claim, kill the tab, resume; add a step live; both apps.
- **Risk:** low innovation score; judges have seen a thousand form builders.

### 7. Undo Kit — command/inverse skeleton

- **Pitch:** Every mutation is a command with a proven inverse; unlimited undo/redo with branching history.
- **Skeleton standardises:** command envelope, inverse pairs, history tree, transaction grouping, persistence.
- **Apps:** (a) pixel/sprite editor; (b) outline/notes editor with structural moves.
- **Hook story:** add-command hook: "add command `recolor-palette`, inverse restores previous palette" → scaffolds do/undo, history entry, and the `undo(do(s)) == s` property.
- **Audience:** devs building editors. **Crowding:** narrow; `undo` not searched (**unverified**).
- **Demo:** 50 edits, undo 50, redo 20, branch, add a command live.
- **Risk:** small surface for a 20%-impact story; two apps look similar.

### 8. Loom Kit — state machine/workflow skeleton

- **Pitch:** A typed state machine core with guards, side effects and deadlock proofs; order fulfilment and approval workflows.
- **Skeleton standardises:** states, transitions, guards, effects, timers, persistence, visualiser.
- **Apps:** (a) *Mortuary Orders* — order lifecycle with cancellations and refunds; (b) *Sign-off* — document approval with reviewers and escalations.
- **Hook story:** add-state hook: "add state `awaiting-cremation-permit` guarded by permitUploaded" → scaffolds transition table entry, guard, UI badge, and unreachable-state/deadlock PBT.
- **Audience:** backend and product devs. **Crowding:** common shape, but rarely shipped as a kit.
- **Demo:** drive an order to a deadlock, let the property test catch it, add the missing transition live.
- **Risk:** B2B-flavoured, low emotional pull; design score hard to max.

### 9. Console Kit — TUI skeleton

- **Pitch:** A terminal UI skeleton (panels, keymaps, command palette, themes) that becomes a log explorer and an incident console.
- **Skeleton standardises:** layout tree, focus model, keymap registry, virtualised list, theme tokens, snapshot tests.
- **Apps:** (a) *Autopsy* — log explorer with filters and timeline; (b) *Nightwatch* — on-call incident console with runbooks.
- **Hook story:** add-screen hook: "add screen `heap-dump` with a tree pane and a detail pane" → scaffolds route, panes, keybindings, and a rendered-snapshot test.
- **Audience:** devs, strong star potential. **Crowding:** `tui` 369 global hits, low-noise, underused. Kiroween has few terminal entries.
- **Demo:** terminal recording, split panes, live hook adding a screen.
- **Risk:** design score suffers in a 1024-wide video; terminal aesthetics read as "not designed" to some judges.

### 10. Sentinel Kit — accessibility audit skeleton

- **Pitch:** A rule-pack skeleton for a11y checks; each rule is a spec, proved against fixtures, shipped as extension and CI.
- **Skeleton standardises:** DOM probe API, rule contract (id, severity, fixture pair, fix hint), report model, rule registry.
- **Apps:** (a) browser extension review mode; (b) CI CLI producing a report artifact.
- **Hook story:** add-rule hook: "add rule `focus-visible-missing` for buttons and links" → scaffolds probe, rule, pass/fail fixtures, and a no-false-positive PBT.
- **Audience:** large and real (a11y compliance). **Crowding:** high against axe-core; `a11y` query not run (**unverified**).
- **Demo:** run on a broken page, add a rule live, show it catching a new class of bug in both surfaces.
- **Risk:** credibility — a shallow rule engine invites "axe already does this"; false positives destroy trust.

### 11. Formula Kit — spreadsheet expression skeleton

- **Pitch:** A parser/evaluator skeleton with dependency graph, cycle detection and recalculation; budget sheet and grade book.
- **Skeleton standardises:** tokenizer, Pratt parser, evaluator, cell graph, recalc order, error values, undoable edits.
- **Apps:** (a) *Household Ledger*; (b) *Marks & Moderation* with weighted grade formulas.
- **Hook story:** add-function hook: "add `PMT(rate, nper, pv)`" → scaffolds parser entry, arity check, implementation, doc row, and round-trip/eval PBT.
- **Audience:** devs who fear Excel logic. **Crowding:** `spreadsheet` not run (**unverified**); Kiroween has FrankenSheet (spreadsheet with git), SheetSynth, Harmoglyph — the spreadsheet surface is getting busy.
- **Demo:** type formulas, show cycle detection, add a function live, use it in both apps.
- **Risk:** "spreadsheet" is now a crowded Kiroween theme; parsing bugs are easy to hit live.

### 12. Vault Kit — save/migration skeleton

- **Pitch:** Versioned save files with migration chains, integrity checks and corruption recovery; two games share it.
- **Skeleton standardises:** save envelope, schema versions, migration registry, checksum, slot manager, import/export.
- **Apps:** (a) roguelike run-save with mid-run resume; (b) farming/management sim with long-lived world state.
- **Hook story:** add-migration hook: "migrate v3→v4, rename `gold` to `coin`, default `reputation` to 0" → scaffolds migration, fixture saves at v3, and round-trip/idempotence PBT.
- **Audience:** game devs. **Crowding:** `save system` unmeasurable on Devpost; the pattern is common in engines but rare as a kit.
- **Demo:** load a 2-year-old save, migrate, corrupt a byte, recover, add migration live.
- **Risk:** narrow perceived scope; two games in 16 days is a lot of content for one mechanic.

### 13. Wire Kit — protocol/netcode skeleton

- **Pitch:** A message-framing skeleton with typed packets, versioning and deterministic simulation; two networked toys.
- **Skeleton standardises:** packet schema, framing, serializer, ack/retry, intent log, lockstep tick, desync detector.
- **Apps:** (a) *Two-player séance board* — shared pointer and planchette over BroadcastChannel/WebRTC; (b) *Duel of Wits* — turn-based card game with reconnect.
- **Hook story:** add-packet hook: "add packet `planchette-nudge` with dx, dy, seq" → scaffolds schema, codec, handler, fuzz test, and framing round-trip PBT.
- **Audience:** devs building multiplayer. **Crowding:** `networking`/`lobby` not run (**unverified**); networking is a common hackathon demo.
- **Demo:** two browser windows, drop one, reconnect, replay intents, add a packet live.
- **Risk:** WebRTC signalling needs a server or manual copy-paste; "no backend" is hard to keep honest.

### 14. Barter Kit — inventory/economy skeleton

- **Pitch:** Item, stock and trade core with conservation invariants; a potion shop and a scavenger run.
- **Skeleton standardises:** item registry, stacks, crafting recipes, price model, transaction log, conservation checks.
- **Apps:** (a) *Potion Shop* — buy/sell/craft with supply and demand; (b) *Scavenger's Ledger* — run-based loot with weight limits.
- **Hook story:** add-item hook: "add `grave-dirt`, weight 0.2, tags: reagent, base value 3" → scaffolds registry entry, sprite placeholder, recipe slot, and inventory PBT.
- **Audience:** game devs. **Crowding:** common in tutorials, rare as a kit; `inventory` not run (**unverified**).
- **Demo:** trade in one app, see conservation hold, add an item live, use it in both.
- **Risk:** "economy" demos are hard to make legible in 3 minutes; numbers on screen are boring.

### 15. Chart Kit — visualisation skeleton

- **Pitch:** A chart core with scales, axes and accessible tables; a finance dashboard and a public-health report.
- **Skeleton standardises:** scale/axis math, series model, tooltip/a11y layer, responsive sizing, empty/error states.
- **Apps:** (a) *Crypto Graveyard* — token post-mortems; (b) *Outbreak Ledger* — weekly case counts.
- **Hook story:** add-chart hook: "add `ridgeline` chart for distribution series" → scaffolds geometry, legend, table fallback, and scale-domain PBT.
- **Audience:** devs, but the space is owned by established libraries. **Crowding:** `chart kit` not run (**unverified**); Kiroween already has Crypto Graveyard as an app.
- **Demo:** data → chart → toggle table view → add a chart type live.
- **Risk:** innovation score low; judged against D3/Recharts.

### 16. Patch Kit — crawler/extraction skeleton

- **Pitch:** A declarative extraction skeleton (selector recipes, fixture snapshots, drift detection) for two monitors.
- **Skeleton standardises:** recipe schema, fetch/parse pipeline, fixture replay, drift alerts, rate limiting.
- **Apps:** (a) *Tender Watch* — public procurement notices; (b) *Shelf Watch* — local shop price changes.
- **Hook story:** add-source hook: "watch `example.gov/tenders`, fields: title, value, deadline" → scaffolds recipe, fixture, parser tests.
- **Audience:** real (procurement, price monitoring). **Crowding:** `scraper`/`crawler` not run (**unverified**).
- **Demo:** show a fixture, show drift detection, add a source live.
- **Risk:** ToS/robots and live-site fragility violate the "runs consistently" rule; a demo that depends on a third-party site is a disqualification risk.

---

## 5. Ranking rationale

| Rank | Candidate | Impact | Kiro depth | Design ceiling | Innovation | Feasibility | Total read |
|---|---|---|---|---|---|---|---|
| 1 | Replay Kit | 4 | 5 | 4 | 4 | 3 | strongest hook story + real dev pain |
| 2 | Choice Kit | 4 | 5 | 5 | 3 | 4 | best PBT fit, art risk manageable |
| 3 | Voice Kit | 3 | 5 | 5 | 5 | 3 | emptiest lane, audio risk |
| 4 | Forge Kit | 4 | 4 | 4 | 3 | 5 | safest to finish, weakest novelty |
| 5 | Cadence Kit | 4 | 5 | 3 | 4 | 4 | best tests, weakest demo |
| 6 | Intake Kit | 4 | 4 | 4 | 2 | 5 | safe, forgettable |
| 7 | Undo Kit | 3 | 4 | 3 | 4 | 4 | neat idea, small surface |
| 8 | Loom Kit | 4 | 4 | 3 | 3 | 4 | solid, B2B |
| 9 | Console Kit | 3 | 4 | 3 | 4 | 4 | distinctive, design risk |
| 10 | Sentinel Kit | 5 | 4 | 4 | 3 | 2 | high impact, hard to be credible |
| 11 | Formula Kit | 3 | 4 | 3 | 4 | 3 | crowded theme this year |
| 12 | Vault Kit | 3 | 4 | 3 | 3 | 4 | narrow |
| 13 | Wire Kit | 3 | 4 | 4 | 3 | 2 | backend honesty problem |
| 14 | Barter Kit | 3 | 3 | 3 | 3 | 4 | demo legibility |
| 15 | Chart Kit | 3 | 3 | 4 | 2 | 4 | owned by libraries |
| 16 | Patch Kit | 4 | 3 | 3 | 3 | 2 | live-site fragility |

**If picking one today:** Replay Kit. It has the only hook story where the generated artefact is
*observably correct* (replay still matches after the hook runs), it needs no backend, and it does not
collide with any of the 14 skeleton-shaped entries already in this year's cohort.

**If the team is design-led:** Choice Kit. Graph editor plus two stories gives the most
screenshot-worthy surface, and the validator gives the live "hook catches a bug" beat.

**If the team wants zero competition:** Voice Kit. Zero GitHub templates, no Kiroween kit, and the
only entry in the category that judges can hear.

---

## 6. Build constraints to design around

- 16 days, 3 people max, no backend spend: anything requiring accounts, hosted DB, or paid APIs is out.
- Repo needs `/.kiro` at root plus **two separate app folders**; plan the folder split on day 1, not day 14.
- The 3-minute video must show the app running on its real device; terminal-only or muted-audio demos lose Presentation points.
- Property-based tests are the cheapest Kiro-depth evidence: every candidate above has at least one
  invariant that is one function call to express.

---

## 7. URLs actually loaded

- `https://devpost.com/software/search?query=skeleton%20crew`
- `https://devpost.com/software/search?query=boilerplate`
- `https://devpost.com/software/search?query=starter%20kit`
- `https://devpost.com/software/search?query=template`
- `https://devpost.com/software/search?query=scaffold`
- `https://devpost.com/software/search?query=generator`
- `https://devpost.com/software/search?query=hooks`
- `https://devpost.com/software/search?query=spec-driven`
- `https://devpost.com/software/search?query=agent%20template`
- `https://devpost.com/software/search?query=mcp%20server`
- `https://devpost.com/software/search?query=plugin%20kit`
- `https://devpost.com/software/search?query=sdk`
- `https://devpost.com/software/search?query=cli%20tool`
- `https://devpost.com/software/search?query=tui`
- `https://devpost.com/software/search?query=dashboard%20kit`
- `https://devpost.com/software/search?query=crud`
- `https://devpost.com/software/search?query=local-first`
- `https://devpost.com/software/search?query=visual%20novel`
- `https://devpost.com/software/search?query=save%20system`
- `https://devpost.com/software/search?query=replay`
- `https://devpost.com/software/search?query=synth`
- `https://devpost.com/software/search?query=pdf`
- `https://devpost.com/software/search?query=state%20machine`
- `https://devpost.com/software/search?query=kiro&page=1..3`
- `https://kiroween.devpost.com/`
- `https://kiroween.devpost.com/project-gallery`
- `https://kiroween.devpost.com/rules`
- `https://github.com/search?q=dialogue+graph+editor&type=repositories&s=stars&o=desc`
- `https://github.com/search?q=deterministic+replay+debugger&type=repositories&s=stars&o=desc`
- `https://github.com/search?q=web+audio+synth+starter&type=repositories&s=stars&o=desc`
- `https://kiroween-2025.devpost.com/project-gallery` (pre-existing tab, consulted for 2025 context)
