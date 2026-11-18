# Skeleton Crew — wave 2 candidate topic research for Kiroween 2026

Researched 18 Nov 2026. All web access through one real browser tab (Devpost search). Wave 1 doc:
`docs/research/skeleton-crew.md` (Replay Kit, Choice Kit, Voice Kit, Forge Kit, Cadence Kit).
This file adds 16 *different* candidates. No repeats.

Kiroween 2026 gallery still unpublished; counts are Devpost full-text (fuzzy, global), not Kiroween-scoped.

## Crowding sweep (this session)

See wave 1 for method. Notable this-session Kiroween-adjacent entries: MicroAgent (event-driven dual-app), Bone Kit (CRDT skeleton), Skeleton kit (provably-finishable game kit). Template+2-apps shape now has 7+ entries; the open beat remains "one spec line → hook scaffolds a full capability" demonstrated live.

## Candidates (ranked)

### 1. Branch Kit — decision-tree skeleton with guards and audit trail
- Pitch: a skeleton for branching logic (triage flows, onboarding wizards, approval chains) where one spec line adds a guarded branch and the hook regenerates the validator that proves no leaf is unreachable.
- What the skeleton standardises: node/edge graph, guard predicates, audit trail, save/load, validator.
- Two apps: (a) symptom triage flow; (b) onboarding wizard with conditional steps.
- Hook story: add a branch condition → hook generates the guard, the test, and the reachability proof.
- Audience: healthcare intake, HR onboarding, compliance workflows.
- Demo (3 min): show the tree, add a condition live, watch the validator flag an unreachable leaf, fix it, both apps run.
- Kiro fit: specs for node/edge schema; steering for guard semantics; hooks run PBT on reachability; MCP over a flow file.
- Complexity: medium.
- Crowding: `decision tree` 2616 global, 0 Kiroween. Open.
- Biggest risk: looks like a flowchart tool. Mitigate with the "prove no dead end" beat.
- PBT: reachability, determinism, audit completeness.

### 2. Invoice Kit — document generation with tax rows and PDF output
- Pitch: a skeleton for paginated documents (invoices, certificates, receipts) where one spec line adds a document type and the hook generates the layout, tax engine and PDF renderer.
- What the skeleton standardises: page model, layout engine, tax rows, PDF export, print CSS.
- Two apps: (a) GST invoice generator; (b) bulk certificate issuer.
- Hook story: add a document type → hook generates layout, tax rules, tests.
- Audience: freelancers, small businesses, event organisers.
- Demo: type an invoice, watch PDF render, add a tax row live, watch the total update, export.
- Kiro fit: specs for document schema; steering for tax rules; hooks run PBT on totals; MCP over a template file.
- Complexity: low-medium.
- Crowding: `invoice` 3978 global, `certificate` 3133 global, 0 Kiroween. Open.
- Biggest risk: "just an invoice tool" — needs the hook beat to carry it.
- PBT: total = sum of lines, tax = rate × base, round-trip serialise/parse.

### 3. Shift Kit — constraint-based scheduling
- Pitch: a roster skeleton where one spec line adds a constraint (no double-booking, max hours, skill match) and the hook generates the solver clause and a test.
- What the skeleton standardises: resource model, constraint solver, calendar view, conflict detection.
- Two apps: (a) clinic booking; (b) shift roster.
- Hook story: add a constraint → hook generates solver clause + test; solver proves feasibility live.
- Audience: clinics, small businesses, event staffing.
- Demo: load 20 staff, 50 shifts, watch it solve; add "no night-then-morning" live, watch conflicts appear, resolve.
- Kiro fit: specs for constraint schema; steering for solver semantics; hooks run PBT on feasibility; MCP over a roster file.
- Complexity: medium.
- Crowding: `scheduling` 11690 global, `roster` 1009 global, 0 Kiroween. Open.
- Biggest risk: solver performance on large inputs. Mitigate with a bounded demo (≤50 entities).
- PBT: feasibility, no-overlap, skill-match.

