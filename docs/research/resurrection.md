# Resurrection — topic research for Kiroween 2026

Researched 18 November 2026, ~16 days before the 4 December deadline. All web access was through a
real browser session (Devpost search, the Kiroween Devpost site, DuckDuckGo result pages).

**Method note.** The Kiroween 2026 project gallery is not published yet ("The hackathon managers
haven't published this gallery yet"), so there is no authoritative submission list. Instead I used
Devpost full-text search. A query for `kiroween` returns **303 results**, which is a good proxy for
this year's submission pool but is **not verified as the official submission count** — the query
also matches projects that merely mention Kiro/Kiroween. I read all 13 pages of that result set and
use its titles as the "taken this year" evidence. Separate per-term queries give global Devpost
counts, which are noisy (full-text matching) and are not Kiroween-scoped. Where a count is large and
the top hits are unrelated, the count is marked *noisy*.

---

## (a) TAKEN THIS YEAR

### Scoped evidence: the `kiroween` corpus (303 results, 13 pages)

Representative Resurrection-category entries visible in that corpus:

| Dead tech | Entries seen in the Kiroween corpus |
|---|---|
| Teletext / Ceefax | Teleteks, Teletext Reborn, Page 100, Page 100: teletext resurrected, P100 Crisis & Transit Portal, Ghostfax, Teletorch, Aftertext, Teletext Zero |
| HyperCard | GhostDeck, Stackyard (×2), HyperCard Revival (15 global Devpost hits) |
| BBS / dial-up boards | afterlight-bbs, ReBBS, GhostBBS, RetroTelnet-AI, The Last Caller, Séance BBS |
| RSS / Google Reader | NightRiver, Revenant Reader, GhostFeed, Haunted Feeds, NecroFeed, Kiroween-RSS-Reader |
| Yahoo Pipes | Revenant, GhostPipes |
| GeoCities / 90s web | Geo Cities AI, GeoSpirits, PhantomForge, Retroweb, 90s Website Generator, Necro-Net Navigator, VibeOS |
| MySpace / social relics | MySpace Resurrection, Orkut 2.0, The Digital Graveyard |
| IRC | Séance (IRC 1988 as an agent control room), NetSpeak |
| Fax | Ghostfax, GhostFax — AI-Powered Fax Machine |
| Punch cards | PunchRevive |
| Encarta | encart-ai |
| ELIZA | ELIZA EXHUMED |
| COBOL / legacy code | COBOL Phoenix, CodePhoenix, Kiro-Powered SAP Resurrection, RhinoKiro |
| Floppy / disk | Graveyard Shift — Floppy Recovery Lab, Exhume, burn2disk |
| Cassette / mixtape | TapeBack, Ghost Deck, Spec-Tape |
| Game Boy / DOS / 8-bit | KiroweenGBC, CivKiro 1991, NecroVM-8080, ShadowScriptOS, necrOS |
| Rolodex | Ghost Ledger |
| Rotary phone | Haunted Rotary Dialer |
| Tamagotchi | TamaGhosty |
| CORBA | CrewOS: CORBA Reborn |
| InfoPath (EOL July 2026) | InfoPath Afterlife |
| Logo turtle graphics | Necro-Turtle |
| Clippy | Clippy's Revenge (×2) |
| Modem / acoustic | Handshake (browser modem, two tones) |

### Per-term counts (global Devpost, 18 Nov 2026)

| Query | Count | What the top hits actually are |
|---|---|---|
| `teletext` | 19 | All nine+ teletext entries above; this lane is fully saturated |
| `hypercard` | 15 | GhostDeck, Stackyard, HyperCard Revival, more |
| `bbs` | 57 | GhostBBS, RetroTelnet-AI, The Last Caller, Séance BBS, afterlight-bbs, ReBBS |
| `gopher` | 158 (noisy) | GopherHollow ("a browser for the 1991 internet"); rest unrelated (gophers, graphs) |
| `usenet` | 6 | Spindle (IRC + Usenet), shkype; low but non-zero |
| `irc` | 292 (noisy) | Séance, NetSpeak; most hits unrelated |
| `wordperfect` | 5 | Exhume, The Last Save, Ctrl-R, Ouija — all legacy-file/format revivals |
| `wordstar` | 2 | Exhume, Ouija |
| `dbase` | 8 | phantombase, RETABLE — DBF resurrection already claimed twice |
| `scantron` | 13 | Testduino, digiTron, Scanify, ParseTron, Pupil — OMR lane contested |
| `3270` | 4 | Mainframe Desk, FlowASM, CloudModern.AI — AI-over-mainframe claimed |
| `palm pilot` | 46 (noisy) | No clear Graffiti entry visible |
| `lotus 1-2-3` | 55 (noisy) | No clear 1-2-3 keyboard-grammar entry visible |
| `fortran` | 88 (noisy) | Mostly unrelated |
| `kid pix` | 53 (noisy) | No clear Kid Pix entry visible |
| `tty` | 80 (noisy) | FrankenTTY (video over VT100) is the notable hit; not TTY accessibility |
| `teletype` | 37 (noisy) | FrankenTTY, Thermal Printer Linux Teletype |
| `graffiti` | 226 (noisy) | Street art / MR spray painting, not Palm Graffiti |
| `punch clock` | 35 (noisy) | Loom (Jacquard), no mechanical time-clock entry |
| `closed caption` | 158 (noisy) | StagePulse (live captions), not VBI Line 21 |
| `telex` | **1** | BattleChat (unrelated advertising project) |
| `minitel` | **0** | No results at all |
| `videotex` | **0** | No results at all |
| `navtex` | **1** | "NavText — No data? No problem" (project page returned 403; content **unverified**) |
| `weather fax` | **1** | Faxi (senior fax), not HF radiofax |
| `uucp` | **1** | Feem (offline-first file sharing), adjacent but not store-and-forward mail |
| `microfiche` | **2** | OpenFiche (academic search engine), library booking app |

### Already-won in 2025 (avoid re-treading)

Fax for seniors (Faxi-style), COBOL on crypto rails, KaiOS BlueSky client, gesture-controlled game
template. Note that a fax-for-seniors entry has reappeared this year (Faxi,
GhostFax), so the "dead tech for elderly users" angle is both crowded and derivative of the 2025
winner.

---

## (b) Candidates

Sixteen candidates. "Kiro fit" assumes the standard Kiro surface: `.kiro/specs/*/requirements.md`,
`design.md`, `tasks.md`, hooks on file save, steering files for protocol constants, MCP servers,
Kiro Crew review agents, and property-based tests (PBT) as the correctness gate.

### 1. Weatherfax — HF radiofax decoder and cyclone-warning reader

- **One-line pitch:** Hold a phone to a shortwave radio and watch a synoptic weather chart paint
  itself line by line, then get a plain-language cyclone warning in the local language — with no
  internet at all.
- **Dead tech:** HF radio facsimile (WEFAX / radiofax): 120 lines per minute, index of cooperation
  576, ~800 Hz frequency shift, start/stop and phasing signals, broadcast by national weather
  services for decades. Many services have shut their HF fax schedules as internet distribution took
  over.
- **Real audience/need today:** Offshore and coastal fishing fleets, small vessels, and disaster
  responders outside cellular coverage. India runs NAVTEX coastal warnings and marine weather
  services; the India NAVTEX index lists seven stations, and INCOIS publishes coastal
  nowcast/forecast products. Cyclone warnings are the difference between a fleet returning to port
  and a mass-casualty event (Cyclone Ockhi, 2017, is the canonical example).
- **3-minute demo moment:** Airplane mode on. Play a 40-second recording of a real fax transmission;
  the chart draws itself with a scan line, isobars resolving out of noise. Then an on-device model
  turns the decoded chart into "depression 300 km southwest, moving north, gale warning" in Tamil
  and English, with the decode confidence and the raw image side by side.
- **Kiro fit:** Excellent. PBT is a natural fit (encode a synthetic chart → decode → assert pixel
  agreement within tolerance, plus invariants for line length, phasing offset, and noise). Steering
  file holds WMO protocol constants; a hook runs golden-vector decode tests on every decoder edit;
  an MCP server exposes "latest chart for region" to an agent; Kiro Crew can split decoder,
  evaluator, and localisation agents.
- **Build complexity:** Medium. Pure TypeScript/WebAudio DSP: FM discriminator, AGC, PLL for
  phasing, image assembly. No SDK, no hardware purchase (sample audio only).
- **Crowding evidence:** `weather fax` = 1 global hit (a senior fax app); `navtex` = 1 hit whose
  content is unverified (page 403). No HF-fax entry in the 303-result Kiroween corpus.
- **Biggest failure risk:** Judges read it as nostalgia unless the cyclone/fisherman story lands in
  the first 20 seconds; also auto-phasing on noisy recordings is fiddly and can eat a day.

### 2. Answerback — telex over IP with proof of delivery

- **One-line pitch:** A browser telex exchange for trade finance: real ITA2/Baudot traffic, a real
  answerback handshake, and a signed, replayable delivery receipt that email cannot give you.
- **Dead tech:** Telex: 50 baud, 5-bit ITA2 (Baudot) with LTRS/FIGS shifts, 20/40 mA current loop,
  store-and-forward tape, and the WRU/"Here Is" answerback exchange that identifies the receiving
  machine.
- **Real audience/need today:** Telex is still in operation and still used in banking and trade
  confirmations partly because telex messages carry legal weight that fax and email do not.
  Commercial bridges ("Telex by Net") exist to connect modern banks to legacy telex receivers. The
  gap is an open, auditable, browser-native bridge with cryptographic non-repudiation instead of a
  proprietary gateway. (Note: "telex release" in shipping is a bill-of-lading procedure named after
  telex, not telex traffic — do not conflate the two in the pitch.)
- **3-minute demo moment:** Send a payment instruction. The terminal clatters, the answerback comes
  back `48321 ACMEIN+`, characters echo one at a time, and the receiving side shows the message
  arriving live with a delivery receipt. Then edit one character in the stored transcript and watch
  verification fail.
- **Kiro fit:** Strong and cheap. PBT for the 5-bit codec (shift-state round-trip, FIGS/LTRS edge
  cases, bell/CR/LF), specs for the answerback state machine, steering with the ITA2 table, an MCP
  tool for subscriber lookup, and a Crew "counterparty simulator" agent for end-to-end tests.
- **Build complexity:** Low. Two browser peers over WebSocket plus a tiny spool service; the hard
  part is protocol fidelity, not infrastructure.
- **Crowding evidence:** `telex` = 1 global hit, unrelated (BattleChat). Nothing in the Kiroween
  corpus.
- **Biggest failure risk:** It reads as a joke unless the legal-admissibility and trade-finance use
  case is explicit; judges may ask "why not SWIFT?" — answer with the legacy long tail, not with
  replacement claims.

### 3. Baudot Bridge — TTY/TDD calls that land on modern real-time text

- **One-line pitch:** A bridge that lets a 45.45-baud Baudot TTY reach a modern phone as live
  real-time text, so deaf callers are not locked out when the phone network goes all-IP.
- **Dead tech:** TTY/TDD: 45.45 baud, 5-bit Baudot, 1400 Hz mark / 1800 Hz space, half-duplex,
  acoustic couplers. TTYs are being retired as carriers move to IP.
- **Real audience/need today:** The FCC states plainly that real-time text (RTT) "is intended to
  replace text-telephone (TTY) technology as communications networks migrate to IP-based
  environments" (47 CFR Part 67; RFC 4103 for RTT). The people affected are deaf, hard-of-hearing,
  and speech-disabled callers, plus emergency call centres that must still accept legacy text. In
  India the equivalent gap is 112 access for deaf callers.
- **3-minute demo moment:** Type on a TTY simulator; the room fills with Baudot tones; the same
  words appear character-by-character on a phone browser. Then the reverse: a phone user types, and
  the TTY prints on paper (or a simulated roll). Finish with a 112 call flow that shows location and
  a text transcript.
- **Kiro fit:** Excellent. The codec is a PBT showcase (round-trip, char-set coverage, timing
  tolerance, half-duplex turn-taking). Specs for the call state machine, steering for the Baudot
  table and tone plan, hooks running conformance vectors, MCP tool for emergency-profile lookup.
- **Build complexity:** Medium. WebAudio modem + RTT transport; acoustic decoding needs care
  (jitter, echo, clipping).
- **Crowding evidence:** `tty` = 80 noisy hits; the only relevant one is FrankenTTY (streaming video
  over VT100), which is a different joke. No TTY/RTT accessibility entry in the Kiroween corpus.
- **Biggest failure risk:** Overclaiming emergency integration. Do not fake a PSAP connection; show
  a labelled simulator and an honest adapter boundary. Also avoid "inspiration tech" framing — this
  is accessibility, and judges will check whether disabled users were involved.

### 4. 3615 Bharat — Minitel-style videotex for feature phones

- **One-line pitch:** A 1200-baud videotex service for the hundreds of millions of Indians still on
  feature phones: dial in, type `3615`, and reach mandi prices, bus timings, health centres, and
  scheme eligibility in 40 columns.
- **Dead tech:** Minitel/TELETEL videotex: V.23 modem at 1200 bps downstream / 75 bps upstream,
  page-tree navigation, `3615` service codes. France Télécom shut it down on 30 June 2012 with
  roughly 800,000 mostly older subscribers still connected, after 20 million daily users at peak.
- **Real audience/need today:** India still has a very large feature-phone population; TechCrunch
  reported in July 2024 that millions of Indians continue to use feature phones rather than
  upgrading to smartphones. Modern "digital India" services assume a smartphone, an app, and a data
  pack. A 40-column, keyboard-driven, session-based service is a better fit for 2G, USSD, and SMS
  fallback than a React app.
- **3-minute demo moment:** The dial-up handshake beeps and the videotex page renders in mosaic
  graphics; navigate with digits only; check a mandi price and book a PHC slot; a latency readout
  shows the session running at 1200 baud while the same flow falls back to SMS. Split screen: modern
  site (4 MB) versus the same information in 2 KB.
- **Kiro fit:** Strong. Specs for a page-definition DSL; PBT for the renderer (any page tree renders
  within 40×24 and every navigable code resolves); steering for V.23 and videotex character sets;
  MCP server for content feeds; Crew agent that reviews every page for low-literacy clarity.
- **Build complexity:** Medium. The terminal and page server are straightforward; the real risk is
  the telecom edge. Build against a mock GSM modem / serial adapter and publish the adapter
  interface instead of buying a gateway.
- **Crowding evidence:** `minitel` = **0** results; `videotex` = **0** results on all of Devpost.
  Zero Minitel entries in the 303-result Kiroween corpus. Many "retro terminal" entries exist
  (ShadowScriptOS, VibeOS, PHOSPHOR VIBE POST) but they are skins, not constrained-service designs.
- **Biggest failure risk:** Without a real USSD/SMS path it can look like a website with a retro
  theme. Mitigate by making the bandwidth constraint and the SMS fallback structural, and by
  measuring payload size live.

### 5. Bang Path — store-and-forward sync for intermittent networks

- **One-line pitch:** UUCP for rural clinics: mail and records hop between nodes over whatever link
  exists, batch by batch, and survive the link dying mid-transfer.
- **Dead tech:** UUCP and bang paths (`…!district!state!clinic`), batched dial-up store-and-forward
  between machines, spool directories and hop-by-hop routing.
- **Real audience/need today:** Primary health centres, schools, and district offices with
  intermittent, metered 2G. Modern sync assumes always-on; store-and-forward assumes nothing and
  still converges. The same design is used today in offline-first and mesh deployments.
- **3-minute demo moment:** Two nodes start a batch over a simulated 2400-baud link; the link is cut
  at 60%; on reconnect the batch resumes exactly, no duplicate records, and the hop trace prints
  `…!phc-kolar!district!state`. A dashboard shows queue depth and time-to-converge for each node.
- **Kiro fit:** Excellent. PBT for idempotent replay, deduplication, and ordering under arbitrary
  cut points (a property generator over link failures is the whole test strategy). Specs for spool
  format and routing; steering for protocol limits; MCP tool to inspect queues; Crew agent as
  adversarial link simulator.
- **Build complexity:** Medium. No exotic dependencies; the work is in the queue semantics and the
  failure-injection harness.
- **Crowding evidence:** `uucp` = 1 global hit (Feem, offline file sharing — adjacent, not mail
  store-and-forward). Nothing in the Kiroween corpus.
- **Biggest failure risk:** "Why not Syncthing/email?" — needs a concrete clinic story and a
  measured convergence demo; otherwise it reads as infrastructure plumbing with no user.

### 6. Green Screen, Good Bones — 5250 terminal to typed API and mobile form

- **One-line pitch:** Point it at an IBM i green screen and get a typed API plus a mobile form
  generated from the actual 5250 fields, with every write audited.
- **Dead tech:** IBM 5250/3270 terminals: EBCDIC data streams, field attributes, function keys,
  TN5250 over telnet.
- **Real audience/need today:** IBM estimates over 100,000 organisations still run IBM i, heavily in
  manufacturing, financial services, healthcare, retail, and government (vendor estimate,
  independently **unverified**). Staff need mobile and web access without a rewrite, and the
  screen-scrape must be typed and auditable rather than a pile of coordinates.
- **3-minute demo moment:** Connect to a public IBM i host (pub400.com offers free profiles and
  documents green-screen/5250 access), capture a screen, and watch a typed form appear with labels
  and validation inferred from field attributes. Submit from a phone; the host record changes; the
  audit log shows old/new values.
- **Kiro fit:** Strong. Specs for the screen-grammar; PBT for field mapping (round-trip render →
  parse → same field map); steering with EBCDIC/attribute tables; MCP server for host sessions.
- **Build complexity:** High. 5250 data-stream parsing, EBCDIC, field attributes, and session state
  are a lot for 16 days.
- **Crowding evidence:** `3270` = 4 hits, all AI-over-mainframe agents (Mainframe Desk, FlowASM,
  CloudModern.AI). The emulator-plus-generated-API angle is less claimed, but the "AI talks to the
  mainframe" story is taken.
- **Biggest failure risk:** Build risk is the highest on this list, and the demo depends on a public
  host's availability and terms. Enterprise-software framing also tends to lose Design points.

### 7. Slash — Lotus 1-2-3 keyboard grammar for spreadsheets

- **One-line pitch:** A keyboard-first spreadsheet layer that brings back the 1-2-3 slash menu and
  `@` functions, because a screen reader cannot navigate a modern ribbon.
- **Dead tech:** Lotus 1-2-3 menu grammar (`/WCS`, range anchoring with `.`), `@SUM`-style
  functions, WK1 files. IBM ended support for the final build in 2014.
- **Real audience/need today:** Accountants, BPO data-entry teams, and blind/low-vision users.
  Modern spreadsheets are mouse-and-ribbon heavy; keyboard command grammars are faster and far more
  screen-reader friendly than grid navigation with a virtual cursor.
- **3-minute demo moment:** Type `/WCS20` and watch the column widen; anchor a range with `.` and see
  the highlight extend; run a 20-task data-entry benchmark with and without the grammar, on screen
  and through a screen reader, and show the time and error delta.
- **Kiro fit:** Good. Specs for the command tree; PBT for the parser (any command sequence yields a
  deterministic sheet state, no ambiguous prefixes); steering with the 1-2-3 command map; hooks
  running grammar conformance tests.
- **Build complexity:** Low–medium. The grammar and a small sheet engine are enough; do not build a
  full spreadsheet.
- **Crowding evidence:** `lotus 1-2-3` = 55 noisy global hits, none visibly a keyboard-grammar
  revival; nothing in the Kiroween corpus. Treated as **unverified** until the hits are read.
- **Biggest failure risk:** "Excel already has shortcuts." The accessibility measurement has to be
  real, ideally with a screen-reader user, or the pitch collapses into retro UI.

### 8. Reveal — WordPerfect-style reveal codes for contracts

- **One-line pitch:** A contract editor that shows every hidden formatting code, so a defined term
  cannot silently change font, and a clean DOCX comes out the other end.
- **Dead tech:** WordPerfect's Reveal Codes, a character-level formatting stream that made layout
  debuggable. Premise caveat: WordPerfect is still sold, so the "dead" claim is weak — the *reveal
  codes interaction* is what died, not the product.
- **Real audience/need today:** Law firms, courts, and government drafting shops still exchange
  WordPerfect documents, and hidden formatting is a real source of corrupted contracts and
  last-minute filing errors.
- **3-minute demo moment:** Paste a 40-page contract, hit Reveal, and watch rogue font and spacing
  codes appear inline. Delete one code; the numbering repairs itself; the redline shows what
  changed; export a clean DOCX and a PDF that match.
- **Kiro fit:** Good. Specs for the code model; PBT for round-trip (parse → edit → render preserves
  all visible text and numbering); steering for WordPerfect code semantics.
- **Build complexity:** Medium. DOCX internals and numbering are fiddly.
- **Crowding evidence:** `wordperfect` = 5, all in the legacy-file-conversion lane (Exhume, The Last
  Save, Ctrl-R, Ouija). Adjacent and crowded-ish; `wordstar` = 2 (same entries).
- **Biggest failure risk:** Judges may call it a feature, not a resurrection, and the "dead tech"
  premise is genuinely shaky.

### 9. Graffiti One — single-stroke text entry for tiny and gloved hands

- **One-line pitch:** Palm's Graffiti alphabet, rebuilt for watches, AR glasses, and gloved
  industrial hands: one stroke per character, trained on your own handwriting.
- **Dead tech:** Palm Graffiti (1996), a single-stroke shorthand alphabet; Palm OS is discontinued.
- **Real audience/need today:** Smartwatch and AR text entry, cold-weather/industrial gloves,
  one-handed use while carrying, and motor-impaired users who find tap keyboards painful.
- **3-minute demo moment:** A watch-sized canvas; draw `h`, `e`, `l`, `l`, `o`; text appears at
  ~30 wpm with a per-stroke confidence bar; deliberately draw a sloppy `e` and show the
  top-3 correction strip rather than a wrong guess.
- **Kiro fit:** Good. PBT for the recogniser (translation invariance, resampling invariance, scale
  bounds); specs for the stroke pipeline; steering with the Graffiti stroke table; hooks running an
  accuracy suite.
- **Build complexity:** Medium. A $1-recogniser variant plus resampling is enough; accuracy tuning is
  the time sink.
- **Crowding evidence:** `palm pilot` = 46 noisy hits; `graffiti` = 226 mostly street-art hits. No
  Palm Graffiti entry visible in the Kiroween corpus.
- **Biggest failure risk:** Live recognition demos fail visibly; impact is modest compared with the
  protocol candidates.

### 10. Line 21 — recover captions trapped in analog video

- **One-line pitch:** Pull the closed captions out of old VHS and broadcast tapes by decoding Line
  21 directly, then align them to the digitised video as a searchable transcript.
- **Dead tech:** EIA/CEA-608 captions carried on line 21 of the analog vertical blanking interval;
  analog TV shut off, and most modern tools ignore the VBI entirely.
- **Real audience/need today:** Public-access TV, community broadcasters, archives, and courts that
  hold old tapes. The captions exist but are invisible to current pipelines, so public meetings and
  local news become unsearchable and inaccessible.
- **3-minute demo moment:** Drop in a grainy VHS capture; the waveform view shows the line-21 pair;
  captions stream out with parity checks; the video plays with captions overlaid; search "budget"
  and jump to the moment.
- **Kiro fit:** Good. PBT for bit-pair/parity and control codes; specs for the caption channel;
  steering with the CEA-608 code table.
- **Build complexity:** Medium–high. Frame-accurate video access plus waveform slicing and timing
  alignment.
- **Crowding evidence:** `closed caption` = 158 noisy hits; the relevant one is StagePulse (live
  captions), which is modern captioning, not VBI recovery. Nothing in the Kiroween corpus.
- **Biggest failure risk:** Needs real tapes to be credible, and judges may not feel the urgency of
  archive accessibility in a 3-minute video.

### 11. Fiche — a human-readable archival format

- **One-line pitch:** A digital microfiche: hundreds of pages of microtext plus a metadata header on
  one printable sheet, readable with a phone camera and no software at all.
- **Dead tech:** Microfiche/microfilm and the readers that went with them. Fiche is still the
  long-term archival medium of record for newspapers, land records, and court files.
- **Real audience/need today:** Archives and registries facing a century-scale retention duty.
  Digital formats rot and depend on software; fiche survives with a lens and daylight.
- **3-minute demo moment:** Take a 200-page land record, render it to a single fiche sheet, print it
  on A4 transparency, then read a page back with a phone camera at high zoom and OCR it. Show the
  checksum header recovering a damaged page.
- **Kiro fit:** Medium. Specs and PBT for encode/decode with OCR-tolerance (simulate blur, rotation,
  cropping); MCP for archive ingest.
- **Build complexity:** High. Microtext rendering plus robust optical decoding is a research-grade
  problem for 16 days.
- **Crowding evidence:** `microfiche` = 2 (OpenFiche — an academic search engine, not a fiche
  format; a library booking app). Nothing in the Kiroween corpus.
- **Biggest failure risk:** The optics. A phone camera cannot resolve true microtext without a lens,
  and buying hardware is out of scope; the demo can fail physically.

### 12. Filmstrip FM — audio-advanced lessons for low-bandwidth classrooms

- **One-line pitch:** Bring back the filmstrip advance beep: one audio lesson, printed frames, and a
  phone that advances the page on the tone — no screen, no data.
- **Dead tech:** Filmstrip projectors and slide-tape kits that advanced frames on a 50 Hz beep, plus
  the radio-and-print "schools of the air" model.
- **Real audience/need today:** Community radio, IVR lessons, and schools where one phone serves a
  class. Audio plus printed frames is resilient, cheap, and works with no connectivity.
- **3-minute demo moment:** Play a lesson through a phone speaker; the printed sheet's page number
  jumps on the beep; a child follows along. Then show the same audio over a phone call (IVR) with
  DTMF as a manual advance.
- **Kiro fit:** Good. PBT for beep detection under noise and speed drift; specs for the lesson
  manifest; steering with tone/duration constants.
- **Build complexity:** Low.
- **Crowding evidence:** No hits found for the concept in the Kiroween corpus or term queries; this
  is **unverified as globally novel**.
- **Biggest failure risk:** It can look like a craft project. Without a real curriculum partner or a
  measured learning outcome, impact scores low.

### 13. Punch — a time clock for informal labour

- **One-line pitch:** A shared-site punch clock with SMS receipts, so a construction or domestic
  worker has evidence of hours that a contractor cannot quietly edit.
- **Dead tech:** The mechanical time clock and the rack of punch cards.
- **Real audience/need today:** Informal labour and wage theft. Attendance is often a paper register
  held by the employer, which is exactly the party with an incentive to alter it.
- **3-minute demo moment:** A worker punches with a short code at a shared site device; an SMS
  receipt arrives with a signed timestamp; the contractor's edit attempt is rejected and flagged;
  month-end exports hours that reconcile with the worker's own receipts.
- **Kiro fit:** Good. PBT for hour maths (overtime, night shift, month boundaries, DST-free IST
  assumption), specs for the receipt chain, MCP for the SMS gateway, hooks for tamper tests.
- **Build complexity:** Low–medium.
- **Crowding evidence:** `punch clock` = 35 noisy hits (Loom/Jacquard, job-search apps). Punch cards
  are taken (PunchRevive) but that is IBM card decoding, a different idea.
- **Biggest failure risk:** Identity and privacy without hardware; and judges may file it as HR SaaS
  rather than resurrection.

### 14. Kid Pix Reborn — creative software for children that is not a funnel

- **One-line pitch:** Kid Pix, rebuilt offline for tablets: giant tools, a stamp that explodes, an
  undo that is funny, no account, no ads, no telemetry.
- **Dead tech:** Kid Pix (Craig Hickman, 1989) and MacPaint; both discontinued as products.
- **Real audience/need today:** Parents and primary schools tired of subscription creative apps that
  harvest attention. A local-first, offline art tool with no account is a real product gap.
- **3-minute demo moment:** A child (or the presenter) draws with a wacky brush, stamps a field of
  dinosaurs, hits the funny undo, and exports a flipbook animation; airplane mode stays on the whole
  time.
- **Kiro fit:** Medium. Specs for the tool model; PBT for the undo stack (any sequence of
  draw/undo/redo returns to a deterministic canvas hash); steering for UI rules (target size,
  contrast, no timed prompts).
- **Build complexity:** Low–medium.
- **Crowding evidence:** `kid pix` = 53 noisy hits, no clear revival in the Kiroween corpus.
- **Biggest failure risk:** Impact is soft for a hackathon judged on real problems, and Design
  expectations for a kids' product are high.

### 15. Tape Reader — decode paper-tape programs for old machine tools

- **One-line pitch:** Photograph a punched paper tape and get back the G-code, with a 3D toolpath
  simulation, so a 1970s CNC machine can run its own programs again.
- **Dead tech:** Punched paper tape for NC/CNC (8-channel EIA RS-274/ISO, and 5-channel Baudot
  teletype tape), read by mechanical readers that no longer work.
- **Real audience/need today:** Job shops, technical colleges, and railway/defence workshops sitting
  on machines whose only program source is a tape in a drawer.
- **3-minute demo moment:** A phone photo of a tape; sprocket detection; holes decode to G-code; the
  toolpath draws in 3D; the same program is drip-fed to a machine emulator and cuts a part.
- **Kiro fit:** Good. PBT for tape encode/decode (synthetic tapes with holes, skew, missing
  sprocket), specs for the reader pipeline, steering with EIA/ISO code tables.
- **Build complexity:** High. Optical hole detection under uneven lighting is unforgiving.
- **Crowding evidence:** Punch cards are taken (PunchRevive); paper tape specifically is not visible
  in the Kiroween corpus. **Unverified** beyond that.
- **Biggest failure risk:** Needs physical tapes and a camera rig; synthetic tapes make the demo look
  staged, and the optical pipeline can consume the whole budget.

### 16. Bubble — phone-camera OMR for paper exams (crowded — avoid)

- **One-line pitch:** Photograph a stack of answer sheets and grade them in seconds, with item
  analysis and double-mark detection, for schools that will never own a scanner.
- **Dead tech:** Scantron-style optical mark recognition sheets, in decline in US districts (The
  Atlantic, 2023: "The End of Scantron Tests").
- **Real audience/need today:** Indian schools and coaching centres that still run paper tests and
  have no scanning hardware.
- **3-minute demo moment:** Fan 30 sheets, photograph them in one shot, watch bubbles resolve into a
  score table with a per-question difficulty chart.
- **Kiro fit:** Good (PBT for bubble geometry and thresholding).
- **Build complexity:** Medium.
- **Crowding evidence:** `scantron` = 13 global hits including Testduino, digiTron, Scanify,
  ParseTron, Pupil. Contested and commoditised.
- **Biggest failure risk:** Crowding and accuracy under bad lighting. Listed mainly as a warning.

---

## (c) Ranked top 5

Ranking weighs the five judging axes equally, then discounts for 16-day build risk for a small team
with no hardware budget.

1. **Weatherfax** — best demo on the list (audio becomes a weather chart, offline), genuine Indian
   coastal-cyclone need, zero crowding (`weather fax` = 1, `navtex` = 1 unverified), and a pure
   codec core that makes PBT and Kiro specs look inevitable. Build risk is contained to DSP tuning.
2. **Answerback (telex)** — highest innovation-per-hour. Real legal/non-repudiation niche, a
   distinctive answerback demo, and the lowest build complexity of the top five. Risk is tonal:
   the pitch must establish the trade-finance use case in the first 15 seconds.
3. **Baudot Bridge (TTY → RTT)** — highest social impact and a clean, citable regulatory premise
   (FCC: RTT is intended to replace TTY; 47 CFR Part 67). Medium build risk; accessibility claims
   must be honest and tested with real users, not asserted.
4. **3615 Bharat (Minitel)** — the only completely unclaimed dead technology I found (`minitel` = 0,
   `videotex` = 0), with a strong India fit and a structural constraint (1200 baud, 40 columns) that
   makes the design defensible instead of decorative. Main risk is the telecom edge; build against a
   mock gateway.
5. **Bang Path (UUCP)** — the most intellectually honest "resurrect a protocol" entry, with a
   failure-injection demo that PBT can drive end to end. Impact is credible but abstract; it needs a
   named clinic/school partner story to beat the top four on the Impact axis.

Just outside: **Green Screen, Good Bones** (highest enterprise impact, highest build risk),
**Slash** (cheapest path to a Design/accessibility story), **Line 21** (strong archive story, needs
tapes).

---

## Crowding warnings

1. **"Resurrect dead code" is the single largest cluster in the corpus** — roughly 40 of 303 titles
   (Lazarus, NecroSpec, NecroVM, RepoNecromancer, CodePhoenix, Gravekeeper, Necromancer, Code
   Archaeologist, Dev100x, RhinoKiro, and others). A Resurrection entry that means "revive a legacy
   repository" is competing with dozens of near-identical pitches and will not stand out.
2. **Retro *skins* are saturated.** VibeOS, ShadowScriptOS, necrOS, PHOSPHOR VIBE POST,
   Necro-Net Navigator, Retroweb, 90s Website Generator, and PhantomForge all sell the same CRT/90s
   look. Any candidate whose only modern twist is a terminal font and scanlines will lose Innovation
   and Design simultaneously. The survivors in this lane are the ones with a real constraint (e.g.
   teletext's 40×24 page, Minitel's 1200 baud).
3. **These specific dead technologies already have multiple entries this year:** teletext (9+,
   19 global hits), HyperCard (4+ in corpus, 15 global), BBS/dial-up boards (6+ in corpus, 57
   global), RSS/Google Reader (7 in corpus), GeoCities (6+), Yahoo Pipes (2), cassette/mixtape (3),
   floppy (2), COBOL (3+), MySpace (2), IRC (2), punch cards (1), ELIZA (1), Encarta (1), InfoPath
   (1), CORBA (1). Do not enter any of these without a materially different mechanic.
4. **DBF/dBase and Scantron/OMR are already claimed** by phantombase/RETABLE and
   Testduino/digiTron/Scanify/ParseTron respectively. Both were plausible candidates before this
   sweep and should be dropped.
5. **Counts are noisy.** Global Devpost counts such as `pager` = 327, `irc` = 292, `graffiti` = 226,
   `closed caption` = 158, `gopher` = 158 are full-text matches, not topic counts. Only the
   small-number results (telex 1, minitel 0, videotex 0, navtex 1, uucp 1, microfiche 2) are reliable
   as crowding signals.

---

## URLs actually loaded

Devpost:

- https://devpost.com/software/search?query=teletext
- https://devpost.com/software/search?query=kiroween&page=1 … `&page=13` (13 loads, 303 results)
- https://devpost.com/hackathons?query=kiroween
- https://kiroween.devpost.com/project-gallery (gallery unpublished)
- https://kiroween-2026.devpost.com/project-gallery (404)
- https://devpost.com/software/search?query=telex
- https://devpost.com/software/search?query=minitel
- https://devpost.com/software/search?query=pager
- https://devpost.com/software/search?query=palm%20pilot
- https://devpost.com/software/search?query=lotus%201-2-3
- https://devpost.com/software/search?query=wordperfect
- https://devpost.com/software/search?query=wordstar
- https://devpost.com/software/search?query=dbase
- https://devpost.com/software/search?query=fortran
- https://devpost.com/software/search?query=kid%20pix
- https://devpost.com/software/search?query=scantron
- https://devpost.com/software/search?query=3270
- https://devpost.com/software/search?query=uucp
- https://devpost.com/software/search?query=microfiche
- https://devpost.com/software/search?query=navtex
- https://devpost.com/software/search?query=weather%20fax
- https://devpost.com/software/search?query=tty
- https://devpost.com/software/search?query=graffiti
- https://devpost.com/software/search?query=punch%20clock
- https://devpost.com/software/search?query=videotex
- https://devpost.com/software/search?query=closed%20caption
- https://devpost.com/software/search?query=teletype
- https://devpost.com/software/search?query=navtext
- https://devpost.com/software/search?query=gopher
- https://devpost.com/software/search?query=usenet
- https://devpost.com/software/search?query=irc
- https://devpost.com/software/search?query=bbs
- https://devpost.com/software/search?query=hypercard
- https://devpost.com/software/navtext (403 — content unverified)

Search result pages (evidence for the real-world need claims; snippets only, target pages not
opened):

- https://lite.duckduckgo.com/lite/?q=telex%20still%20used%20legally%20shipping%20maritime
- https://lite.duckduckgo.com/lite/?q=%22telex%22+still+in+use+2025+network+shipping+insurance
- https://lite.duckduckgo.com/lite/?q=INCOIS+NAVTEX+weather+fax+broadcast+fishermen+India
- https://lite.duckduckgo.com/lite/?q=FCC+real-time+text+RTT+replacing+TTY+rules
- https://lite.duckduckgo.com/lite/?q=Minitel+shut+down+2012+subscribers+peak
- https://lite.duckduckgo.com/lite/?q=IBM+i+AS/400+installed+base+2025+count
- https://lite.duckduckgo.com/lite/?q=Lotus+1-2-3+discontinued+end+of+support
- https://lite.duckduckgo.com/lite/?q=India+feature+phone+users+million+2024+2G+only+subscribers
- https://lite.duckduckgo.com/lite/?q=Scantron+bubble+sheet+discontinued+schools
- https://lite.duckduckgo.com/lite/?q=pub400+free+public+AS/400+telnet+demo

Key sources seen in those results, not independently re-read: fcc.gov/real-time-text and
47 CFR Part 67 (RTT replaces TTY), hydrobharat.gov.in/navtex-warnings and ilma.watch (India NAVTEX,
7 stations), change2100.com "KTT History and ACRB's Usage 2025" (Telex-by-Net in banking),
theregister.com (Lotus 1-2-3 support ended 2014), TechCrunch 2024-07-13 (India feature phones),
The Atlantic 2023 (decline of Scantron), pub400.com (free IBM i host with 5250 access),
as400ibmsystems.com (IBM i ~100k organisations — vendor estimate, unverified).

## Unverified items

- The exact Kiroween 2026 submission count and category split (gallery unpublished).
- The content of "NavText" (project page returned 403) — possible direct overlap with Weatherfax.
- Whether any Kiroween entry already uses telex, Minitel, UUCP, or HF fax; the corpus search found
  none, but the corpus is a query approximation.
- Microfiche archival-life claims, IBM i installed-base figures, and Indian feature-phone population
  figures (all from snippets, not primary documents).
- Whether "Lotus 1-2-3" and "Kid Pix" global hits contain a relevant revival; counts are noisy and
  titles were not read for those two queries.
