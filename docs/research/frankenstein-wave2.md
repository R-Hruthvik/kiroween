# Frankenstein wave 2 — candidate topic research for Kiroween 2026

Researched 18 Nov 2026. All web access through one real browser tab (Devpost search). Wave 1 doc:
`docs/research/frankenstein.md`. This file adds 20 *different* candidates. No repeats.

Kiroween 2026 gallery still unpublished; counts are Devpost full-text (fuzzy, global), not
Kiroween-scoped. Treat as crowding signal only.

## Crowding sweep (this session)

| Query | Devpost total | Notable titles seen |
|---|---|---|
| MARC21 / MARC | 426 | DigIn, Pedigree licence terms |
| ZPL | 2 | Generator Barcode (bulk barcode/QR), CaratFlow (jewelry ERP) |
| EDIFACT | 3 | Hozerion logistics sidecar, TwinID |
| DICOM | 328 | MedVision AI, Imaging Incident Triage |
| SMPTE | 17 | CineVault AI, Alexa+ climate MCP |
| POCSAG | 0 | none — open lane |
| APRS | 48 | Dial-Up Lifeline (modem SOS relay), PayPulse |
| NMEA 0183 | 27 | VIGIL (thermal SAR), Fire Sight |
| GTFS | 292 | From Lost to Found (campus transit) |
| OPC UA | 49 | open62541 on QNX 8.0 (x2) |
| ISOBUS | 1 | PhytoCausal |
| JPEG 2000 | 18 | Lunas escrow, POD Listing Writer |
| SBOM | 201 | VEXProof (reachability SBOM/OpenVEX) |
| MIDI 2.0 | 431 | Neon Band, Monster Puppet Theater |
| DST embroidery | 3 | NEALite embroidery digitiser (x2) |
| knitting machine | 28 | InGather, Jig (knitting pattern) |
| change ringing | 83 | FreezeLine (water utility freeze alerts), SoloStrings |
| tide clock | 25 | Grid Tide (clean-energy timing), Turtle Tide |
| orrery | 13 | ORRERY immersive solar system, Access Orrery |
| ephemeris | 67 | Tranquility Base (lunar landing), Star Chasers |
| NMEA | 27 | (above) |
| OPC | 103 | Xcavate, open62541-qnx |
| MARC (record) | 39 | In Your Words witness interview, receipt-tracer |

## Candidates (ranked)

