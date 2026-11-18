# Costume Contest — topic research for Kiroween 2026

Researched 18 November 2026. Every web read went through one real browser tab (Devpost search,
Devpost project pages, MDN, `example.com` for a feature probe). No curl, no fetch tool, no scraper.

Companion docs: `docs/research/frankenstein.md` (Frankenstein), `docs/research/resurrection.md`
(Resurrection), `docs/research/skeleton-crew.md` (Skeleton Crew). Read this one for **Costume
Contest** — *the interface itself must be the unforgettable part, and the spookiness must improve
the function, not sit on top of it.*

---

## 0. Contest reality check (loaded this session)

| Fact | Value | Source |
|---|---|---|
| Site | `https://kiroween.devpost.com/` | loaded |
| Participants | **16,123** | gallery page |
| Deadline | **Dec 5 2026, 03:30 GMT+5:30** (= Dec 4, 11:59pm PT) | gallery page |
| Category filters | Resurrection, Frankenstein, Skeleton Crew, **Costume Contest** | gallery page |
| Student sub-prizes | Best Student Project ×4, one per category (incl. Costume Contest) | gallery page |
| Project gallery | **still unpublished** — "The hackathon managers haven't published this gallery yet" | `kiroween.devpost.com/project-gallery` |
| Devpost `kiroween` full-text | 303 results | search |

Because the gallery is unpublished there is **no authoritative submission list**. Crowding below is
Devpost global full-text search, which undercounts, over-matches, and mixes years. Treat counts as
*order of magnitude of noise*, never a headcount. I opened 15 project pages to confirm year and
concept; everything else is marked **unverified**.

---

## 1. Crowding sweep

43 queries, one page load each. Counts are Devpost global full-text on 18 Nov 2026. "Kiro?" means
I confirmed a Kiroween 2026 submission on the project page; "likely" means the wording/look says
2026 but I did not confirm it.

| Query | Count | Kiro? | First hits that matter (abridged) |
|---|---|---|---|
| `costume` | 513 | **yes** | The Haunted Clause, Ghost Tasks, **Haunted Costume Shop**, GhostLedger, Monster Puppet Theater, Ghost Focus Room |
| `haunted` | 708 | **yes** | Lantern Path, **Kiro's Haunted House**, The Haunted Clause, Crypto Graveyard, **Promesses Fantômes**, **Haunted Ops**, Necropolis |
| `horror` | 1,406 | likely | Crypto Graveyard, Roomscape, Nine Lives Left, HOLD: The Cabin |
| `spooky` | 733 | **yes** | Ghost Pal, The Haunted Clause, Haunted Ops, Ghost Tasks, Necropolis, GhostLedger, Cherry Moon Hollow |
| `halloween` | 1,026 | **yes** | Lantern Path, Ghost Pal, Kiro: Love Is Out of Scope, Moonrise Mini Golf, The Haunted Clause, Haunted Ops |
| `ghost` | 2,927 | **yes** | Ghost Pal, Kiro's Haunted House, SHADOWPLAY, Ghost Run, Lamplight |
| `cemetery` | **46** | **yes** | Promesses Fantômes, NecroRepo, Graveyard, **Deadline Cemetery**, The Living Ground |
| `graveyard` | 375 | **yes** | Crypto Graveyard, NecroRepo, Bone Kit, Exhume, Lectern of the Dead, Revenant |
| `seance` | **22** | likely | Bone Kit, **Deadline Séance**, **Séance Kit**, **Séance BBS**, **Séance** ×2, **Seance Relay Chat** |
| `occult` | **35** | likely | N.T.A.P. (tabs as RPG bosses), After She Logged Off, MurderDoku |
| `tarot` | 137 | likely | Omenglass (VR tarot), Tarot Trader, The Necro-Oracle (repo tarot), Arcana Trials |
| `grimoire` | **43** | unverified | Wandless, Haunted Spell Book, Witch's Lab, Project Grimoire, Eigendark |
| `ritual` | 1,180 | noisy | Omenglass, breathz, CalenDit, Glowline, Fretlings |
| `vampire` | 212 | unverified | Poltergeist UI, **Haunted Costume Shop**, AI Monster Courtroom, Coven |
| `zombie` | 751 | unverified | Kowloon Zombie Stack, zombie-satellite, Zombie Bash, DeadKeys, Deadlight |
| `witch` | 242 | unverified | Skeleton kit, Haunted Ladder, Haunted Costume Shop, Haunted Spell Book |
| `ouija` | **28** | likely | Ouija, Ghostwriters, Séance, Ouija Chess, DARKREALM |
| `cursed` | 333 | unverified | Hauntlet, weCAPTCHA, Haunted Listing, **Cursed Weather Report**, Poltergeist UI |
| `eldritch` | **27** | unverified | Revenant's Hand, Beacon Tower, Grimoire OS |
| `liminal` | **75** | unverified | Spectrance, Liminal Wiki, Eigendark, Endrooms |
| `backrooms` | **24** | unverified | The Living Labyrinth, Backrooms, EscapeBackrooms, Blockrooms |
| `analog horror` | **30** | unverified | OCM, LAST CALL, WRAITHNET, Teletext Zero |
| `VHS` | **79** | unverified | Poltergeist UI, Ghost Labs, TokiCam, Pause Tape |
| `creepypasta` | **14** | unverified | Lookalike, The Between, Chill Guy Corp, Spectre |
| `escape room` | 741 | likely | Maze Protocol, Roomscape, Haunted Listing, EscaPic |
| `flashlight` | 300 | likely | HOLD: The Cabin, Andy's Maze, Don't Look Back |
| `win95` | **9** | unverified | Séance, RetroFit, EduOS-95, Win95 Mock |
| `skeuomorphic` | **41** | unverified | Madeleine, Memento Jar, Yattayo |
| `phosphor` | 163 | **yes** | **NecroCore**, Ghostline, **NecroVM-8080**, Teletext Reborn |
| `1-bit` | 131,612 (noise) | — | query broken by tokenisation; do not use |
| `crt` | 343 | **yes** | GhostBBS, RetroTelnet-AI, Lectern of the Dead, NecroCore |
| `terminal` | 9,345 | **yes** | Skeleton Core, GhostBBS, Mainframe Desk, CANDefend |
| `retro` | 2,972 | **yes** | Moonrise Mini Golf, GhostBBS, RetroTelnet-AI, Necropolis |
| `funeral` | **102** | unverified | Last Accounts, Undertaker, Hathaway Funeral Directors, Tribute |
| `memorial` | 223 | unverified | Unfinished Business, Alight, Memory Lantern |
| `estate` | 2,625 | noisy | Hearth, Dolly, Family Lifeline |
| `voicemail` | 319 | unverified | AFTERLINE, Say It Again, BeyondWords |
| `numbers station` | 412 (noisy) | unverified | zombie-satellite, Conduit Sentinel, 0.08 |
| `candle` | 305 | unverified | Deadline Séance, Dead Ledger, Lighten Up |
| `hospice` | **76** | unverified | PhantomCare, Legacy Agent, Septris, Paper Trail — all clinical, **none developer-facing** |
| `sonification` | **85** | likely | TactiMath-Engine, GraphEar, SonoChart, Cellsound, SonifyV |
| `possession` | 429 | noisy | Ashline, TrustGuard, Agree First, VANTYR |
| `evidence board` | 1,300 (noisy) | unverified | Inside Job, Draft Room, Agent Wall, Changeover |
| `interrogation` | 260 | unverified | Secret Scandal Handling, Coolhead, CaseClosed |
| `license compliance` | 717 (noisy) | unverified | AUDIT READY, PortfolioGuard, ReleaseScope, BlastRadius |
| `supply chain` | 3,898 (noisy) | unverified | CargoProof, ColdTrace, Install Check — mostly logistics |
| `dorian gray` | **0** | — | **no results at all** |