### 4. Caption Kit — live captioning with VTT and sync
- Pitch: a skeleton for live captioning (Web Speech → VTT → sync) where one spec line adds a language and the hook generates the recogniser, formatter and test.
- What the skeleton standardises: audio capture, recogniser, VTT writer, sync engine, export.
- Two apps: (a) lecture captions; (b) accessibility overlay for any video.
- Hook story: add a language → hook generates recogniser config, formatter, test.
- Audience: educators, accessibility users, event organisers.
- Demo: speak, watch captions appear in sync; switch language live; export VTT.
- Kiro fit: specs for caption schema; steering for timing; hooks run PBT on sync; MCP over an audio file.
- Complexity: low-medium. Web Speech API is browser-native.
- Crowding: `accessibility` 36670 global, `a11y` 165 global, 0 Kiroween. Open.
- Biggest risk: Web Speech accuracy varies by browser; scope to Chrome.
- PBT: timestamp monotonicity, VTT round-trip.

### 5. Audit Kit — event-sourced hash-chain log
- Pitch: a skeleton for tamper-evident audit logs where one spec line adds an event type and the hook generates the schema, the hash-chain step and a test.
- What the skeleton standardises: event schema, hash chain, append-only store, verifier, export.
- Two apps: (a) expense ledger; (b) moderation log.
- Hook story: add an event type → hook generates schema + hash step + test; verifier proves chain integrity live.
- Audience: compliance, finance, moderation teams.
- Demo: append events, show the chain; tamper one event, watch verification fail; restore.
- Kiro fit: specs for event schema; steering for hash semantics; hooks run PBT on chain invariants; MCP over a log file.
- Complexity: low. Hashing is built in (Web Crypto).
- Crowding: `event log` 4980 global, 0 Kiroween. Open.
- Biggest risk: "just a log" — needs the tamper-detection demo beat.
- PBT: chain integrity, append-only, tamper detection.

### 6. Map Kit — offline map with waypoints
- Pitch: a skeleton for offline-first maps (tiles, waypoints, routes) where one spec line adds a layer and the hook generates the layer, renderer and test.
- What the skeleton standardises: tile cache, waypoint model, route engine, renderer, export.
- Two apps: (a) field survey; (b) treasure hunt.
- Hook story: add a layer → hook generates layer, renderer, test.
- Audience: field workers, hikers, educators.
- Demo: load tiles offline, drop waypoints, draw a route, export GPX; show it works with no network.
- Kiro fit: specs for layer schema; steering for tile semantics; hooks run PBT on route invariants; MCP over a GPX file.
- Complexity: medium. Tile caching and GPX are well-specified.
- Crowding: `map` 48831 global, 0 Kiroween. Open.
- Biggest risk: tile licensing. Mitigate with OpenStreetMap (ODbL, free with attribution).
- PBT: route distance, waypoint order, GPX round-trip.

### 7. Form Kit — schema-driven forms with autosave
- Pitch: a skeleton for schema-driven forms where one spec line adds a field type and the hook generates the component, validator and test.
- What the skeleton standardises: schema, field registry, validator, autosave, export.
- Two apps: (a) intake form; (b) survey builder.
- Hook story: add a field type → hook generates component, validator, test.
- Audience: any team collecting data.
- Demo: build a form in 30 seconds, fill it, watch autosave, export JSON; add a new field type live.
- Kiro fit: specs for field schema; steering for validation semantics; hooks run PBT on serialise/parse; MCP over a schema file.
- Complexity: low.
- Crowding: `form` not queried this session (unverified count). Open.
- Biggest risk: "just a form builder" — needs the hook beat and autosave story.
- PBT: schema round-trip, validation correctness.

### 8. Tile Kit — tilemap editor with collision
- Pitch: a skeleton for tile-based games where one spec line adds a tile type and the hook generates the tile, collision rule and test.
- What the skeleton standardises: tile grid, collision, save/load, renderer, editor.
- Two apps: (a) top-down explorer; (b) maze solver.
- Hook story: add a tile type → hook generates tile, collision, test; solver proves solvability.
- Audience: indie game devs, educators.
- Demo: paint a level, watch collision update, run the solver, export the level.
- Kiro fit: specs for tile schema; steering for collision semantics; hooks run PBT on solvability; MCP over a level file.
- Complexity: low-medium.
- Crowding: `tilemap` 90 global, 0 Kiroween. Open.
- Biggest risk: "just a level editor" — needs the solver beat.
- PBT: solvability, collision correctness, round-trip.

