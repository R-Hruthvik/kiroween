# Frankenstein — topic research for Kiroween 2026

Researched 18 November 2026. All web access through one real browser tab (Devpost search, the
Kiroween Devpost site, MDN, build.fhir.org, aprs.fi, gs1.org, Wikipedia). No other HTTP path used.

Companion doc: `docs/research/resurrection.md` covers the **Resurrection** category (dead tech
revived). This doc covers **Frankenstein** — *stitching incompatible technologies into one app*.
Read both before picking: several Frankenstein ideas below collide with Resurrection candidates.

---

## 0. Contest reality check (verified this session)

| Fact | Value | Source |
|---|---|---|
| Site | `https://kiroween.devpost.com/` | loaded |
| Participants | 16,120 | site |
| Prize pool | $100,000 cash | site |
| Deadline | **Dec 5 2026, 03:30 GMT+5:30** (= Dec 4, 11:59pm PT). Site said "17 more days" | site |
| Categories | Resurrection, **Frankenstein**, Skeleton Crew, Costume Contest | gallery filter labels |
| Bonus prizes | Blog Prize, Social Blitz Prize | gallery filter labels |
| Sponsor prizes | Best Startup, Best Ghost of Kiroween Past, Best Kiro Crew App, Best Student Project ×3 | gallery filter labels |
| Project gallery | **NOT PUBLISHED** — "The hackathon managers haven't published this gallery yet" | `kiroween.devpost.com/project-gallery` |

Because the gallery is unpublished, there is **no authoritative submission list**. Crowding below is
measured from Devpost full-text search, which undercounts and over-matches. Treat every count as a
lower bound on noise, not a headcount.

### Method limits

- Devpost's search is token-fuzzy, not boolean. `fhir` returns 1,691 hits dominated by unrelated
  healthcare apps; `dmx` returns 21. Counts rank *order of magnitude of crowding*, nothing more.