`crt`, `terminal`, `retro` counts are carried over from the sibling Frankenstein sweep, not re-loaded.

### Method limits

- Devpost search is token-fuzzy. `1-bit` returns 131k because it tokenises to `1` and `bit`. `supply
  chain`, `estate`, `evidence board` are equally polluted. Only the small, precise counts (`seance`
  22, `ouija` 28, `eldritch` 27, `backrooms` 24, `cemetery` 46, `hospice` 76) are decision-grade.
- Search cannot filter by year. 2025 Kiroween projects appear beside 2026 ones.
- Confirmations came from the "SUBMITTED TO" block on the project page.

---

## 2. Verified taken this year (project pages opened)

| Entry | What it actually does | Lane it owns |
|---|---|---|
| **The Haunted Clause** | Paste T&C / privacy policy → haunted house, one room per clause type, scarier ghost for worse clause | legal text legibility |
| **GhostLedger** | Subscription tracker; each forgotten subscription is a ghost with a haunt level; cancel = exorcism | recurring spend + neglect |
| **Unfinished Business** | Cozy haunted house; each avoided task moves in as a ghost and leaves when finished | task avoidance |
| **Haunted Ops** | Production incidents as a haunted house; service = room, error = ghost, latency = fog; read-only Kiro "Exorcist" agent; 9 specs, 173 tasks, 4 hooks, 8 steering files, PBT, MCP, pixi.js | live observability |
| **Cursed Weather Report** | Real Open-Meteo weather → AI horror emergency broadcast with TTS | audio broadcast |
| **Promesses Fantômes** | Public promises as ghosts; opacity = evidence level L0–L4; stake virtual Souls; broken promise → gravestone | evidence tracking |
| **Deadline Cemetery** | Assignment briefs → graveyard planner, 14-day forecast | student deadlines |
| **Graveyard** | Codebase's dead files, TODOs, churn as a cemetery with epitaphs | dead code |
| **Necropolis: GeoCities Reborn** | Spooky 90s homepage builder, visual editor, export one HTML file | retro web authoring |
| **Kiro's Haunted House** | Microsoft Bob resurrection: each ghost is an AI agent, each door an approval | agent orchestration |
| **Haunted Costume Shop** | 4 costumes, buy/rent, Solana Pay DevNet | crypto checkout |
| **Poltergeist UI** | Spooky theme kit / UI toolkit for any app — **explicitly entered as Costume Contest** | pure skin |

**Not Kiroween** (checked, so they do not block us): Haunted Listing (HackPrinceton Fall '26, 3D
ghost hunt in real buildings), Last Accounts (PayPal AI Hackathon, estate ledger), Undertaker (Life
After Code, feature funerals on GitLab).

Likely-2026 but unconfirmed: Ghost Tasks, Ghost Focus Room, GhostSprint, Lantern Path, Crypto
Graveyard, NecroRepo, Deadline Séance, Séance Kit, Séance BBS, Seance Relay Chat, Bone Kit, The
Necro-Oracle, Haunted Ladder, Cherry Moon Hollow.

---

## 3. Saturated lanes — read before ideating