### 9. Puzzle Kit — grid puzzle engine with solver
- Pitch: a skeleton for grid puzzles where one spec line adds a puzzle type and the hook generates the rules, solver and test.
- What the skeleton standardises: grid model, rule engine, solver, generator, renderer.
- Two apps: (a) sudoku; (b) nonogram.
- Hook story: add a puzzle type → hook generates rules, solver, test; generator produces a solvable puzzle.
- Audience: puzzle fans, educators.
- Demo: generate a sudoku, solve it step by step, show the solver's reasoning; add a new rule live.
- Kiro fit: specs for rule schema; steering for solver semantics; hooks run PBT on solvability; MCP over a puzzle file.
- Complexity: medium. Solvers are well-studied.
- Crowding: `roguelike` 309 global, 0 Kiroween. Open.
- Biggest risk: solver correctness. Mitigate with known test puzzles.
- PBT: solvability, uniqueness, round-trip.

### 10. Dialogue Kit — branching dialogue with state
- Pitch: a skeleton for branching dialogue where one spec line adds a node type and the hook generates the node, validator and test.
- What the skeleton standardises: dialogue graph, state, save/load, renderer, validator.
- Two apps: (a) visual novel; (b) interview simulator.
- Hook story: add a node type → hook generates node, validator, test; validator catches unreachable endings.
- Audience: game devs, educators, HR.
- Demo: play a branching story, show the graph, add a node type live, watch the validator flag an unreachable ending.
- Kiro fit: specs for node schema; steering for dialogue semantics; hooks run PBT on reachability; MCP over a script file.
- Complexity: low-medium.
- Crowding: `dialogue` 5187 global, `visual novel` 1478 global, 0 Kiroween. Open.
- Biggest risk: "just a dialogue tool" — needs the validator beat.
- PBT: reachability, determinism, save/load round-trip.

### 11. Inventory Kit — item system with crafting
- Pitch: a skeleton for item systems where one spec line adds an item and the hook generates the item, crafting recipe and test.
- What the skeleton standardises: item model, inventory, crafting, save/load, renderer.
- Two apps: (a) survival game; (b) shop simulator.
- Hook story: add an item → hook generates item, recipe, test; crafting proves consistency.
- Audience: game devs, educators.
- Demo: craft an item, show the recipe tree, add a new item live, watch crafting update.
- Kiro fit: specs for item schema; steering for crafting semantics; hooks run PBT on conservation (items in = items out); MCP over an item file.
- Complexity: low-medium.
- Crowding: `inventory` 8444 global, 0 Kiroween. Open.
- Biggest risk: "just an inventory" — needs the conservation-invariant beat.
- PBT: conservation, round-trip, crafting correctness.

### 12. Net Kit — lobby and matchmaking
- Pitch: a skeleton for multiplayer lobbies where one spec line adds a message type and the hook generates the handler, serialiser and test.
- What the skeleton standardises: lobby model, messaging, matchmaking, state sync, renderer.
- Two apps: (a) trivia room; (b) co-op puzzle.
- Hook story: add a message type → hook generates handler, serialiser, test; sync proves convergence.
- Audience: game devs, educators.
- Demo: two browsers join a room, play trivia, show sync; add a message type live.
- Kiro fit: specs for message schema; steering for sync semantics; hooks run PBT on convergence; MCP over a room.
- Complexity: medium. WebRTC or WebSocket.
- Crowding: `realtime multiplayer` 401 global, 0 Kiroween. Open.
- Biggest risk: networking flakiness in demo. Mitigate with local WebSocket fallback.
- PBT: convergence, message ordering, round-trip.