### 1. Scriptorium — MARC21 records ↔ plain-language search and Q&A
- Pitch: a library cataloguing workbench that turns MARC21 (the dead record format still holding most of the world's books) into something a librarian, a student and an AI can actually read, query and correct.
- Pair: MARC21 (leader + variable fields + subfields, 1960s, USMARC/UNIMARC) ↔ modern search, embeddings, LLM Q&A.
- Why useful: millions of catalogue records are locked in a format only library systems read; small libraries cannot afford ILS migration; students cannot search their own college library's holdings in natural language.
- Demo (3 min): paste a MARC record, watch it decode into a readable card with author/title/subject; ask "books about river pollution in India"; get ranked results with the MARC fields cited; fix one subject heading; export updated MARC.
- Kiro fit: specs for field/subfield grammar; steering that forbids hallucinating MARC fields; hooks run a round-trip PBT (encode → decode → encode) on save; MCP over a Z39.50/SRU endpoint or a static MARC file.
- Complexity: medium. Build: MARC parser/writer (well-specified, RFC), in-browser search over a small corpus, LLM Q&A over retrieved records.
- Crowding: MARC21 426 global, but no Kiroween entry seen in newest-first results; "MARC" titles are unrelated (DigIn, Pedigree). Unverified whether any Kiroween entry uses MARC.
- Biggest risk: judges outside libraries feel nothing. Mitigate with a striking before/after (raw MARC wall of `$a` subfields → clean card) and a concrete beneficiary (a small-college librarian).
- Why unexpectedly powerful: the parser is the product; MARC is a real, still-live data silo, not nostalgia.

### 2. ZPL Forge — Zebra printer language ↔ web preview and editor
- Pitch: a browser workbench for ZPL (the label language every warehouse printer speaks), with live preview, visual editing, and AI generation of labels from a description.
- Pair: ZPL II (Zebra Programming Language, 1990s, monospaced dots, ^XA/^XZ) ↔ modern canvas, React, LLM.
- Why useful: shipping labels, shelf tags, patient wristbands, asset tags are still designed in raw ZPL text or clunky Windows tools; small businesses have no visual editor.
- Demo: type a description ("fragile, return address, QR, barcode"), watch ZPL generate, see the label render live, print to a cheap Zebra or PDF, then hand-edit a ^FO coordinate and watch it move.
- Kiro fit: specs for the ZPL subset; steering for coordinate/field semantics; hooks run a PBT that parses → renders → parses; MCP could expose printer status.
- Complexity: low-medium. The ZPL subset (^FO, ^FD, ^BC, ^BQ, ^GB, ^A) is small and well documented.
- Crowding: 2 global results, none Kiroween. Effectively open.
- Biggest risk: feels like a toy barcode tool. Mitigate with the "no cloud, works offline, runs on a $80 printer" angle and a real-world label (patient wristband).
- Why unexpectedly powerful: every e-commerce and lab ships labels; the audience is enormous and underserved.

### 3. EdiScope — EDIFACT purchase orders ↔ human-readable supplier dashboard
- Pitch: a small-supplier dashboard that ingests EDIFACT ORDERS/INVOIC invoices and turns them into readable orders, flags, and replies — no EDI consultant, no VAN.
- Pair: EDIFACT (UN/EDIFACT, 1980s, segment-based, + separators) ↔ modern web dashboard + LLM explanation.
- Why useful: small suppliers receive EDIFACT from large buyers (retail chains, pharma, auto) and cannot read it; they pay consultants or miss orders.
- Demo: paste a real (anonymised) ORDERS message, watch it parse into a clean order card with line items, quantities, prices, delivery dates, and a "reply D96A ORDERS response" button; show the segment tree for one field.
- Kiro fit: specs for segment grammar; steering for UN/EDIFACT code lists; hooks run a round-trip PBT (parse → serialise → parse); MCP over a sample mailbox.
- Complexity: medium. EDIFACT grammar is finite but code lists are large — ship a curated subset (ORDERS, INVOIC, DESADV).
- Crowding: 3 global results, none Kiroween. Open.
- Biggest risk: the demo is "a parser with a UI" — needs a story (a small supplier, a missed delivery). Mitigate with a named persona.
- Why unexpectedly powerful: EDI is a $4B+ market still running on 1980s text; small suppliers are locked out.

### 4. DicomLens — DICOM metadata ↔ consumer health timeline
- Pitch: drop a DICOM file, see a plain-language timeline of your imaging (modality, body part, date, dose, series) plus a shareable summary — no PACS, no jargon.
- Pair: DICOM (Digital Imaging and Communications in Medicine, 1985, binary part-10 files with metadata tags) ↔ modern web, LLM simplification.
- Why useful: patients receive CDs of scans they cannot read; radiologists' reports are jargon; second-opinion and continuity of care suffer.
- Demo: drag a (synthetic/anonymised) DICOM file, watch metadata extract into a timeline with plain-language explanations, click a series to see slice count and dose, export a one-page summary PDF.
- Kiro fit: specs for DICOM tag extraction; steering for medical-terminology simplification (with "not medical advice" guardrails); hooks run PBT on tag parsing; MCP over a local file.
- Complexity: medium. Use a JS DICOM library (dcmjs or dicom-parser) — do not hand-write a parser.
- Crowding: 328 global results, but mostly AI radiology platforms, not metadata/timeline tools. No Kiroween entry seen. Unverified.
- Biggest risk: privacy and "medical advice" framing. Mitigate with synthetic data only and explicit "not a diagnosis" copy.
- Why unexpectedly powerful: turns an opaque medical artefact into something a patient can act on.

### 5. TimecodeSync — SMPTE LTC ↔ multi-device web video sync
- Pitch: a web app that syncs multiple phones/laptops to a single SMPTE timecode source over the browser, so indie filmmakers can run a multi-cam shoot without a hardware sync box.
- Pair: SMPTE LTC (Linear Timecode, 1960s, bi-phase mark encoded audio) ↔ Web Audio, WebRTC, modern sync.
- Why useful: multi-camera sync for indie shoots costs hundreds in hardware; LTC is already on every camera; a browser decoder is free.
- Demo: play an LTC audio track on a laptop, two phones decode it and show matching timecode; cut a clip on one device, the other jumps to it.
- Kiro fit: specs for LTC decoding (bi-phase mark, frame rate, drop-frame); steering for sync tolerance; hooks run PBT on frame boundaries; MCP for a clock source.
- Complexity: medium-high. LTC decoding in JS via Web Audio is well-trodden (open-source decoders exist).
- Crowding: 17 global results, none Kiroween. Unverified.
- Biggest risk: browser audio latency makes frame-accurate sync impossible; scope to "within a few frames" and be honest.
- Why unexpectedly powerful: replaces a $400 box with a URL.

### 6. LabBridge — ASTM E1394 analyser frames ↔ HL7 v2 ↔ FHIR R4
- Pitch: a lab-IT workbench that replays captured serial frames from a chemistry analyser, decodes ASTM E1394, maps to HL7 v2 ORU, then to FHIR R4 Observation, showing exactly where naive parsers break (delimiters, repeating fields, unit conversion).
- Pair: ASTM E1394 (1990s lab serial protocol) ↔ HL7 v2 (1987) ↔ FHIR R4 (2019).
- Why useful: lab interfaces are still hand-built and brittle; a teaching/auditing tool that shows the mapping is genuinely scarce.
- Demo: load a captured frame file, watch it decode into HL7, then FHIR, with a red highlight on the one field a naive parser gets wrong.
- Kiro fit: specs for each protocol layer; steering for unit/terminology mapping; hooks run PBT on round-trips and on malformed frames; MCP over a file.
- Complexity: medium. Frame parsing is finite; HL7/FHIR mapping is the work.
- Crowding: 0 direct hits. Open.
- Biggest risk: invisible to non-lab audiences. Mitigate with the "one red highlight" demo beat.
- Why unexpectedly powerful: shows that protocol translation is a real, testable engineering discipline.

### 7. PlotForge — image ↔ HP-GL plotter commands
- Pitch: compile any image into HP-GL and watch a physics-honest pen plotter draw it, pen swaps and hatching included.
- Pair: HP-GL (Hewlett-Packard Graphics Language, 1977) ↔ modern canvas/SVG, LLM hatching decisions.
- Why useful: pen plotters are having a maker renaissance; there is no good browser tool that shows the actual command stream.
- Demo: drop an image, watch it vectorise, see the HP-GL commands stream, watch the virtual pen draw with pen-up/pen-down, hatch fills, and a pen-swap animation.
- Kiro fit: specs for HP-GL command grammar; steering for plotter constraints (pen width, paper size); hooks run PBT on command round-trips; MCP over a file.
- Complexity: low-medium. HP-GL is a small, well-specified command set.
- Crowding: 0 direct hits. Open.
- Biggest risk: niche audience. Mitigate with the "watch it draw" visual payoff.
- Why unexpectedly powerful: makes an invisible command stream visible and controllable.

### 8. MARC21 Lens — MARC21 records ↔ plain-language search and Q&A
- (see Scriptorium, #1 — duplicate name kept for clarity; pick one name in final.)

### 9. CueForge — one cue engine driving DMX + MIDI + SMPTE LTC
- Pitch: a single cue list that drives DMX lighting, MIDI notes and SMPTE timecode, with an AI that compiles "thunderstorm cue" into a synced stack and recovers from a dropped packet.
- Pair: DMX512 (1986 lighting control) + MIDI (1983) + SMPTE LTC (1960s) ↔ modern web, LLM cue authoring.
- Why useful: indie theatre/AV crews cannot afford a lighting console; three incompatible protocols, one timeline.
- Demo: type "thunderstorm", watch three tracks light up in sync, then unplug one device and watch the cue survive.
- Kiro fit: specs for cue schema; steering for timing tolerances; hooks run PBT on sync invariants; MCP over Web MIDI/Web Serial.
- Complexity: medium-high. Web MIDI and Web Serial are available; DMX needs a USB-DMX dongle (fallback: simulated output).
- Crowding: 0 direct. Open.
- Biggest risk: hardware dependency. Mitigate with a fully simulated output and a "plug in a real dongle to upgrade" path.
- Why unexpectedly powerful: three 1980s protocols, one timeline, one URL.

### 10. TubeMQ — pneumatic tube network modelled as a message queue
- Pitch: model a hospital's pneumatic tube system as a message queue: jams are backpressure, misroutes are at-least-once delivery, idempotency collapses duplicate tubes.
- Pair: pneumatic tube logistics (1850s–present, still in hospitals) ↔ distributed-systems semantics (MQTT/Kafka concepts).
- Why useful: teaches distributed-systems concepts through a physical metaphor everyone has seen; also a real hospital logistics simulator.
- Demo: send a "specimen" tube, watch it route, jam, retry, and dedupe; toggle "at-least-once" vs "exactly-once" and watch the outcome change.
- Kiro fit: specs for tube state machine; steering for delivery semantics; hooks run PBT on convergence invariants; MCP over a simulated network.
- Complexity: low-medium. Pure simulation, no hardware.
- Crowding: 0 direct. Open.
- Biggest risk: reads as a toy. Mitigate with the "this is how your Kafka cluster actually behaves" framing.
- Why unexpectedly powerful: a 170-year-old transport maps 1:1 onto modern MQ semantics.

### 11. LipiSetu — legacy Indian font encodings → Unicode Devanagari
- Pitch: convert Kruti Dev / Chanakya / ISCII mojibake into clean Unicode Devanagari so court judgments and government forms from 1990–2010 become searchable.
- Pair: legacy 8-bit Indian font encodings (Kruti Dev, Chanakya, ShreeLipi, Akruti, ISCII) ↔ Unicode + modern search.
- Why useful: millions of Indian court judgments and government forms are unreadable in any modern tool; lawyers and citizens cannot search them.
- Demo: paste a Kruti Dev judgment, watch it decode to Devanagari, search for a keyword, export clean text; show a side-by-side of the original mojibake.
- Kiro fit: specs for each encoding's codepage; steering for Devanagari normalisation; hooks run a round-trip PBT (encode → decode → encode) for every supported font; MCP over a file or clipboard.
- Complexity: medium. Mapping tables exist in open-source (Kruti Dev → Unicode converters); ship 4–6 fonts, not all.
- Crowding: 0 direct Kiroween hits for "Kruti Dev" or "ISCII". Open.
- Biggest risk: mapping accuracy for rare characters; mitigate with a "confidence + manual fix" UI and a clear scope.
- Why unexpectedly powerful: fixes a real, daily, India-specific harm with a 2-week build.

### 12. BaudotBridge — TTY/TDD → real-time text (RTT) for accessibility
- Pitch: a browser bridge that turns Baudot (TTY) tones into live text on a phone, and back, so a deaf user with a legacy TTY can talk to anyone with a modern phone.
- Pair: Baudot (ITA2, 1930s, 5-bit, 45.45 baud) ↔ RTT (RFC 4103 / 47 CFR Part 67) and modern web.
- Why useful: the FCC states RTT is intended to replace TTY; millions of legacy TTY devices are still in use; the transition is broken.
- Demo: play Baudot tones from a phone, watch live text appear on a browser, type a reply, watch Baudot tones come back.
- Kiro fit: specs for Baudot/ITA2; steering for timing and error handling; hooks run PBT on encode/decode round-trips; MCP over Web Audio.
- Complexity: medium. Baudot decoding is well documented (open-source decoders exist).
- Crowding: 0 direct. Open.
- Biggest risk: browser audio latency; scope to "works over a clean line" and be honest.
- Why unexpectedly powerful: accessibility impact with a 2-week build and a clear regulatory hook.

### 13. NMEALens — NMEA 0183 sentences ↔ modern chartplotter web app
- Pitch: a browser chartplotter that reads NMEA 0183 sentences from a phone's GPS/compass or a USB serial GPS, plots position, speed and heading, and logs a track.
- Pair: NMEA 0183 (1983, serial, comma-delimited, checksummed) ↔ modern web maps, Web Serial, Web Geolocation.
- Why useful: sailors and makers have cheap GPS modules but no free chartplotter; commercial ones are expensive and locked.
- Demo: plug a cheap USB GPS into a laptop, watch position plot on a map with speed/heading; show a malformed sentence being rejected by checksum.
- Kiro fit: specs for the sentence grammar; steering for checksum and field semantics; hooks run PBT on parse/validate; MCP over Web Serial.
- Complexity: low-medium. NMEA 0183 is a small, well-documented grammar.
- Crowding: 27 global results, none Kiroween. Open.
- Biggest risk: thin audience. Mitigate with the "any $15 GPS module" angle.
- Why unexpectedly powerful: turns a $15 part into a chartplotter.

### 14. GTFSboard — GTFS/GTFS-RT ↔ station departure board
- Pitch: a zero-hardware station departure board: point at any GTFS feed, get a live board with delays, cancellations and platform changes.
- Pair: GTFS (2005, CSV-based transit data) + GTFS-RT (protobuf) ↔ modern web board.
- Why useful: transit agencies publish GTFS but riders see nothing; small towns have no app; a URL is enough.
- Demo: enter a feed URL, watch a live board appear with real delays; show a delay propagate; export an embeddable widget.
- Kiro fit: specs for GTFS parsing; steering for realtime merge rules; hooks run PBT on feed merge; MCP over a feed.
- Complexity: low-medium. GTFS is CSV; GTFS-RT needs a protobuf parser (protobuf.js).
- Crowding: 292 global results, none Kiroween. Unverified.
- Biggest risk: "just a transit app" — needs the "zero hardware, any feed" angle to stand out.
- Why unexpectedly powerful: any agency's data becomes a live board with one URL.

### 15. EdiPrint — ZPL + EDIFACT + MARC in one "dead-format workbench"
- Pitch: a single browser workbench for three dead formats (ZPL labels, EDIFACT orders, MARC records) with a shared parser/validator core and AI explanation — one template, three domains.
- Pair: three unrelated 1980s formats ↔ one shared parser core + LLM.
- Why useful: shows that dead formats share a common shape (delimited, code-list-driven, brittle) and can be handled uniformly.
- Demo: switch tabs between a label, an order and a library record; parse each; show the shared validator catching a malformed field in each.
- Kiro fit: specs for a generic field/segment parser; steering per format; hooks run PBT per format; MCP over files.
- Complexity: medium-high. Risk of being "three thin tools stapled together."
- Crowding: 0 direct. Open.
- Biggest risk: breadth over depth. Mitigate by making the shared core the star, not the three formats.
- Why unexpectedly powerful: a meta-point about dead formats that becomes a product.

### 16. MorseBridge — Morse via keyboard/phone vibration ↔ modern chat for deafblind users
- Pitch: a chat where one side types Morse on a single key (or taps a phone) and the other side reads live text, with vibration feedback — a real accessibility bridge.
- Pair: Morse code (1830s, binary, timing-based) ↔ modern chat, Web Vibration API, LLM autocorrect.
- Why useful: deafblind users and some motor-impaired users can produce Morse with one switch; existing tools are clunky.
- Demo: tap a single key in Morse, watch text appear live; reply in text, watch the phone vibrate the Morse reply.
- Kiro fit: specs for Morse timing (dit/dah/gap); steering for accessibility; hooks run PBT on encode/decode; MCP over Web Audio/Vibration.
- Complexity: low. Morse is trivial; the accessibility story is the product.
- Crowding: "Morse" search not run this session — unverified.
- Biggest risk: reads as a gimmick unless the accessibility story is central and respectful.
- Why unexpectedly powerful: one switch, one protocol, real access.

### 17. EmbroideryPreview — DST/PES files ↔ browser preview and edit
- Pitch: drop an embroidery file (DST/PES), see the stitch path animate, edit colours and density, export a cleaned file.
- Pair: embroidery machine formats (Tajima DST, Brother PES, 1980s) ↔ modern canvas, LLM cleanup.
- Why useful: hobbyists and small shops cannot preview or clean files without proprietary software.
- Demo: drop a DST, watch the needle path animate, recolour, change density, export.
- Kiro fit: specs for DST/PES parsing; steering for stitch semantics; hooks run PBT on round-trips; MCP over a file.
- Complexity: medium. DST is a simple byte stream; PES is more complex.
- Crowding: 3 global results (NEALite x2), none Kiroween. Unverified.
- Biggest risk: niche audience. Mitigate with the "free preview for a $200 file" angle.
- Why unexpectedly powerful: removes a paywall from a maker workflow.

### 18. KnitCompile — knitting machine punch cards ↔ pattern compiler
- Pitch: compile a knitting pattern (text + chart) into punch-card instructions for a Brother/Knitmaster machine, with a live preview of the resulting fabric.
- Pair: knitting-machine punch cards (mechanical, 1970s) ↔ modern pattern authoring, LLM chart generation.
- Why useful: knitters with vintage machines cannot author new patterns without hand-punching cards.
- Demo: type a pattern, watch the punch card generate, watch the fabric preview knit row by row.
- Kiro fit: specs for punch-card encoding; steering for machine constraints; hooks run PBT on round-trips; MCP over a file.
- Complexity: medium-high. Punch-card formats are mechanical and well-documented by the maker community.
- Crowding: 28 global results, 2 Kiroween (Jig). Unverified overlap.
- Biggest risk: niche audience and mechanical accuracy. Mitigate with a single well-supported machine model.
- Why unexpectedly powerful: brings a vintage machine back to life with software.

### 19. ChangeRing — method ringing (church bells) ↔ simulator and trainer
- Pitch: a browser simulator and trainer for change ringing, with a conductor, a band, and real method notation.
- Pair: change ringing (17th century, permutations on bells) ↔ modern web audio, LLM coaching.
- Why useful: bell-ringing bands are shrinking; a free trainer with audio and method notation lowers the barrier.
- Demo: watch a method ring with audio, see the blue line, try conducting, get feedback on a mistake.
- Kiro fit: specs for method notation; steering for timing; hooks run PBT on permutation invariants; MCP over audio.
- Complexity: medium. Methods are well-specified (change ringing has formal notation).
- Crowding: 83 global results, 4 Kiroween (FreezeLine, SoloStrings). Unverified overlap with bell ringing specifically.
- Biggest risk: niche audience. Mitigate with the "mathematical music" angle.
- Why unexpectedly powerful: a 400-year-old practice becomes learnable on a phone.

### 20. TideClock — tide clock / orrery ↔ astronomy engine
- Pitch: a browser tide clock and orrery that computes real tides and planetary positions from location and date, with a shareable "today" view.
- Pair: tide clock (19th century, mechanical) + orrery (18th century) ↔ modern astronomy (NOAA tides, JPL ephemeris).
- Why useful: sailors, fishers, and coastal residents want tides without an app; educators want a real orrery.
- Demo: enter a location, watch the tide clock tick with real tides; spin the orrery to any date; export a printable tide table.
- Kiro fit: specs for tide computation; steering for astronomical accuracy; hooks run PBT on known tide values; MCP over NOAA/JPL.
- Complexity: medium. NOAA tide API is free; JPL Horizons is free.
- Crowding: 25 + 13 global results, none Kiroween. Unverified.
- Biggest risk: "just a clock" — needs the "real data, real physics" angle.
- Why unexpectedly powerful: a mechanical-era instrument backed by modern data.

## Rejected this wave

| Idea | Why rejected |
|---|---|
| MARC21 (already #1 and #8) | merged — one candidate |
| POCSAG pager revival | wave 2 Resurrection already found "8282" pager project; lead with protocol depth instead |
| Fax revival | Faxi won 2025; Ghostfax exists this year |
| Rotary dial | Handshake project already owns phone-audio-as-data |
| Cassette / floppy / punch card | saturated in both years |
| BBS / telnet / IRC | 4+ entries this year |
| Morse | gimmick risk unless accessibility is central (kept as #16) |
| Modbus / CAN / BACnet | BusLink Studio, CANDefend, GhostBridge this year |
| HyperCard | 9+ entries this year |
| Braille | BrailleBridge this year |
| Teletext | 9+ entries this year |
| COBOL / legacy code | COBOL Phoenix, CodePhoenix, Kiro-Powered SAP, RhinoKiro this year |
| Retro-OS skins | VibeOS, necrOS, PHOSPHOR, ShadowScriptOS this year |
| Weatherfax / Baudot Bridge | already in Resurrection wave 1 |
| CueForge / TubeMQ / PlotForge | already in Frankenstein wave 1 |

## Notes

- "MARC21 Lens" and "Scriptorium" are the same candidate; final name TBD.
- ZPL Forge (#2) has the lowest crowding (2 global) and a clear audience (warehouses/labs).
- LipiSetu (#11) is the strongest India-specific candidate and the best PBT showcase.
- LabBridge (#6) and PlotForge (#7) are the best "invisible protocol made visible" demos.
- EdiScope (#3) and DicomLens (#4) have the largest real-world audiences.
- MorseBridge (#16) and EmbroideryPreview (#17) are the easiest builds.
- ChangeRing (#19) and TideClock (#20) have the most niche audiences but the best "wow" demos.