1. **"Your neglected X becomes a ghost."** Seven confirmed entries: Ghost Tasks, Unfinished
   Business, Ghost Focus Room, GhostSprint, GhostLedger, Deadline Cemetery, Graveyard. Any pitch of
   the form *"each forgotten Y is a ghost that haunts you until you deal with it"* is dead on arrival.
2. **"X as a haunted house."** The Haunted Clause (terms), Haunted Ops (production), Kiro's Haunted
   House (agents), GhostLedger (subscriptions). The frame is now generic; using it costs originality
   points even when the domain is new.
3. **Retro terminal / CRT / OS skin.** NecroOS, VibeOS, ShadowScriptOS, necrOS, PHOSPHOR (verified by
   the sibling docs) plus GhostBBS, Séance BBS, NecroCore, Teletext Zero, Lectern of the Dead. The
   `win95` query returns only 9 results — because everyone calls it something else.
4. **"Séance" as a product name.** At least seven 2026 entries. It is the single most overused word
   in the pool. Do not use it as a name, even for an unrelated concept.
5. **Spooky theme kits.** Poltergeist UI is already entered in this exact category and is exactly
   what the rubric punishes: remove the theme, nothing changes.

The open ground is *not* more monsters. It is **new sensory or state mechanics**: what the user is
allowed to see, hear, or do at each moment, and how that constraint makes real data legible.

---

## 4. The costume test (use on every idea)

> Remove the theme. Does the app still work **identically**? Then it is decoration and scores low on
> Design and Innovation.
>
> Does the theme **change what the user can perceive or must do**? Then the costume is structural.

Four structural patterns that survived this test, and that the field above has not used:

- **Limited sense** — you can only perceive part of the data at once, so the interface paces you.
- **Corporeal state** — data health is rendered as a body/house/ward that visibly decays or recovers.
- **Consumable time** — a candle, tape, or battery burns down, so urgency is honest rather than a red badge.
- **Ritual gate** — an irreversible action needs a performed sequence, so danger is felt, not clicked past.

---

## 5. Candidates

Ranked by (demo strength × unclaimed ground × buildability by Dec 4). ★ = top 5.
All assume browser-first, free tools, no 3D asset pipeline, no paid API, and `.kiro/specs` +
steering + hooks + an MCP server + PBT as the Kiro-depth story.

---

### ★ 1. The Portrait — your health, wearing a face that rots

- **Pitch:** A daily check-in app whose only dashboard is a portrait. Good weeks keep it young;
  bad weeks make it decay in front of you.
- **What it does:** Logs sleep, movement, mood, screen time (manual entry, plus optional Apple
  Health / Google Fit export import). Computes a small set of sub-scores, then renders them as
  regions of one painted face: skin, eyes, mouth, hair, background.
- **How the interface carries meaning:** The portrait *is* the chart. It compresses five numbers
  into one legible human judgment ("I look unwell") that a line chart never delivers. Decay is
  reversible, so the interface is a feedback loop, not a warning label. It literalises Wilde: the
  costume absorbs the damage while the user's life stays presentable.
- **3-minute demo:** Enter a bad week live → the face greys, an eye clouds, the mouth thins, the
  frame cracks; scrub the timeline back through a good week and watch it heal. End on the split
  before/after.
- **Kiro fit:** Specs for the metric model, the decay model, and the renderer; steering file that
  fixes the art direction (palette, brush, allowed filters); hook that rejects a build where any
  visual parameter leaves its declared range; **PBT on the decay model** — monotonicity (worse input
  never improves the face), boundedness (0–100), idempotence of re-render; MCP tool so Kiro can
  "age the portrait to next Tuesday" for a preview.
- **Build complexity:** Medium-low. SVG portrait layers + `feTurbulence`/`feDisplacementMap` +
  `mix-blend-mode` + gradient masks. No 3D.
- **Crowding:** `dorian gray` returns **0** results; no portrait-as-dashboard entry in the sweep.
  Generic health trackers are common but none use a portrait. `unverified`: exact query `portrait`
  not run.