### 13. I18n Kit — translation with pluralisation and RTL
- Pitch: a skeleton for internationalised apps where one spec line adds a locale and the hook generates the locale, plural rules and test.
- What the skeleton standardises: string store, plural rules, RTL layout, fallback, export.
- Two apps: (a) any app in 3 languages; (b) RTL layout demo.
- Hook story: add a locale → hook generates locale, plural rules, test; missing-key detection.
- Audience: any team shipping globally.
- Demo: switch language live, watch plural forms update, show missing-key report.
- Kiro fit: specs for locale schema; steering for plural semantics; hooks run PBT on fallback; MCP over a locale file.
- Complexity: low.
- Crowding: `i18n` 789 global, 0 Kiroween. Open.
- Biggest risk: "just i18n" — needs the plural-rule and missing-key beats.
- PBT: fallback, plural correctness, round-trip.

### 14. A11y Kit — screen-reader-first component library
- Pitch: a skeleton for accessible components where one spec line adds a component and the hook generates the component, ARIA attributes and test.
- What the skeleton standardises: component registry, ARIA patterns, keyboard nav, focus management, test harness.
- Two apps: (a) accessible form; (b) accessible dashboard.
- Hook story: add a component → hook generates component, ARIA, test; axe audit passes.
- Audience: any team building for accessibility.
- Demo: navigate with keyboard, hear screen-reader output, run axe audit live, add a component.
- Kiro fit: specs for component schema; steering for ARIA semantics; hooks run axe + PBT; MCP over a component file.
- Complexity: low-medium.
- Crowding: `a11y` 165 global, `accessibility` 36670 global, 0 Kiroween. Open.
- Biggest risk: "just a11y" — needs the live axe audit beat.
- PBT: keyboard nav, focus management, ARIA correctness.

### 15. CLI Kit — command parser with subcommands
- Pitch: a skeleton for CLI tools where one spec line adds a command and the hook generates the parser, help text and test.
- What the skeleton standardises: command registry, parser, help generator, test harness.
- Two apps: (a) file tool; (b) git helper.
- Hook story: add a command → hook generates parser, help, test.
- Audience: devs building internal tools.
- Demo: run a command, show help, add a command live, watch help update.
- Kiro fit: specs for command schema; steering for CLI semantics; hooks run PBT on parse; MCP over a command file.
- Complexity: low.
- Crowding: `cli` 23443 global, 0 Kiroween. Open.
- Biggest risk: "just a CLI" — needs the help-generation beat.
- PBT: parse correctness, help completeness.

### 16. Flag Kit — feature flags with rollout and kill switch
- Pitch: a skeleton for feature flags where one spec line adds a flag and the hook generates the flag, rollout rule and test.
- What the skeleton standardises: flag registry, rollout rules, kill switch, audit log, test harness.
- Two apps: (a) any app with a flag; (b) experiment dashboard.
- Hook story: add a flag → hook generates flag, rule, test; kill switch proves instant.
- Audience: any team shipping features.
- Demo: toggle a flag, watch the UI change, kill a flag, watch it revert instantly.
- Kiro fit: specs for flag schema; steering for rollout semantics; hooks run PBT on consistency; MCP over a flag file.
- Complexity: low.
- Crowding: `feature flags` 3245 global, 0 Kiroween. Open.
- Biggest risk: "just feature flags" — needs the kill-switch beat.
- PBT: consistency, rollout correctness.

## Rejected this wave

| Idea | Why rejected |
|---|---|
| Replay Kit, Choice Kit, Voice Kit, Forge Kit, Cadence Kit | already in wave 1 |
| Local-first/CRDT skeleton | Bone Kit already this year |
| Game kit with provably-finishable levels | Skeleton kit already this year |
| HyperCard kit | 9+ entries this year |
| Agent scaffold kit | MicroAgent already this year |
| Verification harness kit | SpecGuard-Crew already this year |
| OrigamiVerse / resmgr-kit | already this year |

## Notes

- The open beat across ALL skeleton entries: "one spec line → hook scaffolds a full capability, demonstrated live." Every wave-1 and wave-2 candidate has this beat; the differentiator is the domain.
- Branch Kit (#1) and Audit Kit (#5) have the strongest PBT stories (reachability, chain integrity).
- Invoice Kit (#2) and Form Kit (#7) have the lowest build risk.
- Tile Kit (#8) and Puzzle Kit (#9) have the most visual demo payoff.
- Net Kit (#12) has the highest demo risk (networking).
- CLI Kit (#15) and Flag Kit (#16) have the lowest innovation ceiling.