- I read 7 pages of `kiroween` + `frankenstein kiroween` and de-duplicated to **135 distinct
  project slugs**. That is the best available "taken this year" set. Some Kiroween entries will be
  missing from it (the sibling doc's `kiroween` sweep found 303 raw results).
- Anything I did not load a page for is marked **unverified**.

---

## 1. Crowding sweep

22 queries, each one page load. Counts are Devpost global full-text, 18 Nov 2026. "Kiroween?" marks
entries I could tie to this year's pool.

| Query | Count | Kiroween? | First hits (abridged) |
|---|---|---|---|
| `necrovm` | 1 | **yes** | NecroVM-8080: Resurrection Micro-VM & State Engine |
| `frankenstein` | 262 | **yes** | Lantern Path, Warung Digital, PaperPatch, Rehearsal, **Stitched Ledger** ("Kiroween 2026 — Frankenstein"), Gloam Hollow, Hearth |
| `crt` | 343 | **yes** | Ghost Run, **GhostBBS**, **RetroTelnet-AI**, Runs As Knitted, Christmas.exe, **Lectern of the Dead** (CRT terminal), **NecroCore** |
| `terminal` | 9,345 | **yes** | **Skeleton Core**, **GhostBBS**, Mainframe Desk, ScriberSpace, **CANDefend**, Bangs, Promesses Fantômes |
| `retro` | 2,972 | **yes** | Moonrise Mini Golf, **GhostBBS**, AL HUEVO, cyber_safety_quest, NYSUS, **RetroTelnet-AI**, **Necropolis: GeoCities Reborn** |
| `arduino` | 15,977 | no | Seismic ×2, StoveGuard, HeatSense, Meme Button, Split 2nd, SitSync |
| `midi` | 991 | no | ControlX, Neon Band, Monster Puppet Theater, StudioSphere VR, Piano Pal, VRvaldi, Face the Music, Beatopia |
| `dmx` | **21** | no | DMXtra (wireless DMX controller), InnerOS FieldOps, DMXReady, MOTIF, ProLight AI, FlowSim Pro, GenAI Theater |
| `osc` | 239 | no | StudioSphere VR, ChartAttack, myPhoneVision, Signal2Speech, QNX-PulseScope, AlcoSense, OsciAudioXR, Cuarto Oscuro |
| `hl7` | 536 | no | Escriba, patient360, Synaphi, SafeMeds 3D, WARD-GUARD, VITA, Alwarid Graph, Alwarid |
| `fhir` | 1,691 (noisy) | no | SilentPulse, MedVision AI, Ragnor, care navigator, Escriba, Starter Cap, Chronical, hospital-twin |
| `3270` | **4** | no | **Mainframe Desk** (Jira→mainframe), CloudModern.AI, FlowASM, PersuAIsion |
| `plotter` | 93 | no | BET ProjectHub, linegrade, Function Plotter, CascadeShield Rx, Ember ×2, Parts Ledger, deixis |
| `braille` | 606 | **yes** | TactiMath-Engine, Passalong, GraphEar, **BrailleBridge** ("Words in, Braille out"), Story Bricks, TagAlong, Hearth, Second Look |
| `timecode` | 75 | no | ReelMind, footage-selects, CineVault AI, Nexus Footage Line Finder, Timeline skill, Continuity Check, Footage Paper Edit, First Ten Seconds |
| `ebcdic` | **8** | **yes** | **AuraGate** (ISO-8583/EBCDIC → OpenAPI 3.1 + TS SDK), UI Fraud Agent, Legacy Lens, Anathis, LegacyBridge AI, **PunchRevive** ×2, EnduroASP AX |
| `barcode` | 2,161 (noisy) | no | PantryPilot, Baskt, Greenspot, NutriLens, Autonomous Pantry Agent, PantryHelper, My Pantry, Prevue |
| `telegraph` | 72 | **yes** | Doodle Duel, Trancespace, **Totally Brand New Telegraph Machine**, Arbya Chat, Squatopia 2, **Telegraph Academy** (Morse), Orvandel, Lintel |
| `oscilloscope` | 168 | no | GraphiteCAD (pencil→vector), GridWhisper, Experimenters Circuits, Life band, TraceGate, OhmSight AR, FluencyPulse, QNX-PulseScope |
| `thermal printer` | 69 | no | TraceGate, QuickBill (WebBluetooth POS), PartsPilot, HaurgeulisDev, RoopM, DroneX, Dayprint, Fabyn |
| `telex` | **1** | no | BattleChat (unrelated advertising project) |

### Taken this year — the 135-slug corpus

Grouped by the pair each entry fuses. **Bold = direct collision risk for the candidates below.**

| Fused pair | Entries in the 2026 pool |
|---|---|
| Retro terminal / CRT | **The Necro-Oracle** (CRT, Game Boy green), **Lectern of the Dead** (CRT study assistant), Dinosaur Survival MUD 3D (CRT MUD + Three.js), necrOS |
| BBS / telnet / IRC | GhostBBS, **RetroTelnet-AI**, afterlight-bbs, **Séance** (IRC 1988 as agent control room), Spindle |
| Cassette / tape | TapeBack, **Ghost Deck**, Spec-Tape |
| Floppy / disk | Graveyard Shift — Floppy Recovery Lab, burn2disk |
| HyperCard | **GhostDeck**, Stackyard, HyperCard revivals |
| Teletext / Ceefax | **Teleteks** |
| Punch cards | **PunchRevive** |
| Mainframe wire formats | **AuraGate** (ISO-8583 / EBCDIC buffer → OpenAPI + SDK), Mainframe Desk (3270-adjacent) |
| COBOL / ABAP | **COBOL Phoenix**, Kiro-Powered SAP Resurrection, RhinoKiro |
| Industrial fieldbus | **BusLink Studio** (Modbus / RS485 workbench, file slug literally `plc-frankenstein-one-ai-agent-many-plcs`), **GhostBridge** (old building signals), **CANDefend** (CAN bus lab) |
| Audio modem | **Handshake** (browser modem, two tones, phone-to-phone) |
| Sports data formats | **Kaiord** ("stitches incompatible sports data formats FIT/TCX/ZWO into unified JSON") |
| Spreadsheet + VCS | **FrankenSheet**, SpecterSheet |
| RSS / feed revival | NightRiver, GhostFeed, Revenant Reader, Haunted Feeds, Midnight Gazette |
| Yahoo Pipes | Revenant |
| DOS game | CivKiro 1991 |
| InfoPath | InfoPath Afterlife |
| Tamagotchi | TamaGhosty |
| API testing + Atari 2600 | Kiro_Hack |
| Git → music | GitSymphony |
| Braille | **BrailleBridge** |

### Three crowding warnings

1. **"Dead thing → modern schema/UI" is the dominant shape, not the exception.** AuraGate, Kaiord,
   COBOL Phoenix, COBOL→Python, InfoPath Afterlife, PunchRevive, Teleteks, GhostDeck and GhostDeck's
   neighbours all run the same play: *old artifact in, modern artifact out, ledger of evidence*.
   A Frankenstein entry built on "parse legacy wire format, emit JSON, prove it" will read as the
   seventh entry in that line — even if the wire format is novel.
2. **Every obvious "old interface" is already claimed.** Fax, rotary pulse dial, cassette, floppy,
   punch card, teletext, CRT terminal, BBS, IRC, Morse key, Modbus/RS-485, CAN bus, BACnet-ish
   building signals, HyperCard, GeoCities, braille, EBCDIC, COBOL. There is no cheap win left in the
   "revive a dead object" aisle.
3. **The open ground is in *live* incompatible transports and *cross-domain semantics*, not dead
   artifacts.** Nothing in the 135 touches MIDI, OSC, DMX/Art-Net, SMPTE timecode, HL7 v2 mapping,
   ASTM lab serial, HPGL, POCSAG, APRS, SWIFT MT, ISO 20022, MARC21, XMODEM, ZPL or pneumatic-tube
   logistics. Those are the unclaimed pairs.

---

## 2. Candidates

Ranked by (demo strength × unclaimed ground × buildability in 16 days). ★ = top 5.

Every candidate assumes: browser-first, no hardware purchase, Kiro IDE with
`.kiro/specs/*/{requirements,design,tasks}.md`, steering files, hooks, an MCP server, and PBT as the
correctness gate. Judging is 20% each on Impact, Kiro depth, Design, Innovation, Presentation.

---

### ★ 1. CueForge — one cue engine for light, sound, and timecode

- **Pitch:** Describe a show in one sentence; CueForge compiles it into a synchronised cue stack that
  drives DMX lighting, MIDI synth, and video timecode from a single clock — then survives a dropped
  packet on stage.
- **Incompatible pair:** Three entertainment-control protocols that were never meant to share a
  clock — **DMX512 / Art-Net** (512 channels per universe, 8-bit levels, RS-485 or UDP, refresh-rate
  driven), **MIDI 1.0** (7-bit values, 16 channels, note/CC semantics, USB or 5-pin DIN), and
  **OSC** (float32, bundle timetags, UDP, no fixed schema). Bolted together by **SMPTE LTC**
  (audio-frequency timecode) as the single source of truth.
- **Why the fusion is useful:** This is real show-control work. Theatres, escape rooms, museums and
  live venues pay for proprietary cue engines (QLab, ETC) precisely because gluing lighting, audio
  and video to one clock is hard. Value model differs per protocol (DMX needs per-universe packing
  and 512-channel frames; MIDI needs 14-bit CC pairs for fine resolution; OSC needs timetag bundles),
  which is exactly where hand-rolled rigs break.
- **3-minute demo:** Type "thunderstorm cue, 40 seconds". Watch a cue stack materialise; lights
  chase across a 3D venue, a synth pad swells, video scrubs. Then kill the Art-Net socket mid-cue:
  the LTC clock keeps running, the engine resyncs on the next packet, and the audit strip shows the
  frame it dropped and recovered from.
- **Kiro fit:** Very strong. EARS requirements per protocol adapter; steering file holds DMX universe
  map and MIDI CC assignments; **PBT is the natural gate** — properties like "no channel value
  outside 0–255", "every cue resolves to a total order", "packing a 512-channel frame and unpacking
  it is identity", "a cue with a missing fixture degrades, never throws". Hook runs conformance on
  every adapter edit. Add an MCP server so an agent can query the current cue state.
- **Build complexity:** Medium-high. Three adapters + a scheduler + a visualiser. Cut scope by
  shipping Art-Net to a *simulated* node in the same page (canvas venue + WebAudio synth), and make
  real-hardware output an optional path.
- **Crowding:** `dmx` = 21 global hits, none in the Kiroween pool; `osc` and `midi` hits are all
  music/VR toys. **No entry in the 135 fuses control protocols.** Lowest-crowding high-wow option.
- **Biggest risk:** Scope. Three protocols plus a visualiser plus AI is a lot for 16 days — pick
  Art-Net + MIDI + LTC and drop OSC, or the demo will be three half-working tabs.

---

### ★ 2. TubeMQ — a hospital pneumatic tube system that is honestly a message queue

- **Pitch:** Model a 1950s pneumatic tube network as the distributed system it actually is: capsules
  are messages, stations are consumers, jams are backpressure, and misroutes are at-least-once
  delivery gone wrong.
- **Incompatible pair:** **Pneumatic tube transport** (physical capsules, blowers, diverter valves,
  station send/receive, no ordering guarantee across branches) against **modern queue semantics**
  (SQS/Kafka: visibility timeout, dead-letter queue, idempotency keys, consumer lag, priority).
- **Why the fusion is useful:** Hospitals genuinely run these networks for labs, pharmacy and blood
  bank, and their real failure modes — a jam, a capsule sent to the wrong station, a duplicate
  specimen — map exactly onto queue bugs that engineers reason about badly because they are
  invisible. Making the queue physical makes the failure legible. Also a credible teaching and
  capacity-planning tool for lab logistics.
- **3-minute demo:** Fire 40 lab samples at once. A diverter jams; the visualiser shows backpressure
  building into a queue; the retry policy re-sends and produces a **duplicate capsule** at the lab
  station. Flip on idempotency by specimen ID and the duplicate collapses. Then a STAT cardiac
  troponin jumps the queue and the audit trail proves it did.
- **Kiro fit:** Strong and unusual. EARS specs per station behaviour; PBT on the invariants that
  actually matter ("no capsule is lost", "per-station FIFO is preserved", "every capsule is delivered
  at least once", "priority never starves the default lane"). Hooks re-run the invariant suite when
  the routing table changes. A Crew reviewer can play adversarial sender.
- **Build complexity:** **Low-medium.** Pure deterministic TypeScript simulation + canvas/SVG. No
  device, no network, no external API. This is the safest build in the list.
- **Crowding:** Zero. Nothing in the 135 corpus models a physical process as software semantics.
  `arduino`/`hardware` searches return unrelated IoT projects.
- **Biggest risk:** Judges score it a game or a toy — Impact (20%) takes the hit. Mitigate by opening
  on the hospital specimen story and showing the queue metrics, not the animation.

---

### ★ 3. LipiSetu — resurrect text trapped in pre-Unicode Indian fonts

- **Pitch:** Paste the mojibake Hindi that Indian courts, gazettes and print archives are full of;
  get clean Unicode Devanagari back, then translate it — with the mapping proven by round-trip tests.
- **Incompatible pair:** **Legacy 8-bit glyph-mapped Indian DTP encodings** (Kruti Dev, Chanakya,
  Shree Lipi, and **ISCII**, which carries code pages for 12 Indic scripts) against **Unicode
  clusters** and modern LLM tokenisation. In legacy fonts the byte pair `fd` means the conjunct `क्`;
  Unicode has no such correspondence, and one legacy glyph can expand to three codepoints.
- **Why the fusion is useful:** A very large share of Indian government, court, and newspaper archives
  exists only in these fonts, where copy-paste produces garbage and search is impossible. ISCII is a
  real national standard with per-script code pages, so this is a defined engineering problem, not a
  guess. Any tool that migrates it correctly unlocks search, translation, and accessibility for
  material that is currently unindexable.
- **3-minute demo:** Paste a paragraph of Kruti Dev from a court PDF — unreadable Latin. One click:
  clean Devanagari, with a per-character provenance highlight showing which legacy byte produced which
  cluster. Then translate to English and back, and show the round-trip test count in the corner
  ticking upward as the mapping table is edited live.
- **Kiro fit:** Excellent, and the best PBT story on this list. Properties: decode(encode(x)) == x for
  a corpus of conjuncts; no output codepoint outside the target script; nukta/virama ordering is
  stable; unknown glyphs never silently drop. Steering file holds the codepage tables; hooks run the
  corpus on every mapping edit; an MCP server exposes "convert" as a tool agents can call.
- **Build complexity:** Medium. Mapping tables are the work; the UI is small. Risky conjuncts are
  enumerable and testable, which suits the schedule.
- **Crowding:** Zero in the 135 corpus. `braille` and `ebcdic` sweeps show the team is not alone in
  wanting encoding work, but nobody has taken Indic legacy fonts. India-based team = authentic
  advantage on judging Impact.
- **Biggest risk:** Mapping-table completeness. One wrong conjunct in a demo sentence is visible to
  any Hindi speaker on the panel. Start from an open mapping table, and gate the demo on the tested
  corpus, not on arbitrary input.

---

### ★ 4. LabBridge — the serial port on a 1990s lab analyser, speaking FHIR

- **Pitch:** Replay what a chemistry analyser actually sends down its RS-232 cable, parse it, and
  emit a validated FHIR R4 Observation bundle — with the raw bytes and the mapping both visible.
- **Incompatible pair:** **ASTM E1381/E1394 over serial** (byte-stuffed frames, 1-char checksums,
  query/response handshaking, no schema, results as positional fields) joined to **HL7 v2** (pipe
  and caret delimited, `MSH-2` declares its own escape characters, repeating fields) and then to
  **FHIR R4** (a resource graph with coded values, references, and profiles).
- **Why the fusion is useful:** Hospital labs still run serial analysers, and the middleware that
  bridges them is expensive and closed. HL7 publishes a real, free **v2-to-FHIR** implementation
  guide (v1.0.0 STU 1, loaded this session), so the target mapping is specified rather than invented.
  A correct, auditable bridge is genuinely valuable infrastructure.
- **3-minute demo:** Stream a captured analyser frame byte by byte; the frame splits into patient
  record and result list. One field contains a delimiter character, so the naive split visibly
  breaks; the real parser holds. Then the FHIR bundle appears, and a critical potassium is flagged
  with the reference range it violated.
- **Kiro fit:** Strong. EARS spec per segment type; steering file for delimiter/escape constants; PBT
  for "every frame with a valid checksum parses or is rejected with a reason", "no result is emitted
  without a patient reference", "round-trip a synthetic message". MCP server for a LOINC/terminology
  lookup. Crew can split parser, mapper, and validator.
- **Build complexity:** Medium. No hardware — ship captured/synthetic frames and say so. The
  interop risk is field-level edge cases, which PBT handles well.
- **Crowding:** Healthcare is dense globally (`hl7` 536, `fhir` 1,691) but **no Kiroween entry maps
  v2 or ASTM to FHIR**. Caveat: **AuraGate** already occupies the shape "legacy wire format → modern
  schema + SDK", so lead with the clinical consequence, not the format.
- **Biggest risk:** Reading as "a parser with a pretty printer". The demo must show a clinician-facing
  consequence (critical result, wrong patient) inside the first minute.

---

### ★ 5. PlotForge — a 1977 pen plotter, compiled and simulated

- **Pitch:** Drop in any image; get HP-GL a real vintage plotter would accept, then watch a
  physics-honest plotter draw it — pens swapping, ink pooling, paper curling.
- **Incompatible pair:** **HP-GL / HP-GL/2** (a 1977 text command language: `PU`, `PD`, `SP`, `PA`,
  absolute pen coordinates, no fills, no colour model) against **modern raster/generative imagery**
  and vector pipelines that assume arbitrary colour and anti-aliasing.
- **Why the fusion is useful:** Pen plotting is an active niche — generative artists and hardware
  hackers run plotters because ink on paper is a real output medium with real constraints. The
  bottleneck is always the same: converting modern artwork into commands a plotter accepts, with
  hatching that respects pen width and paper bounds. A compiler plus an honest simulator is a tool
  people would actually use, and it produces something physical-looking in a browser demo.
- **3-minute demo:** Photo in. Watch a 20-second time-lapse plot: the pen lifts on every travel move
  (visible as dashed strokes), pens swap at the third layer, and a resolution slider changes hatching
  density. End with the command stream scrolling beside the drawing and a total path-length readout.
- **Kiro fit:** Good. HP-GL is small and deterministic, so the spec is writable in an afternoon and
  the properties are crisp: "no `PD` outside paper bounds", "pen changes only at layer boundaries",
  "total path length within X% of the simulator's", "re-emitting the stream is idempotent". Hooks run
  the geometry suite on every compiler change.
- **Build complexity:** Medium. Raster→vector (marching squares or edge tracing) is the real work;
  the simulator is straightforward canvas.
- **Crowding:** `plotter` = 93 global, none in the Kiroween pool and none about plotters. Nearest
  neighbour is **GraphiteCAD** (pencil strokes → vector), which shares the "physical mark making"
  vibe but not the protocol.
- **Biggest risk:** Judged as art, not engineering — Impact suffers. Frame it as a compiler with a
  conformance simulator, and name a non-art use (signage, PCB resist, plotted charts).

---

### 6. WireScope — decode a logic capture, then explain the bug

- **Pitch:** Paste a logic-analyser CSV; WireScope decodes I²C, SPI, UART, 1-Wire and RS-485 into
  transactions, then tells you which timing violation actually caused the failure.
- **Incompatible pair:** **Raw digital sample streams** (a million rows of `t,ch0,ch1,…` at
  microsecond resolution) against **protocol semantics** (start conditions, address/ACK bits, clock
  stretching, framing errors) and **LLM diagnosis** that needs structured events, not waveforms.
- **Why the fusion is useful:** Embedded engineers own this workflow and the tooling is either
  expensive or vendor-locked. Decoding is deterministic and testable; the LLM adds the part humans
  are slow at — correlating a NAK with a clock stretch three transactions earlier.
- **3-minute demo:** Paste a capture. Transactions stream out; one is red: "sensor NAKed address
  0x48". The timing panel shows the clock held low for 3.1 ms mid-byte. The agent's verdict cites
  that exact sample range.
- **Kiro fit:** Strong. EARS per protocol decoder; steering file of timing constants; PBT: "decoding
  an encoded frame returns the original bytes", "no decoder emits a transaction from a truncated
  capture", "resampling never changes decoded output". MCP server exposes decode results.
- **Build complexity:** Medium. Five decoders is a lot — ship two well (I²C + UART) and stub the rest.
- **Crowding:** `oscilloscope` hits are consumer/simulation apps, not protocol decoders. Nothing in
  the 135 does bus decoding. QNX-PulseScope is a kernel tool, not this.
- **Biggest risk:** Visually dull. Needs a strong waveform-to-verdict animation to hold a 3-minute
  video.

---

### 7. SwiftLens — MT103 into ISO 20022, with the diff that matters

- **Pitch:** Paste a SWIFT MT103 and get a validated ISO 20022 `pacs.008`, plus a field-by-field diff
  showing exactly which semantics changed and which got silently dropped.
- **Incompatible pair:** **SWIFT MT** (block-structured, `:20:`-style tags, 1970s fixed formats,
  truncation-prone) against **ISO 20022** (XML, nested parties, structured addresses, richer remittance
  data) during the live CBPR+ migration.
- **Why the fusion is useful:** Banks are mid-migration and the hard part is not syntax, it is
  semantic loss — fields that MT cannot carry and mappings that quietly default. A tool that shows
  the loss is directly useful to payments teams.
- **3-minute demo:** Paste MT103. The mapped `pacs.008` appears on the right. A red column lists three
  fields where information was lost or defaulted; click one and see the schema rule that forced it.
- **Kiro fit:** Good. Tag-level EARS spec; steering file of the mapping table; PBT for "every MT
  field is either mapped, explicitly dropped, or rejected", "no mapping invents a value".
- **Build complexity:** Medium. Pure parsing + XML; no external dependency. Validation schema is the
  heavy part.
- **Crowding:** Nothing in the 135. **AuraGate** is adjacent (ISO-8583 → OpenAPI) so the "legacy
  finance format" shelf is occupied once; being *second* on that shelf is a real scoring risk.
- **Biggest risk:** Low demo energy — a diff table is not a moment. Needs a money-at-stake narrative.

---

### 8. PagerNet — pull a message out of a pager burst

- **Pitch:** Play a recording of a pager transmission; watch FSK demodulation recover bits, the sync
  word lock, and a real message appear — no network, no server.
- **Incompatible pair:** **POCSAG** (1975, 512/1200/2400 baud FSK, preamble + sync word + batches of
  8 frames, BCH error correction) against **Web Audio + browser DSP** and a modern notification UI.
- **Why the fusion is useful:** Paging still runs hospitals, fire and EMS because it is one-to-many,
  power-cheap and hard to congest. Decoding is a real skill and the tooling is hobbyist-grade.
- **3-minute demo:** Hit play on a WAV. A bit-clock display locks, BCH corrections tick up, and the
  message text resolves with the capcode that received it.
- **Kiro fit:** Good — DSP is very testable: "demodulating a synthetic burst recovers the exact bits
  at SNR ≥ X", "every accepted message passes BCH", "a truncated burst yields no message".
- **Build complexity:** Medium-high. Bit sync and BCH are fiddly; a wrong clock costs a day.
- **Crowding:** Nothing in the 135. `telegraph`/`oscilloscope` sweeps show adjacent tinkerer projects
  but no pager work.
- **Biggest risk:** You must supply a legal recording and the demo is a single "it decoded" moment.
  Weaker 3-minute arc than CueForge.

---

### 9. KiroMIDI — the protocol generation gap, made audible

- **Pitch:** A bridge that carries MIDI 2.0 per-note expression down to MIDI 1.0 hardware and back,
  so a modern controller can drive a 1983 synth without losing the performance.
- **Incompatible pair:** **MIDI 1.0** (7-bit, 16 channels, 31.25 kbaud serial, channel-wide pitch
  bend) against **MIDI 2.0 / Universal MIDI Packet** (32-bit values, 16 groups, per-note controllers
  and per-note pitch bend).
- **Why the fusion is useful:** Every studio has both generations and the translation is lossy in ways
  nobody documents. A visible down-conversion with an honest loss report is a real utility.
- **3-minute demo:** Play a chord on a controller; show the 2.0 stream with 32-bit velocity, then the
  1.0 stream collapsing it to 7 bits while MPE-style per-note bend keeps the notes separable.
- **Kiro fit:** Good. UMP packing is pure bit arithmetic — ideal PBT territory ("pack/unpack identity
  across all message types", "no 32-bit value silently truncates without a loss record").
- **Build complexity:** Medium.
- **Crowding:** `midi` = 991 but they are music toys (Neon Band, VRvaldi, Piano Pal). No protocol
  bridge in the 135.
- **Biggest risk (serious):** **Browser support for MIDI 2.0 is unverified.** MDN confirms Web MIDI is
  *not* Baseline and needs a secure context; UMP support in Chrome is likely flag-gated or absent.
  If it is absent, this becomes a simulator-only demo. Verify with a five-minute spike before
  committing.

---

### 10. Xfer — 1977 file transfer over a 2026 data channel

- **Pitch:** Send a file between two browser tabs with XMODEM/YMODEM, on purpose, over a WebRTC data
  channel — and watch CRC retries save a corrupted transfer.
- **Incompatible pair:** **XMODEM/YMODEM/ZMODEM** (128-byte blocks, SOH/STX framing, ACK/NAK, CRC-16,
  no metadata) against **WebRTC data channels** (ordered/unordered, SCTP, backpressure, modern
  framing).
- **Why the fusion is useful:** Block-level retransmission is the right model for genuinely bad links,
  and WebRTC gives you a link you can degrade on demand. Doubles as a teaching tool for why modern
  transports behave the way they do.
- **3-minute demo:** Two panes. Inject 15% loss and bit-flips; blocks go red, NAKs fly, the receiver
  recovers, and the SHA-256 matches at the end. Then toggle "no CRC" and watch silent corruption win.
- **Kiro fit:** Good. PBT: "any block with ≤ N bit errors is recovered or rejected, never silently
  accepted", "transfer length equals source length", "resume after abort yields identical hash".
- **Build complexity:** Low-medium. All in one page, no server.
- **Crowding:** Nothing in the 135. But **Handshake** (two-tone browser modem) already owns
  "data transfer over an odd channel", so the two would read as siblings.
- **Biggest risk:** Demo is two progress bars — low design/wow ceiling.

---

### 11. Loom — a Jacquard punch chain that weaves in 3D

- **Pitch:** Author a punch-card chain; watch a 3D loom weave the cloth it encodes, thread by thread,
  with the same card read twice to prove the pattern repeats.
- **Incompatible pair:** **Jacquard chain** (1804: hooked needles, cards, warp/weft lift decisions,
  strictly binary per thread) against **WebGL cloth simulation** and procedural textile design.
- **Why the fusion is useful:** It is the direct ancestor of the stored-program computer, and the
  binary-to-textile mapping is a genuinely legible teaching device. Also a real output medium —
  weaving patterns are still authored as binary lift plans.
- **3-minute demo:** Edit one hole in the card; the weave visibly changes at the corresponding
  intersection forty threads later. Then run the full bolt.
- **Kiro fit:** Medium. Good PBT ("card ↔ lift-plan round trip", "no float outside the warp count"),
  but fewer natural hooks than the protocol candidates.
- **Build complexity:** Medium. Cloth simulation is the risk; a 2.5D render is enough.
- **Crowding:** Nothing in the 135 — but **PunchRevive** already owns "punch cards" as a motif, so
  this collides on imagery even though the fusion differs.
- **Biggest risk:** Reads as art/education, not a tool. Punch-card adjacency to PunchRevive.

---

### 12. ZPL Forge — compile labels, then prove the printer would agree

- **Pitch:** Write ZPL, see a pixel-accurate label render in the browser, and get a diff against what
  a real printer would produce — including the barcode's own check digit.
- **Incompatible pair:** **ZPL/EPL** (Zebra's line-oriented printer language: `^FO`, `^A0`, `^BC`,
  `^GB`, dots at 203 dpi, printer-resident fonts) against **modern HTML/CSS layout** and vector output.
- **Why the fusion is useful:** Warehouse and lab labels are printed from ZPL, and iterating on them
  normally means walking to a printer. A conformance renderer is a real dev-tool gap.
- **3-minute demo:** Type a label. Change `^BCN` to `^BC` and watch the barcode switch symbology and
  the check digit recompute; then show a 203 dpi dot-grid zoom.
- **Kiro fit:** Good. Deterministic command language → crisp properties and a natural golden-image
  test suite in hooks.
- **Build complexity:** Medium. Font metrics are the trap; substitute a dot-matrix approximation and
  say so.
- **Crowding:** `thermal printer` = 69, nothing in the 135, nothing about ZPL.
- **Biggest risk:** Small audience; low wow. Weak on Impact and Presentation relative to the top five.

---

### 13. AprsScope — live packet radio on a map

- **Pitch:** Watch real APRS packets from weather balloons, digipeaters and vehicles arrive and plot
  on a map, decoded from raw AX.25 frames.
- **Incompatible pair:** **AX.25 / APRS** (1980s amateur packet radio: HDLC framing, callsign-SSID
  addressing, digipeater paths, compressed position formats) against **modern web mapping** and an
  LLM that summarises a track.
- **Why the fusion is useful:** The network is live, free, and genuinely odd — a decentralised
  messaging system older than the web, still carrying telemetry. Good teaching and monitoring value.
- **3-minute demo:** A balloon track draws itself across a map in real time as new packets land, with
  the raw frame displayed beside the decoded position.
- **Kiro fit:** Medium. PBT for frame parsing and position decoding is clean; the "live feed" part is
  less testable.
- **Build complexity:** Low-medium. **aprs.fi API verified this session**: free account + API key,
  non-commercial use only, must credit aprs.fi and link back. So this is a thin client over a real
  feed, not a radio receiver.
- **Crowding:** Nothing in the 135. Niche audience limits Impact.
- **Biggest risk:** Depends on a third-party API key and its terms; also reads as a map dashboard.

---

### 14. MARC Bridge — the card catalogue, made answerable

- **Pitch:** Point at a library catalogue, pull MARC21 records through SRU, and let an agent answer
  questions with the record's own fields as citations.
- **Incompatible pair:** **MARC21** (1960s fixed-field + numbered-tag format, indicator semantics,
  authority-controlled headings) and **Z39.50/SRU** retrieval against modern search and LLM answer
  synthesis.
- **Why the fusion is useful:** Public and university libraries still run MARC, and it is the largest
  body of structured bibliographic data that general-purpose AI tools cannot read. Citations from
  real fields beat hallucinated references.
- **3-minute demo:** Ask "which 1970s Indian novels are held in translation?" — the tool shows the
  SRU query it ran, the MARC fields it used, and an answer with per-claim field citations.
- **Kiro fit:** Good, mostly spec work: tag semantics, indicator rules, and PBT for "every emitted
  citation resolves to a field in the record".
- **Build complexity:** Medium. SRU is HTTP+XML so no hardware; endpoint availability varies.
- **Crowding:** Nothing in the 135.
- **Biggest risk:** Dry demo, small audience, and public SRU endpoints are unreliable.

---

### 15. PDU — read the SMS that a phone actually received

- **Pitch:** Paste a raw SMS PDU hex string and see the message, its encoding, its concatenation
  parts, and the exact timestamp — because the interesting bugs live below the text.
- **Incompatible pair:** **GSM 03.38 / SMS PDU** (7-bit packing with a septet offset, UCS-2 fallback,
  concatenated-message headers, TP-DCS, timezone in nibbles) against modern messaging and India's DLT
  template regime.
- **Why the fusion is useful:** SMS is still the delivery channel for OTPs and government notices in
  India, and PDU-level bugs (a mangled 7-bit boundary, a split concatenated message) are common and
  poorly tooled.
- **3-minute demo:** Paste a PDU; 7-bit packing decodes to text; then paste one with a shifted septet
  offset and watch a naive decoder produce garbage while the correct one holds.
- **Kiro fit:** Good — bit-level, so PBT is natural ("pack/unpack septets identity", "no character
  lost at the 160-character boundary").
- **Build complexity:** Low. This is the smallest build here.
- **Crowding:** Nothing in the 135. But it is a utility, not a fusion — thin for Innovation.
- **Biggest risk:** Too small to feel like a Frankenstein entry. Better as a component of a larger
  telephony app.

---

### 16. DialTone — call your CI

- **Pitch:** An IVR that is also a build system: dial in, press 1 to deploy staging, press 2 to hear
  the last failure — with DTMF as the only interface.
- **Incompatible pair:** **PSTN telephony** (DTMF tones, IVR menus, call progress, Twilio/TwiML) against
  **a modern CI/CD control plane**.
- **Why the fusion is useful:** It is a genuinely useful fallback channel — on-call engineers with no
  laptop, or regions where a phone is the only reliable terminal. Also the most literal "incompatible
  pair" available.
- **3-minute demo:** Call a real number on camera, press keys, hear the deploy status, then watch the
  pipeline light up in the browser.
- **Kiro fit:** Medium. Webhook handlers and state machines spec well; PBT for menu-state transitions.
- **Build complexity:** Medium. **Unverified:** current Twilio trial terms, India outbound/inbound
  availability, and DLT rules for SMS. Verify before committing — telephony terms change and can block
  a demo at the worst moment.
- **Crowding:** Nothing in the 135 for IVR-as-control. **Grahak OS** already bundles WhatsApp + SMS +
  voice in the pool, so telephony is not virgin ground.
- **Biggest risk:** Live telephony fails on stage. Best used with a recorded fallback.

---

## 3. Kill list — do not build these

| Idea | Why killed |
|---|---|
| Fax → AI | 2025 winner Faxi; **Ghostfax** already in this year's pool |
| Rotary pulse dial decoding | **Handshake** owns "phone audio as data"; rotary dialer also present |
| Teletext / Ceefax | **Teleteks** plus a cluster of entries; fully saturated |
| BBS / telnet / IRC revival | GhostBBS, RetroTelnet-AI, afterlight-bbs, Séance — four entries |
| Cassette / mixtape | TapeBack, Ghost Deck, Spec-Tape |
| Floppy recovery | Graveyard Shift, burn2disk |
| CRT terminal aesthetic | Necro-Oracle, Lectern of the Dead, MUD 3D — three entries |
| Punch cards | PunchRevive |
| ISO-8583 / EBCDIC → OpenAPI | **AuraGate** already shipped exactly this, with a TS SDK |
| COBOL / ABAP resurrection | COBOL Phoenix, SAP Resurrection, RhinoKiro |
| Modbus / RS-485 workbench | **BusLink Studio** (slug literally `plc-frankenstein-…`) |
| BACnet / building signals | **GhostBridge** |
| CAN bus diagnostics | **CANDefend** |
| HyperCard / stack revival | GhostDeck, Stackyard |
| Morse / telegraph key | Telegraph Academy, Totally Brand New Telegraph Machine |
| Braille translation | **BrailleBridge** |
| FIT/TCX/ZWO unification | **Kaiord** already does "incompatible formats → unified JSON" |
| GeoCities / 90s homepage | Necropolis, PhantomForge |
| RSS reader revival | Five entries |
| InfoPath forms | InfoPath Afterlife |
| 3270 green-screen → JSON | **AuraGate** + Mainframe Desk occupy the legacy-format→schema shelf; only 4 `3270` hits globally, but they are the right ones |
| Anything needing Web Serial + real hardware | Web Serial is Chromium-only and needs a physical device — a judge cannot reproduce it (**verified**: MDN marks it limited availability, secure context) |
| Web Bluetooth / WebUSB device demos | Same reproduction problem; also risks a hardware purchase |
| NFC / RFID | Web NFC is Android-Chrome only — desktop judges cannot run it (**unverified** in detail, but the platform restriction is well known) |
| Smartcard / EMV APDU | Sealed SDKs and certification; not a 16-day browser project |
| Barcode-only scanning | `Barcode Detection API` is experimental and Chromium-only (**verified** on MDN); `barcode` search is dominated by pantry apps |

---

## 4. Build guidance for the top 5

**Common shape.** All five demo without a purchase and without a login. All five can be graded by a
judge in one browser tab. That is not an accident — it is the filter that removed most of the sweep.

**Kiro depth is 20% and is the cheapest 20% to win.** The pool is visibly full of entries that say
"built with Kiro specs, hooks, steering, MCP, PBT" in the tagline. Tagline claims are table stakes
now; what differentiates is *evidence*: a `.kiro/specs/` tree in the repo, a hook that visibly fails
when you break an invariant, and a PBT suite whose count you can show. Every candidate above was
chosen partly because it has crisp, enumerable invariants — protocol packing, queue delivery, encoding
round-trips, geometric bounds. Prefer the candidate whose properties you can write before you write
the code.

**Design is 20% and is where browser-only entries usually lose.** CueForge and PlotForge have built-in
visual payoff. TubeMQ needs a deliberately instrument-panel look, not cartoon. LipiSetu needs
typographic care — Devanagari rendering is itself part of the design story.

**Presentation is 20% and is a hard 3 minutes.** Each top-five demo above is written as a single
continuous action with a failure injected on purpose. Rehearse the failure: a demo where the system
recovers from a dropped packet or a corrupted block is more convincing than one where everything
works.

**Verify before committing (all unverified this session):**
- MIDI 2.0 / UMP in Web MIDI — spike it in an hour; do not assume (candidate 9 depends on it).
- Twilio trial terms and India availability — blocks candidate 16.
- Any live SRU or catalogue endpoint — blocks candidate 14.
- A legal POCSAG recording — blocks candidate 8.

---

## 5. Sources actually loaded

- `https://kiroween.devpost.com/` — participants, prize, deadline, schedule
- `https://kiroween.devpost.com/project-gallery` — category labels; gallery unpublished
- `https://devpost.com/software/search?query=…` — 22 term queries, plus `kiroween` (4 pages) and
  `frankenstein kiroween` (3 pages); 135 distinct slugs collected
- `https://devpost.com/software/necrovm-8080-resurrection-micro-vm-state-engine` (via search)
- `https://devpost.com/software/auragate` — confirmed ISO-8583/EBCDIC → OpenAPI 3.1 + TS SDK
- `https://devpost.com/software/punchrevive` — confirmed IBM punch card scanner
- `https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API` — not Baseline, secure context
- `https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API` — limited availability, secure context
- `https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API` — experimental, Chromium
- `https://build.fhir.org/ig/HL7/v2-to-fhir/` — HL7 v2-to-FHIR v1.0.0 STU 1 exists
- `https://aprs.fi/page/api` — free account + API key, non-commercial, credit + link required
- `https://www.gs1.org/standards/gs1-digital-link` — GS1 Digital Link encodes GTIN/serial/lot/expiry
- `https://en.wikipedia.org/wiki/ISCII` — ISCII code pages for 12 Indic scripts

Background protocol facts (DMX512 universes, HP-GL commands, POCSAG framing, ASTM E1394, ISO 20022,
MARC21, GSM 03.38) are stated from general knowledge and were **not** re-verified against a primary
document in this session.