- **Biggest failure risk:** Looks gorgeous, says nothing. If the mapping is arbitrary ("mood drives
  hair colour") judges will call it a skin. Fix: publish the mapping on screen, one sentence per
  region, and make the PBT prove it. Second risk: the portrait asset. Use a **CC0 museum portrait**
  (Rijksmuseum / Met open access) and treat it procedurally — never claim the painting as original.

---

### ★ 2. Side Project Hospice — a ward for the projects you abandoned

- **Pitch:** Every side project you started is a patient. Last commit is the pulse, open issues are
  symptoms, and the ward tells you who is dying, who is stable, and who needs to be let go.
- **What it does:** Points at your public GitHub repos (or a seeded JSON file), computes a vitals
  panel — days since commit, issue/PR backlog trend, dependency freshness, deploy/CI status, README
  drift — and assigns a triage state: **Stable / Critical / Flatline / Archived**.
- **How the interface carries meaning:** A hospital ward is a triage instrument, not a theme: beds
  are ordered by severity, the ECG trace is the commit cadence, the monitor alarms are the only
  thing that interrupts you, and every patient demands a disposition decision — revive, maintain,
  or let go. A list of repos cannot make you decide; a ward with a flatlining patient can.
- **3-minute demo:** The ward loads with five patients. One flatlines live (kill its data feed), the
  alarm sounds, the chart goes to a straight line, time of death is stamped. You then "revive" it by
  committing, and the trace restarts. End on the discharge form: archive three, keep two.
- **Kiro fit:** Specs per subsystem; steering with the triage thresholds as a versioned clinical
  protocol; hooks running the vitals tests on save; **PBT on triage** — a repo with worse vitals can
  never rank as healthier, states are mutually exclusive and exhaustive, severity ordering is total;
  MCP server exposing `list_patients`, `get_vitals`, `declare_time_of_death` so Kiro can run a ward
  round in chat.
- **Build complexity:** Low-medium. SVG ECG (animated `stroke-dashoffset`), CSS ward layout, seeded
  data, GitHub REST as optional live source.
- **Crowding:** `hospice` = 76, all clinical/health products (PhantomCare, Septris, Legacy Agent);
  **nothing developer-facing**. `funeral` = 102, closest is Undertaker, which is a different
  hackathon and about deleting features, not tracking projects. No Kiroween entry found.
- **Biggest failure risk:** A static mock. Judges will ask "is this live?". Ship a real GitHub mode
  plus a deterministic demo mode, and show the API call in the video. GitHub's 60 req/hr
  unauthenticated limit is the trap — cache server-side and ship a fixture that never fails on stage.

---

### ★ 3. The Wake — a funeral for the library version you are leaving

- **Pitch:** Paste a dependency and its target major version; The Wake holds a funeral for the old
  one — cause of death, who is affected, what survives — then performs the burial by applying the
  migration.
- **What it does:** Reads `package.json` (or a lockfile), diffs the current and target versions,
  classifies every breaking change by blast radius across the repo, generates an order-of-service
  migration plan, and applies mechanically-safe codemods with a diff review before and after.
- **How the interface carries meaning:** A funeral is a *sequence*: obituary (what died and why) →
  gathering (who imports it) → eulogy (what it gave you) → burial (the codemod) → reception (tests
  green). That order is exactly the order a migration must be done in: understand, scope, migrate,
  verify. The ritual supplies the discipline a checklist lacks, and the "survived by" list is a real
  dependency graph.
- **3-minute demo:** Funeral card for a major upgrade. "Survived by 43 files" lights up as a graph.
  Press *Bury*: codemod runs, diff appears, tests go green, the headstone is stamped with the
  version and date. Undo restores the body.
- **Kiro fit:** Specs for changelog parsing, blast-radius analysis, codemod execution; steering file
  holding the "order of service" rubric so Kiro writes consistent obituaries; **PBT on the codemod**
  — parse/print round-trip, idempotence (running twice equals running once), no-op on already-
  migrated code; hook that blocks a burial if the test suite is red before it starts; MCP tool
  `plan_funeral(package, from, to)`.
- **Build complexity:** Medium. Bundle 3 known migrations (e.g. a test runner, a router, a date
  library) rather than claiming generality. Changelog parsing via a curated map + LLM for prose.
- **Crowding:** `funeral` = 102; Undertaker does feature deletion on GitLab at another hackathon;
  no migration-as-funeral entry in the sweep, and nothing in the verified 2026 set.
- **Biggest failure risk:** The eulogy becomes decorative LLM prose and the codemod is fake. Rule:
  every claim in the eulogy must cite a changelog line, and the burial must produce a real diff that
  a real test run accepts. If codemods are too hard, cut to "guided burial" with exact edit
  locations — never fake the apply step.

---

### ★ 4. The Curse Breaker — licence infection, rendered as blight

- **Pitch:** Paste a dependency tree; copyleft licences spread across it like a curse, and the tool
  shows exactly which of your files are already infected and what breaks the chain.
- **What it does:** Walks `package.json` + lockfile, resolves each package's SPDX licence, builds the
  actual import graph of your source, and propagates obligation rules (strong copyleft → weak
  copyleft → permissive) along real import edges. Outputs: infected files, the shortest infection
  path, and 2–3 concrete remedies (replace, isolate behind a process boundary, or comply).
- **How the interface carries meaning:** Blight is a *propagation* metaphor, and licence obligations
  genuinely propagate through derivative works. The visual is a root system under a house: infected
  roots blacken the floor above them. You can watch a single GPL package poison a subtree — which
  is the exact thing a table of licence names never communicates.
- **3-minute demo:** Paste a package.json with one GPL dependency deep in the tree. Black veins crawl
  up the graph into three of your own files. Hover an infected file: the obligation and the shortest
  path. Apply the suggested swap: the veins recede, the file goes clean.
- **Kiro fit:** Steering file that encodes the compatibility matrix and the "never legal advice"
  language; specs for resolver, propagation, remedy ranking; **PBT on the matrix** — reflexivity,
  transitivity where declared, asymmetry of "can-import-into", and no package ever both clean and
  infected; hooks running the matrix tests on every edit; MCP tool `trace_infection(path)`.
- **Build complexity:** Medium. SPDX licence list is a free offline JSON. Scope the matrix to ~20
  common licences and say so. Import graph via a bundler plugin or a simple AST walk.
- **Crowding:** `license compliance` = 717 but polluted (audits, portfolio guards); `supply chain` =
  3,898 and mostly logistics. No licence-propagation visualisation found in the sweep. `unverified`:
  did not open competitor pages.
- **Biggest failure risk:** Wrong legal claims. A single false "you are infected" destroys trust.
  Mitigate with a visible confidence level, an explicit "not legal advice" banner, and a rule engine
  you can inspect per edge. Second risk: the graph is pretty but the remedy is hand-waved.

---

### ★ 5. The Interrogation Room — two agents question your decision until it confesses

- **Pitch:** Write down a decision you are about to make; a good cop and a bad cop interrogate you
  about it in a dim room, and the case file fills with your own contradictions.
- **What it does:** A decision journal with an adversarial review loop. You state a decision, the
  evidence, the deadline, and what would change your mind. Two agents — one sympathetic, one
  hostile — ask follow-ups drawn from your own prior entries, flag contradictions and missing
  evidence, and produce a signed "case file" you can reopen before you commit.
- **How the interface carries meaning:** The room enforces the ritual: one lamp, one folder, one
  question at a time, no scrolling back to your earlier answer — you must hold your story. The
  case file is the artifact: claims, contradictions in red, unresolved questions pinned to the
  board. Removing the room turns it into a chatbot; the constraint is what produces honesty.
- **3-minute demo:** State a decision ("we ship the paid tier Friday"). Bad cop finds the entry from
  nine days ago where you said the billing tests were not ready; the two lines connect with red
  string on the board. You either resolve it or sign the file as knowingly unresolved.
- **Kiro fit:** Strongest **Kiro Crew** story in this list (Best Kiro Crew App is a separate prize):
  two personas with different steering files, one shared case-file schema; specs for the
  contradiction detector; PBT on the case-file state machine (a file can never be signed with an
  open contradiction unless explicitly waived); hooks that re-run the contradiction check on every
  new entry; MCP tool `open_case`, `cross_examine`.
- **Build complexity:** Medium. Chat surface + local persistence + a rigid question schema. Risk is
  model drift, not UI.
- **Crowding:** `interrogation` = 260, nothing matching (Secret Scandal Handling, Coolhead,
  CaseClosed are unrelated); `evidence board` = 1,300 and noisy. No Kiroween entry in this lane.
- **Biggest failure risk:** Unscripted LLM output on stage. Build a deterministic scripted case for
  the demo and a live mode behind a toggle; the scripted case must be generated by the same engine,
  not hard-coded prose.

---

### 6. The Listening Room — hear your system before you see it

- **Pitch:** A monitoring surface you listen to: a healthy service hums, a degraded one wheezes, a
  dead one goes silent. The screen only confirms what your ears caught first.
- **What it does:** Ingests a metrics stream (Prometheus, or a bundled replay), maps each signal to a
  voice in a small ensemble, and runs an ambient "heartbeat" so an on-call engineer can keep the
  room in the background and notice change without staring at graphs.
- **How the interface carries meaning:** Sound is a parallel channel with genuinely better temporal
  resolution than vision; using it is functional, not atmospheric. The horror is honest: silence
  from a service that should be breathing is the oldest alarm there is.
- **3-minute demo:** Ambience plays. Inject latency — one voice starts gasping, the fog thickens on
  screen, captions name the change. Kill the service — total silence, one flat line, the room dims.
- **Kiro fit:** Specs for the sonification mapping and the ensemble; **PBT on the mapping** (every
  metric range maps to exactly one voice state, monotone in severity, no unmapped values); steering
  file for the audio design language; MCP tool `play_room`, `mute_voice`.
- **Build complexity:** Medium. Web Audio oscillators + filters, no samples needed; SSE replay for
  the demo; captions mandatory.
- **Crowding:** `sonification` = 85 and rising (TactiMath, GraphEar, SonoChart, Cellsound, SonifyV)
  — the technique is not novel, the *haunted-monitoring* framing is. Haunted Ops owns production-
  as-haunted-house visually; this must stay audio-first or it reads as a worse Haunted Ops.
- **Biggest failure risk:** Judges watch the video muted. Without burned-in captions and a strong
  visual parity track this scores near zero on Presentation. Also: autoplay policies — every sound
  needs one explicit user gesture.

---

### 7. The Pre-Mortem Morgue — autopsy the project before it dies

- **Pitch:** Your team writes how the project will fail; the morgue stores each cause of death as a
  body, then hands back an autopsy that tells you which organ fails first.
- **What it does:** Runs a structured pre-mortem (a real project-management technique): each
  participant writes failure causes, the tool clusters them into causes of death, scores likelihood
  and impact, maps each to a workstream ("organ"), and generates mitigations with owners and dates.
- **How the interface carries meaning:** Drawers, toe tags, and an autopsy sheet force one cause per
  body — the discipline a risk register lacks. Opening a drawer is a commitment to read one risk,
  fully, instead of skimming forty rows.
- **3-minute demo:** Five people submit causes; drawers slide out and cluster on the slab; one cause
  is declared "primary" and the organ diagram shows which workstream fails first; the mitigation
  sheet prints.
- **Kiro fit:** Specs for clustering and the autopsy schema; steering file with the autopsy rubric;
  PBT on clustering (every item lands in exactly one drawer, order-independent); MCP tool
  `open_drawer`.
- **Build complexity:** Low-medium.
- **Crowding:** `funeral` = 102, `memorial` = 223, no pre-mortem entry found. Post-mortems exist
  widely; pre-mortem is the rarer, more useful half.
- **Biggest failure risk:** It is a form with a morgue skin. The clustering must visibly do work the
  user could not do, or the costume test fails.

---

### 8. The Quarantine Ward — isolate the tests that are making the suite sick

- **Pitch:** Flaky tests are infectious patients; the ward finds them, isolates them, and shows
  whether the infection is spreading.
- **What it does:** Ingests CI history (JUnit XML / GitHub Actions logs), detects tests that pass and
  fail on the same code, computes a flake score and a contagion score (does it flake only when run
  with certain neighbours?), quarantines them behind a marker, and proposes a fix class (timing,
  order dependence, shared state, network).
- **How the interface carries meaning:** Isolation is the actual engineering remedy, and a ward
  makes isolation visible: each test has a bed, a chart, and a contagion badge; the ward layout
  groups shared-state clusters together, which is how you spot the real cause.
- **3-minute demo:** A green suite with three beds marked contagious; one test is isolated and the
  ward's contagion map collapses; the suite goes green and the badge is stamped "discharged".
- **Kiro fit:** PBT on the flake classifier (same input history → same verdict, thresholds
  monotone); specs for the log parser; steering file for the diagnostic taxonomy; hook that runs the
  parser tests; MCP tool `ward_status`.
- **Build complexity:** Medium. Log parsing is the work; seeded fixtures remove stage risk.
- **Crowding:** `hospice` 76 shows the ward metaphor is unused in dev tools; no flaky-test entry in
  the sweep. `unverified`: query `flaky` not run.
- **Biggest failure risk:** Needs real CI history to be convincing. Ship fixtures from a public repo
  and be explicit that they are real captured runs.

---

### 9. Blackout — flip a breaker, watch the blast radius

- **Pitch:** Your architecture as a house's wiring; kill any service and the rooms it feeds go dark
  in order, so you feel the blast radius instead of reading it.
- **What it does:** Reads a service graph (compose file, k8s manifests, or a pasted dependency list),
  computes transitive dependants and critical paths, and simulates failure: single node, zone, or
  dependency. Produces a resilience report with the first three things that die and the one thing
  that must never die.
- **How the interface carries meaning:** Darkness is a legible propagation of failure; the order in
  which rooms dim *is* the dependency order. Time-to-dark encodes latency to failure.
- **3-minute demo:** Pull the breaker on the auth service. Lights die room by room; the checkout room
  flickers last; the report names the single point of failure and a cheap fix.
- **Kiro fit:** Specs for the graph model and simulation; **PBT on the graph** (adding an edge never
  reduces reachability, removing a node is monotone in dark rooms); MCP tool `pull_breaker`.
- **Build complexity:** Medium-low.
- **Crowding:** `haunted` / `haunted ops` — Haunted Ops already renders production as a house, so
  this risks reading as its design-time sibling. Flagged, not recommended unless the interaction is
  clearly different (breaker panel, not a live ward).
- **Biggest failure risk:** Overlap with Haunted Ops costs Innovation points even if execution is
  better.

---

### 10. The Sealed Will — instructions for the accounts you will leave behind

- **Pitch:** A digital legacy document: list your accounts, seal each instruction in an envelope, and
  name who may open it and when.
- **What it does:** Inventory of accounts and assets, per-item instructions, nominated recipients,
  a dead-man switch (local, time-based, no server), and an exportable sealed package with per-envelope
  encryption.
- **How the interface carries meaning:** Seals are real state: sealed, witnessed, opened, contested.
  Opening requires the ritual (key + date + nominee), so the gravity of the action is felt. The will
  is a document you *read aloud*, which is how families actually handle it.
- **3-minute demo:** Seal three envelopes; advance the clock; the nominee opens one, the wax breaks,
  the letter unfolds with the account and the instruction; the others remain sealed and visibly
  intact.
- **Kiro fit:** Specs for the envelope format and the switch; PBT on seal/open state machine (an
  envelope can never be opened twice, a sealed envelope never leaks plaintext); steering file for
  tone; MCP tool `read_will`.
- **Build complexity:** Medium (crypto must be right — WebCrypto, no homebrew).
- **Crowding:** `estate` = 2,625 (noisy), `funeral` = 102; Last Accounts does estate money at another
  hackathon, not digital legacy. `unverified`: query `digital legacy` not run.
- **Biggest failure risk:** Tone. Handled clumsily it reads as a Halloween joke about death. Handled
  well it is the most affecting idea here. Also: never imply real security guarantees.

---

### 11. Red String — the evidence board for your own money

- **Pitch:** Your spending as a detective's board: pin the receipts, pull the string, find the
  culprit.
- **What it does:** Imports transactions (CSV or manual), clusters merchants and recurring charges,
  and lets you physically connect items — this charge to that subscription, this refund to that
  return — to build a case for where the money actually goes.
- **How the interface carries meaning:** The board is an analysis tool: spatial clustering and
  connection are how humans find patterns in messy evidence. The "culprit" is a computed finding
  (highest recurring leak), not a decoration.
- **3-minute demo:** Pin 20 receipts, string them into three clusters, the board names the culprit
  and the monthly bleed; cut one string and the total drops live.
- **Kiro fit:** PBT on clustering (order independence, no orphan unless declared); specs for
  merchant normalisation; MCP tool `add_evidence`.
- **Build complexity:** Medium (drag + SVG strings + layout).
- **Crowding:** `evidence board` = 1,300 but noisy; GhostLedger already owns "subscriptions you
  forgot" in this hackathon. Different interaction, adjacent subject — acceptable but not novel.
- **Biggest failure risk:** GhostLedger adjacency plus the risk that the board is a novelty layer
  over a table.

---

### 12. The Candle Cabinet — medication you can see burning down

- **Pitch:** A cabinet of medicines where each dose is a candle; the flame is the time you have left
  before it matters.
- **What it does:** Medication and supplement scheduling for one person or a family caregiver, with
  a physical cabinet view: each bottle has a candle that burns between doses, gutters when a dose is
  due, and goes out when missed. Includes a caregiver view and a simple adherence history.
- **How the interface carries meaning:** A countdown candle is honest urgency — you can see the
  margin, not a notification you swipe away. For elderly parents the cabinet is legible at a glance
  from across a room, which is a real accessibility argument.
- **3-minute demo:** Three candles burning at different heights; one gutters and the room darkens
  slightly; the caregiver relights it and the log records who and when.
- **Kiro fit:** PBT on the schedule engine (no double-dose window, timezone-safe, DST); specs for
  the adherence log; steering file for tone and medical caution; MCP tool `cabinet_status`.
- **Build complexity:** Low. CSS/SVG flames, local storage, notifications.
- **Crowding:** `candle` = 305, no medication-cabinet entry; `hospice`/`palliative` adjacent products
  are clinical, not consumer. `unverified`: query `medication` not run.
- **Biggest failure risk:** Tone and safety. Never give dosing advice; frame as a reminder, with a
  visible disclaimer. Spooky framing of medicine can read as flippant if the copy is not gentle.

---

### 13. Hyde — the respectable view and the true view of your docs

- **Pitch:** Your documentation has a presentable face and a real one; one keypress swaps them.
- **What it does:** Docs quality analyser: broken links, stale claims (referenced code changed),
  orphan pages, TODO density, unsupported assertions. Renders two views of the same site — the
  polished public face and the decayed truth underneath.
- **How the interface carries meaning:** The transformation *is* the finding: the same page, two
  states, difference legible without a report. Rot is localised to the exact paragraph.
- **3-minute demo:** Toggle: headings sag, links snap, three claims turn to ash with the commit that
  disproved them; toggle back and the fix list is a diff.
- **Kiro fit:** PBT on the staleness detector (deterministic, monotone in time since code change);
  specs for the claim extractor; MCP tool `show_true_face`.
- **Build complexity:** Medium.
- **Crowding:** No matching entry in the sweep; docs tools are common. `unverified`: query
  `documentation` not run.
- **Biggest failure risk:** Second view is cosmetic; if the decay does not map to a specific defect,
  it is a skin.

---

### 14. The Ledger of Debts — the money you are owed and the conversations you avoid

- **Pitch:** A private ledger for informal loans between friends and family, where every unpaid debt
  is a weight on the page and every reminder is written in the register's voice.
- **What it does:** Records who owes what, since when, and what was agreed; generates gentle,
  culturally-aware reminder drafts; tracks partial repayments; keeps a history so nobody relitigates
  the amount.
- **How the interface carries meaning:** A physical ledger with ink and marginalia makes the social
  weight visible — the debt sits on the page in the lender's handwriting. The horror is honest:
  asking for money back is the actual frightening part, so the product is really about the message,
  not the arithmetic.
- **3-minute demo:** Add three debts; the ledger shows one overdue in red ink; generate a reminder
  that sounds like a person, not a collections agency; mark it repaid and watch the line be struck
  through.
- **Kiro fit:** PBT on the balance arithmetic (no negative drift, partial payments sum exactly,
  rounding never invents money); specs for the tone engine; MCP tool `who_owes`.
- **Build complexity:** Low.
- **Crowding:** GhostLedger is subscriptions (money you pay), not money owed to you; no matching
  entry found. `unverified`: query `debt` not run.
- **Biggest failure risk:** Treated as a joke app. The tone engine has to be genuinely good, and the
  demo must show a real message a user would send.

---

### 15. The Planchette — the team decision nobody wants to make

- **Pitch:** Everyone puts a finger on the planchette; the board spells out the decision the team
  actually agrees on, and records who resisted.
- **What it does:** A shared decision surface: each participant privately rates options and states
  one objection; the planchette moves according to the aggregate, and the board reveals the
  consensus, the dissent, and the unresolved objection that would change the outcome.
- **How the interface carries meaning:** Consensus is genuinely a joint motion — nobody controls the
  planchette alone, and the friction is visible. The board makes dissent a first-class artifact
  instead of something lost in a thread.
- **3-minute demo:** Four cursors on the planchette, it drifts to option B, one objection pins the
  board and blocks the seal until answered; then the seal stamps and the decision is logged.
- **Kiro fit:** PBT on the aggregation (anonymity preserved, no single vote can flip beyond a stated
  weight); specs for the session protocol; realtime transport is the work.
- **Build complexity:** Medium (multiplayer, presence, conflict-free state).
- **Crowding:** `ouija` = 28 and no decision tool among them; Séance-named entries are all retro
  revivals. Novel interaction, but impact is limited to team meetings.
- **Biggest failure risk:** Multiplayer on stage — two browser windows is a weak demo. Also the
  planchette can read as a gimmick if the aggregation is trivial.

---

### 16. The Inheritance — a codebase handover written as a will

- **Pitch:** When someone leaves, the codebase reads its will: what each module bequeaths, to whom,
  and what is contested because nobody owns it.
- **What it does:** Analyses a repo (ownership from git blame, module criticality, bus factor, doc
  coverage) and emits a handover document structured as a will: bequests, guardians, contested
  items, debts (known bugs), and a reading order for the heir.
- **How the interface carries meaning:** Bequests force an ownership decision per module; contested
  items are visible gaps. The reading order is a real onboarding path derived from the dependency
  graph.
- **3-minute demo:** Add a departing maintainer; the will assigns guardians, three modules are
  contested, and the heir's reading order appears; open the first bequest and land in the code.
- **Kiro fit:** PBT on the ownership resolver (every module has 0 or 1 guardian, no cycles in the
  reading order); specs for the blame parser; MCP tool `read_bequest`.
- **Build complexity:** Medium.
- **Crowding:** `estate`/`funeral` only; Graveyard owns dead code, not ownership. No matching entry.
- **Biggest failure risk:** It is a report with a costume. The reading order and contested list must
  drive an action (assign, archive, document), or it fails the costume test.

---

### Rejected after the costume test

| Idea | Why it dies |
|---|---|
| Account-deletion exorcism ("dead accounts still haunt you") | GhostLedger + Promesses Fantômes already own ghost-as-unresolved-state; same house, same ritual |
| Séance for git history / dead links / old chats | Seven 2026 "Séance" entries; lane exhausted |
| Retro OS / CRT dashboard | NecroOS, VibeOS, ShadowScriptOS, necrOS, PHOSPHOR, GhostBBS, NecroCore all present |
| Spooky component library | That is Poltergeist UI, already entered, and is the definition of decoration |
| Storm-cellar preparedness checklist | Theme is a wrapper; removing it changes nothing |
| Browser history as found footage | Tape skin; no functional constraint |
| Memento-mori life calendar | Affecting, but no data work — one screen, no depth |
| Tarot-driven prioritisation | Cute, no utility; Tarot Trader and Necro-Oracle already parody the form |

---

## 6. Craft feasibility (verified in this browser)

Probed on `https://example.com` and confirmed via MDN:

| Capability | Status | Note |
|---|---|---|
| Web Audio API | **available**, "well established… since April 2021" (MDN) | oscillators/filters enough; no sample licensing |
| SVG `feTurbulence` | **available**, "since July 2015" (MDN) | grain, rot, ink bleed, paper fibre — one filter, no assets |
| Canvas 2D | **available** (probe) | ECG traces, strings, planchette |
| WebGL | **available** (probe) | optional; only if a shader effect earns its place |
| OffscreenCanvas | **available** (probe) | keeps heavy render off the main thread |
| CSS `mask-image` | **supported** (probe) | flashlight radius, vignette, selective reveal |
| CSS `filter: url(#…)` | **supported** (probe) | SVG filter graphs on live DOM |
| `mix-blend-mode` | **supported** (probe) | ink, smoke, double exposure |
| Container queries | **supported** (probe) | one component, many surface sizes |
| `speechSynthesis` | **available** (probe) | whispers without recording a voice actor |
| Pointer events / haptics | **available** (probe) | proximity, drag, `navigator.vibrate` on mobile |

No 3D asset pipeline is needed for any ranked candidate. The most expensive asset in the list is the
portrait in #1, and a CC0 museum image plus procedural filters covers it.

---

## 7. Recommendation

**Build ★1 The Portrait**, with ★2 Side Project Hospice as the low-risk fallback and ★5 The
Interrogation Room as the option that maximises the separate Kiro Crew prize.

Why the Portrait wins this category specifically:

- It is the only candidate where the costume **is** the readout. Remove the painting and the product
  loses its entire feedback mechanism — the strongest possible answer to "is this decoration?".
- The genre is uncontested: `dorian gray` returns zero results, and no portrait-as-dashboard exists
  in the sweep.
- Design ceiling is the highest available without 3D, and Design is 20% of the score.
- The 3-minute demo has one unforgettable beat (a face decaying live) and a second (it healing),
  both fully rehearsable and offline.
- Kiro depth is real, not bolted on: the decay model is a pure function with obvious property tests
  (monotonicity, boundedness, determinism), which is exactly what PBT is for.

Two hard rules if we take it: publish the metric→feature mapping on screen, and never let the
portrait be the only output — a plain numeric panel must exist behind a toggle so accessibility and
skeptical judges both have a floor.

**16-day shape (small team):** D1–2 spec + steering + art direction + CC0 portrait selection;
D3–5 decay model + PBT + face rig (regions and parameters); D6–9 renderer + timeline scrub + check-in
flow; D10–11 import (health export) + accessible table view; D12–13 polish pass on filters, sound,
and motion; D14 video; D15 blog + social; D16 buffer.

---

## 8. Sources actually loaded

Devpost search (one load each): `costume`, `haunted`, `horror`, `spooky`, `halloween`, `ghost`,
`cemetery`, `graveyard`, `seance`, `occult`, `tarot`, `grimoire`, `ritual`, `vampire`, `zombie`,
`witch`, `ouija`, `cursed`, `eldritch`, `liminal`, `backrooms`, `analog horror`, `VHS`,
`creepypasta`, `escape room`, `flashlight`, `win95`, `skeuomorphic`, `phosphor`, `1-bit`,
`funeral`, `memorial`, `estate`, `voicemail`, `numbers station`, `candle`, `dorian gray`, `hospice`,
`sonification`, `possession`, `evidence board`, `interrogation`, `license compliance`,
`supply chain`, `kiroween`.

Project pages opened: `/software/the-haunted-clause`, `/ghostledger`, `/haunted-ops`,
`/kiro-s-haunted-house`, `/haunted-costume-shop`, `/poltergeist-ui`, `/cursed-weather-report`,
`/haunted-listing`, `/graveyard-nw9mro`, `/deadline-cemetery`,
`/promesses-fantomes-ghost-pledges`, `/necropolis-geocities-reborn`, `/last-accounts`,
`/undertaker`, `/unfinished-business`.

Other: `https://kiroween.devpost.com/project-gallery`,
`https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`,
`https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence`, `https://example.com`
(feature probe only).

Counts for `crt`, `terminal`, `retro` are quoted from `docs/research/frankenstein.md` and were not
re-loaded in this pass.
