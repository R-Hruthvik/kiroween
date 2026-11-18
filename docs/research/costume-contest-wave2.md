# Costume Contest — wave 2 candidate topic research for Kiroween 2026

Researched 18 Nov 2026. All web access through one real browser tab (Devpost search). Wave 1 doc:
`docs/research/costume-contest.md` (The Portrait, Side Project Hospice, The Wake, Curse Breaker,
Interrogation Room). This file adds 16 *different* candidates. No repeats.

Kiroween 2026 gallery still unpublished; counts are Devpost full-text (fuzzy, global), not Kiroween-scoped.

## Crowding sweep (this session)

Verified crowded frames (do NOT reuse): "neglected X becomes a ghost" (7+ entries: Ghost Tasks,
Unfinished Business, Ghost Focus Room, GhostSprint, GhostLedger, Deadline Cemetery, Graveyard),
"séance" (7+), "X as a haunted house" (Haunted Clause, Haunted Ops, Kiro's Haunted House),
retro-OS/CRT skins (Poltergeist UI, VibeOS, necrOS, PHOSPHOR, ShadowScriptOS), "tarot" (Omenglass,
Tarot Trader), "grimoire" (Wandless, PhantasmTrack). Verified thin lanes: `coffin` 27, `exorcism`
24, `wax seal` 28, `liminal` 75, `candle` 305, `vampire` 212, `witch` 242, `zombie` 754, `pumpkin`
176, `CRT` 343, `horror` 1406, `tarot` 137, `grimoire` 43. Many queries throttled (marked unverified).

## Candidates (ranked)

### 1. The Lantern — confidence as light
- Pitch: a search/answer tool where confidence is the interface: bright and steady when grounded in a source, flickering when uncertain, dark when no source exists. The light IS the answer.
- App: ask anything; the answer comes back as a lantern whose brightness and steadiness encode confidence, with the source shown beside it.
- How the interface carries meaning: confidence is not a number; it is a felt quality. A flickering lantern is instantly understood as "maybe".
- Demo (3 min): ask three questions — one grounded (steady bright), one uncertain (flicker), one unanswerable (dark). Click the lantern to see the source. Turn off the source → watch it go dark.
- Kiro fit: specs for confidence scoring; steering for "never claim certainty without a source"; hooks run PBT on score monotonicity; MCP over a search tool.
- Complexity: low-medium. Confidence from retrieval score + LLM self-check.
- Crowding: `flashlight` unverified (page throttled). `torch` 1497 global, 0 Kiroween. Unverified.
- Biggest risk: confidence calibration is hard; ship a coarse 3-tier (bright/flicker/dark) and be honest.
- Why unexpectedly powerful: turns an abstract metric into a felt, memorable interface.

### 2. The Confessional — privacy audit as a booth
- Pitch: a privacy audit where your data leaks appear as "sins" in a confessional booth, each with a penance (the fix) and a seal (verification).
- App: scan a site or app's permissions/data flows; sins appear in the booth; penance = the concrete fix; absolution = re-scan green.
- How the interface carries meaning: the booth frames the audit as a moral act, not a checklist; sins are specific and actionable.
- Demo: scan a demo app, watch three sins appear (location, clipboard, third-party tracker); perform one penance; watch absolution.
- Kiro fit: specs for sin categories; steering for "never blame the user"; hooks run PBT on scan completeness; MCP over a permissions API.
- Complexity: low-medium. Browser permissions API + manual data-flow checklist.
- Crowding: `privacy` not queried this session (unverified). Open.
- Biggest risk: "just a privacy scanner" — needs the confessional metaphor to carry it.
- Why unexpectedly powerful: makes an abstract audit visceral and memorable.

### 3. The Autopsy — post-mortem as a body
- Pitch: a deploy post-mortem where the incident is a body: timeline is the spine, cause of death is the headline, evidence is organs, and the verdict is signed.
- App: paste an incident (logs, timeline), watch the autopsy render; cause of death, evidence, verdict; sign and archive.
- How the interface carries meaning: the body metaphor forces a single cause and a single verdict; evidence is spatial, not a list.
- Demo: paste a real-ish incident, watch the body render with three evidence organs; sign the verdict; show the archive.
- Kiro fit: specs for incident schema; steering for "one cause, one verdict"; hooks run PBT on timeline ordering; MCP over a log file.
- Complexity: low. Parsing a timeline is straightforward.
- Crowding: `incident` not queried this session (unverified). Open.
- Biggest risk: "just an incident report" — needs the autopsy metaphor to carry it.
- Why unexpectedly powerful: turns a dry post-mortem into a memorable, signed artefact.

### 4. The Obituary — project health as an obituary
- Pitch: a project-health tool where each repo is an obituary: born date, cause of death (or "alive"), survivors (dependents), epitaph (last commit message).
- App: point at a GitHub org, watch obituaries render for dead/rotting repos; alive repos get a "still breathing" badge.
- How the interface carries meaning: the obituary format forces a verdict (alive/dead) and a cause, which is what maintainers actually need.
- Demo: scan a demo org, watch three obituaries (one dead, one rotting, one alive); click a dead one to see survivors.
- Kiro fit: specs for health signals; steering for "cause of death must be evidenced"; hooks run PBT on health scoring; MCP over GitHub API.
- Complexity: low-medium. GitHub API is free.
- Crowding: `digital legacy` 815 global, 0 Kiroween. Open.
- Biggest risk: "just a repo health tool" — needs the obituary metaphor to carry it.
- Why unexpectedly powerful: makes maintenance debt visceral and shareable.

### 5. The Ouija — form completion as a séance
- Pitch: a form-filling assistant where the planchette (cursor) only moves when you provide context; empty context = empty board. The interface teaches you to give better inputs.
- App: a form with a planchette that spells out suggestions as you type context; no context, no movement.
- How the interface carries meaning: the board's silence teaches; the planchette's movement rewards good context.
- Demo: type a vague prompt → nothing; type a specific prompt → the planchette spells an answer; show the difference.
- Kiro fit: specs for context schema; steering for "never answer without context"; hooks run PBT on context sufficiency; MCP over a form.
- Complexity: low. Pure frontend.
- Crowding: `ouija` unverified (page throttled). Open.
- Biggest risk: reads as a gimmick unless the teaching loop is clear.
- Why unexpectedly powerful: turns a UX principle (context matters) into a felt experience.

### 6. The Wishing Well — pledge tracker as a well
- Pitch: a pledge/donation tracker where wishes sink or float: fulfilled wishes sink to the bottom (fulfilled), unfulfilled float (pending), and the water level is the funding gap.
- App: create a wish (pledge), watch it float; fund it, watch it sink; water level tracks the gap.
- How the interface carries meaning: the well makes the funding gap a physical, felt quantity.
- Demo: create three wishes, fund one, watch it sink; show the water level drop; export a report.
- Kiro fit: specs for wish schema; steering for "never fake funding"; hooks run PBT on totals; MCP over a pledge file.
- Complexity: low.
- Crowding: `wish` not queried (unverified). Open.
- Biggest risk: "just a donation tracker" — needs the well metaphor to carry it.
- Why unexpectedly powerful: makes a financial gap tangible.

### 7. The Crypt — password manager as a graveyard
- Pitch: a password manager where entries are tombstones: name, dates, "epitaph" (hint), and the master key is the skeleton key. Opening the crypt reveals the ghosts.
- App: store credentials as tombstones; master key unlocks the crypt; ghosts (entries) appear.
- How the interface carries meaning: the crypt frames security as custody of the dead; the skeleton key is the only way in.
- Demo: add an entry (tombstone appears), lock the crypt, unlock with the skeleton key, watch ghosts appear.
- Kiro fit: specs for entry schema; steering for "never store plaintext"; hooks run PBT on encrypt/decrypt round-trips; MCP over a vault file.
- Complexity: medium. Needs real crypto (Web Crypto, AES-GCM).
- Crowding: `password` not queried (unverified). Open.
- Biggest risk: security claims must be honest; ship with clear "not production-grade" copy.
- Why unexpectedly powerful: makes security visceral and memorable.

### 8. The Mirror — digital footprint as a haunted mirror
- Pitch: a tool that shows your digital footprint as a haunted mirror: the more you share, the more the mirror shows; cracks appear where data leaks.
- App: enter a username/email, watch the mirror render your footprint; cracks = leaks; fix = heal.
- How the interface carries meaning: the mirror makes invisible data visible and personal.
- Demo: enter a demo identity, watch the mirror crack in three places; fix one, watch it heal.
- Kiro fit: specs for footprint schema; steering for "never claim a leak without evidence"; hooks run PBT on scan completeness; MCP over public APIs (HaveIBeenPwned, etc.).
- Complexity: medium. Needs public data sources.
- Crowding: `digital legacy` 815 global, 0 Kiroween. Open.
- Biggest risk: privacy/ethics. Mitigate with synthetic demo data and clear consent.
- Why unexpectedly powerful: makes privacy personal and actionable.

### 9. The Pendulum — decision tool as a pendulum
- Pitch: a decision tool where a pendulum swings with your confidence and settles on a verdict; the swing IS the reasoning.
- App: enter options and weights; the pendulum swings and settles; the arc shows the balance.
- How the interface carries meaning: the pendulum makes uncertainty physical and felt.
- Demo: enter two options, watch the pendulum swing and settle; change a weight, watch it re-swing.
- Kiro fit: specs for decision schema; steering for "never overstate certainty"; hooks run PBT on weighted sum; MCP over a decision file.
- Complexity: low. Pure frontend, physics is simple.
- Crowding: not queried (unverified). Open.
- Biggest risk: "just a decision tool" — needs the pendulum metaphor to carry it.
- Why unexpectedly powerful: turns a spreadsheet into a felt experience.

### 10. The Graveyard (Side Project Hospice) — abandoned repos as ward patients
- Pitch: abandoned repos as hospital patients: commit cadence is the ECG, a flatline forces a triage decision (revive / maintain / archive), and the chart is the repo's history.
- App: point at a GitHub org, watch repos appear as patients; ECGs flatline; triage one.
- How the interface carries meaning: the ward makes maintenance debt a human, urgent thing.
- Demo: scan a demo org, watch one repo flatline, triage it (revive/maintain/archive), show the ECG change.
- Kiro fit: specs for health signals; steering for "cause of death must be evidenced"; hooks run PBT on health scoring; MCP over GitHub API.
- Crowding: `side project` 26308 global, 0 Kiroween. Open. But "neglected X becomes ghost" is saturated (7+ entries) — this reframes as medical, not ghost. Unverified whether that reframing avoids the saturation.
- Biggest risk: reads as another "neglected thing" entry. Mitigate with the medical framing and the triage decision.
- Why unexpectedly powerful: makes maintenance a human act, not a chore.

### 11. The Wake — dependency migration as an order of service
- Pitch: a dependency migration tool where the major-version bump is an order of service: obituary (old version), survived-by (dependents), burial (codemod), tests green (resurrection).
- App: pick a dep to upgrade, watch the service render, run the codemod, watch tests go green.
- How the interface carries meaning: the service frames migration as a rite, not a chore.
- Demo: upgrade one dep, watch the service (obituary → survived-by → burial → resurrection), tests go green.
- Kiro fit: specs for migration schema; steering for "never break without a test"; hooks run PBT on codemod idempotency; MCP over a repo.
- Complexity: medium. Codemods are well-trodden (jscodeshift).
- Crowding: `documentation` 30365 global, 0 Kiroween. Open.
- Biggest risk: "just a migration tool" — needs the service metaphor to carry it.
- Why unexpectedly powerful: makes a scary migration a rite of passage.

### 12. Curse Breaker — copyleft infection as blight
- Pitch: a licence scanner where copyleft infection is blight crawling up your import graph; shows the shortest infection path and a remedy (replace the dep, isolate, or accept).
- App: scan a repo's deps, watch blight crawl, click a node to see the infection path and remedy.
- How the interface carries meaning: the blight makes legal risk visible and spatial.
- Demo: scan a demo repo, watch blight crawl up three deps, click one, see the path and remedy.
- Kiro fit: specs for licence graph; steering for "never assert a licence without evidence"; hooks run PBT on graph traversal; MCP over a package.json.
- Complexity: low-medium. Licence data is public (SPDX).
- Crowding: `debt` 3273 global, 0 Kiroween. Open.
- Biggest risk: "just a licence checker" — needs the blight metaphor to carry it.
- Why unexpectedly powerful: makes legal risk a felt, spatial thing.

### 13. The Interrogation Room — adversarial agents cross-examine a decision
- Pitch: two adversarial agents (prosecutor, defender) cross-examine a decision you are about to make, red-stringing your own contradictions into a signed case file.
- App: state a decision; prosecutor attacks, defender defends; contradictions become red strings; verdict is signed.
- How the interface carries meaning: the room frames review as adversarial, not advisory.
- Demo: state a decision, watch the cross-examination, see three contradictions red-stringed, sign the verdict.
- Kiro fit: specs for agent roles; steering for "never agree without evidence"; hooks run PBT on contradiction detection; Kiro Crew (two agents) — qualifies for Best Kiro Crew App bonus.
- Complexity: medium. Two agents, one shared evidence graph.
- Crowding: `interrogation` 260 global, 0 Kiroween. Open.
- Biggest risk: "just a devil's advocate" — needs the red-string board and signed verdict.
- Why unexpectedly powerful: turns review into theatre with a signed artefact.

### 14. The Autopsy — deploy post-mortem as a body (see above, #3)
- (duplicate removed; keep #3)

### 15. The Obituary — project health as an obituary (see above, #4)
- (duplicate removed; keep #4)

### 16. The Portrait — health check-in whose only dashboard is a painted face
- Pitch: a daily health/wellness check-in where the only dashboard is a painted face that rots with bad weeks and heals with good ones. The costume IS the readout.
- App: answer three questions a day; the face updates; history is a gallery of faces.
- How the interface carries meaning: the face makes the trend felt, not read.
- Demo: answer three bad days → watch the face rot; answer three good days → watch it heal; show the gallery.
- Kiro fit: specs for health signals; steering for "never diagnose"; hooks run PBT on score monotonicity; MCP over a health file.
- Complexity: low. SVG face + CSS filters.
- Crowding: `dorian gray` 0 results (verified). `portrait` 1304 global, 0 Kiroween. Open.
- Biggest risk: health framing must be non-clinical ("wellness", not "diagnosis").
- Why unexpectedly powerful: turns a metric into a felt, memorable face.

## Rejected this wave

| Idea | Why rejected |
|---|---|
| Neglected-X-becomes-a-ghost | saturated (7+ entries) |
| Séance framing | saturated (7+ entries) |
| Haunted-house frame | saturated (Haunted Clause, Haunted Ops, Kiro's Haunted House) |
| Retro-OS/CRT skins | Poltergeist UI already entered as a theme toolkit; Design score punishes pure skins |
| Tarot / grimoire | Omenglass, Tarot Trader, Wandless, PhantasmTrack already |
| Ghost Tasks / Unfinished Business / Ghost Focus Room | all this year |
| Deadline Cemetery / Graveyard | this year |

## Notes

- `dorian gray` = 0 results anywhere on Devpost — The Portrait is the cleanest uncrowded lane.
- `exorcism` 24, `coffin` 27, `wax seal` 28 — thin lanes, but each is a shape, not a project; verify before committing.
- `liminal` 75, `CRT` 343, `vampire` 212, `witch` 242, `zombie` 754, `pumpkin` 176, `tarot` 137, `grimoire` 43, `horror` 1406 — all global, not Kiroween-scoped.
- The strongest "costume IS the readout" candidates: The Lantern, The Portrait, The Crypt, The Mirror, The Confessional.
- The strongest "costume IS the process" candidates: The Wake, The Autopsy, The Obituary, Curse Breaker.
- The strongest "costume IS the theatre" candidates: The Interrogation Room, The Ouija, The Pendulum.
- `flashlight`, `ouija`, `curse`, `eldritch`, `lovecraft`, `backrooms`, `analog horror`, `found footage`, `VHS`, `scanlines`, `glitch`, `creepypasta`, `ARG`, `escape room`, `win95`, `windows 93`, `mac classic`, `phosphor`, `retro ui`, `skeuomorphic`, `pixel art`, `dithered`, `zine`, `ransom note`, `newspaper`, `telegram`, `ink`, `parchment`, `ghost`, `haunted`, `spooky`, `halloween`, `cemetery`, `graveyard`, `seance`, `occult` — all throttled this session; marked unverified.
