# Resurrection — wave 2 candidates (Kiroween 2026)

Researched 18 November 2026, ~16 days before the 4 December deadline. All web access through a
real browser session (Devpost search + project pages, DuckDuckGo lite result pages).

**Method.** Wave 1 (`resurrection.md`) covered teletext, HyperCard, BBS, RSS, GeoCities, IRC, fax,
punch cards, cassette, floppy, COBOL, ELIZA, Clippy, minitel, telex, TTY, UUCP, 5250, Lotus 1-2-3,
WordPerfect, Graffiti, Line 21, microfiche, filmstrip, punch clock, Kid Pix, paper tape, Scantron.
None of the ideas below repeat those. This pass extracted **all 304 titles** from
`https://devpost.com/software/search?query=kiroween&page=1..13` (wave 1 recorded 303 — the count
drifts; treat both as approximate) and then ran 48 per-term global Devpost queries. Global counts are
full-text matches and noisy; only small numbers are usable crowding signals.

Terms that returned **zero** results on all of Devpost: `laserdisc`, `mimeograph`,
`spirit duplicator`, `diazo`, `keykode`, `marigram`, `nicam`, `pocsag`, `mpt1327`, `pitman`,
`minitel`, `videotex`.

---

## (a) Ranked candidates

★ = top five.

### ★ 1. Marigram — turn paper tide-gauge charts into a sea-level series

- **Pitch:** Photograph a century-old tide-gauge chart and get a calibrated sea-level series, so the
  climate record starts where the digital record stops.
- **Dead tech:** Analogue tide gauges: a float in a stilling well driving a pen across a clockwork
  drum or a paper strip (marigrams), read and tabulated by hand. Most stations were digitised only
  from the 1990s; the earlier paper is the gap.
- **Audience/need today:** Sea-level research and coastal planning. PSMSL holds "over 65,000
  station-years … from over 2,200 tide gauge stations" (psmsl.org, seen in search snippet). BODC's
  sea-level portal advertises "scanned images of tide gauge ledgers and charts" from eight UK sites
  rescued with MEDIN funding, and there is a published "Tide Gauge Data Rescue" paper — i.e. the
  bottleneck is real and named, not invented.
- **3-min demo:** Drop in a scan. Calibration marks snap to the axes; the pen trace resolves into a
  curve; a live overlay shows the same fortnight from a modern digital gauge, mean offset under 3 cm.
  Then a deliberately damaged chart (pen skip, two pens crossing) — the tool flags the segment
  instead of inventing data.
- **Kiro fit:** Excellent. PBT is the whole story: generate a synthetic tide (known amplitude, phase,
  drift, two pens), rasterise it with noise, decode, assert amplitude/phase recovery inside
  tolerance; assert monotone time and no fabricated samples in gaps. Steering file holds chart
  conventions (mm/hour scaling, bench-mark check pen). Hook runs the decode suite on every change.
  Specs split ingest / calibration / trace extraction / QC. MCP tool exposes "series for station X".
- **Build:** Medium, ~8–10 days. Canvas + WASM image ops; the hard parts are grid/axis detection and
  separating two crossing traces. No OCR, no model.
- **Crowding:** `marigram` = **0**, `tide gauge` = 21 global hits but the visible titles (nostos,
  snuggit, deluge-flood-simulator, varuna) are flood apps, not chart reading. Nothing tide-related
  in the 304-title Kiroween corpus.
- **Failure risk:** Judges may read it as "another OCR demo", and a bad scan makes the live decode
  fail visibly. Mitigate with a QC panel that refuses low-confidence charts — that refusal is itself
  the credibility.
- **Why not nostalgia:** It adds decades to the instrumental sea-level record that feeds IPCC
  assessments and coastal defence. Nostalgia revives a look; this revives a measurement.

### ★ 2. Chord — the stenotype keyboard, for courts that cannot wait for a transcript

- **Pitch:** A working stenotype: press chords, get words, at 180+ wpm, with a dictionary you can
  correct once and never again.
- **Dead tech:** The Stenograph machine — 22–23 keys, one chord per syllable, a paper tape of
  untranslated "steno notes", and CAT software that expands chords into English.
- **Audience/need today:** Indian courts. Reporting puts pendency above **5 crore cases** with
  **7,300+ vacant judicial posts**; one report's framing is that "almost everything the court does
  must first become a written record". Live transcription is the bottleneck, and human stenographers
  are retiring faster than they are recruited (Lok Sabha still advertises Parliamentary Reporter
  posts requiring **160 wpm shorthand**, which shows the skill is scarce, not free).
- **3-min demo:** Chord a sentence live — the words appear with per-chord confidence and the running
  wpm. Then a deliberately ambiguous chord: the tool shows the competing outlines and the rule it
  applied instead of silently guessing. Finish on "export transcript" with timestamps.
- **Kiro fit:** Excellent. PBT: any chord sequence maps to exactly one canonical key set; dictionary
  lookup is deterministic and order-independent; prefix/suffix rules never emit an empty word;
  round-trip chord stream encode → decode. Specs for steno theory (left hand = initial consonants,
  vowels centre, right = finals) make a genuinely good `design.md`. Crew agent can play "adversarial
  student" producing illegal chords.
- **Build:** Medium, ~9–11 days. The keyboard, chord model, and a few-thousand-entry dictionary are
  tractable; the risk is dictionary quality, not code.
- **Crowding:** `stenotype` = 1 (tacticode, unrelated), `gregg shorthand` = 2 (one is *shorterhand*,
  a Gregg typing aid — a different mechanic, and not a Kiroween entry per its project page).
  Nothing steno-shaped in the 304-title corpus.
- **Failure risk:** The demo depends on the presenter actually being able to chord — or on an honest
  pre-recorded chord stream. Do not fake fluency; label a scripted stream as scripted.
- **Why not nostalgia:** It is a text-entry device with a measured speed advantage for a documented
  backlog, not a prop. The before/after is "no transcript" versus "transcript in the room".

### ★ 3. Optical — recover sound from the optical track on a film print

- **Pitch:** Point a phone at the soundtrack strip of a 16mm print and hear the audio that no scanner
  has extracted yet.
- **Dead tech:** Variable-area / variable-density optical sound: a photographic waveform printed
  alongside the picture, read by a photocell in the projector. Superseded by magnetic and then
  digital sound; the projectors and photocells are gone, the prints remain.
- **Audience/need today:** Film archives holding prints whose only surviving audio is the optical
  track, and small archives that cannot afford a sound scanner. Restoration workflows routinely
  re-record optical sound; a browser tool that does a first pass from an existing frame scan turns a
  paid step into a free one.
- **3-min demo:** An image of film frames scrolls past; the audio strip highlights; the waveform
  builds and the room hears a 1960s voice. Then slow it down: the strip renders as a visible
  waveform you can read with your eye, matching what you hear. Side-by-side with a deliberately
  mis-aligned scan that produces warble, fixed by the alignment control.
- **Kiro fit:** Strong. PBT: synthesise a known tone → render as a variable-area strip image at known
  density → decode → assert frequency and SNR; assert density-to-amplitude monotonicity; assert
  frame-rate independence. Steering holds the optical-sound conventions (sound offset ahead of
  picture by 20/26 frames, density curve, academy curve). Excellent hook target: golden audio vectors.
- **Build:** Medium, ~8 days. Pure image → 1-D signal → resample → WebAudio; no ML, no hardware.
- **Crowding:** `optical sound` = 134 noisy hits, none a soundtrack decoder; `16mm film` = 3, none
  relevant; `keykode` = 0; `film restoration` = 42, all unrelated or generic. Nothing in the
  304-title corpus.
- **Failure risk:** Sample material. You need at least one real frame scan to be believed; scan a
  strip of any 16mm print, or be explicit that the demo runs on a synthetic strip.
- **Why not nostalgia:** It converts an unplayable physical object into an editable file. The reward
  is a voice that currently cannot be heard at all.

### ★ 4. Datecode — rescue the hidden dates and scene marks in old MiniDV tapes

- **Pitch:** Drop in a raw DV capture and get back the recording date, time and every scene break
  the camcorder wrote into the tape's subcode — metadata no current tool exposes.
- **Dead tech:** MiniDV/DV tape: DIF blocks, subcode packs, VAUX source packs carrying recording
  date/time, and REC START marks used for scene splitting. Decks and FireWire are gone; file-based
  tools ignore the subcode entirely.
- **Audience/need today:** Families and small archives with 1995–2010 camcorder tapes. Suppliers now
  sell "how to play MiniDV without a camcorder" kits and warn about tape rot and dead decks; the
  transfer market exists precisely because playback hardware is scarce.
- **3-min demo:** A .dv file that opens as "unknown date" in a normal player. Drop it in: a scene
  list appears, each with a real date and clock time, duplicates and gaps flagged, and a repaired
  timeline. Then a file with a broken index — playback stutters, the tool rebuilds it and the video
  plays end to end.
- **Kiro fit:** Strong. PBT on the pack codec (BCD date/time round-trip, invalid month/day rejection,
  arbitrary offsets), on DIF block addressing, and on scene segmentation (any sequence of REC START
  flags yields contiguous, non-overlapping scenes covering 100% of frames). Steering: DV pack tables.
- **Build:** Low–medium, ~6–8 days. Pure parsing plus a video element. The cheapest strong demo here.
- **Crowding:** `minidv` = **1** (Plasticam, an unrelated camera-app project, not Kiroween),
  `dv tape` = 3 unrelated. Nothing DV-related in the 304-title corpus.
- **Failure risk:** You must own or find one real .dv file; synthetic DV is easy to generate but a
  judge may ask. Also do not promise playback repair of physically damaged tape — promise index and
  metadata repair only.
- **Why not nostalgia:** The dates and scene marks already exist on the tape and are currently
  unreadable. "When was this filmed?" is a question people still cannot answer.

### ★ 5. Chain — eLoran: a terrestrial position fix when GPS is jammed

- **Pitch:** Decode Loran-C pulses, compute a hyperbolic fix, and show a vessel holding position
  while GPS is denied.
- **Dead tech:** Loran-C: 100 kHz pulsed terrestrial navigation, chains identified by group repetition
  interval, position from time-difference-of-arrival hyperbolas. The US declared it obsolete in 2009
  and shut it down in 2010.
- **Audience/need today:** eLoran is being actively rebuilt as the GPS backup. Reported 2025 maritime
  jamming and spoofing incidents (including groundings and a collision) drove a UK proposal to the
  IMO for eLoran as resilient PNT; Germany is testing eLoran for PNT resilience; inside GNSS and the
  Resilient Navigation & Timing Foundation both track the resurgence. Loran is "extremely hard to
  jam" and independent of satellites (snippets, target pages not opened — treat specifics as
  **unverified**).
- **3-min demo:** A map with a vessel track. GPS panel: fix drifts, then jumps 40 km and a spoof flag
  fires. Switch to Loran: pulses lock, TDOAs invert to a fix, the track snaps back onto the channel.
  A confidence panel shows SNR per station and refuses a fix when only two chains are heard.
- **Kiro fit:** Strong. PBT: hyperbolic solver invariants (mirror symmetry, baseline scaling, fix
  inside the chain's service area), timing-jitter tolerance, cycle-slip recovery, and "two stations
  can never yield a fix". Steering holds Loran constants (GRI, pulse shapes, skywave delay). Good
  spec story: acquisition → tracking → TDOA → fix → integrity.
- **Build:** Medium–high, ~10–12 days. DSP plus a small solver; the geometry is the easy half, the
  pulse tracking is the time sink.
- **Crowding:** `loran` = **1** (skinny-man, unrelated). Nothing navigation-related in the 304-title
  corpus.
- **Failure risk:** Everything is simulated unless you can capture a real eLoran signal, and judges
  punish "simulation dressed as reception". Label the source honestly and make the integrity/refusal
  behaviour the star.
- **Why not nostalgia:** GPS jamming is a live 2025–2026 safety and insurance problem; a terrestrial
  backup is policy, not sentiment.

### 6. Bleep — a private pager network you can run in a hospital

- **Pitch:** A real POCSAG pager link: type an alert, hear the tones, the pager in the next room
  displays the message — no Wi-Fi, no app, no account, battery for a month.
- **Dead tech:** POCSAG paging: 512/1200/2400 bps FSK, batches of 8 codewords, 18-bit-capable
  addresses, BCH(31,21) error correction plus parity.
- **Audience/need today:** Hospitals. The NHS was told in 2019 to drop pagers by 2021 and is still on
  its "final leg" of replacement in 2025–2026 because the bleep reaches places phones do not.
  Pager vendors still sell clinical paging.
- **3-min demo:** Send "CATH LAB 3" from a browser; the speaker plays the burst; a second browser tab
  styled as a pager beeps and prints the text. Then flip bit errors into the stream: the BCH decoder
  corrects silently and a counter shows corrections.
- **Kiro fit:** Excellent and cheap. PBT: BCH encode/decode over all single-bit error positions, address
  range and function-bit invariants, batch framing, "never emit a message with an uncorrected error".
- **Build:** Low–medium, ~7 days. WebAudio FSK + a decoder; a phone browser is the pager.
- **Crowding:** `pocsag` = **0**, but `pager` = 327 and one Kiroween-adjacent project exists:
  **"8282: the pager code, resurrected"** (Korean numeric pager slang; built with fast-check + Kiro +
  Web Audio). Different idea, same shelf, same PBT flavour. See warnings.
- **Failure risk:** Being read as a repeat of 8282. Lead with the radio layer and error correction,
  never with "pagers are back".
- **Why not nostalgia:** Clinical alerting still depends on this radio layer because it works where
  Wi-Fi fails; the demo is a working link, not a skin.

### 7. Reproducing — read a player-piano roll, including its expression codes

- **Pitch:** Scan a 1920s Ampico or Duo-Art roll and get a performance, not just notes: the dynamics
  live in a second row of perforations almost nobody decodes.
- **Dead tech:** Reproducing piano rolls: note perforations plus expression perforations that encode
  pedal and hammer intensity, played back by machines that no longer exist in numbers.
- **Audience/need today:** Player-piano museums, collectors, and musicology. Paper rolls are acidic
  and embrittling; the performances are primary evidence of how the composer actually played.
- **3-min demo:** A roll image scrolls; note holes become a piano-roll view; audio plays flat. Toggle
  "expression" and the same notes gain phrasing. A graph shows the decoded intensity curve.
- **Kiro fit:** Good. PBT: roll encode → decode round-trip, hole-geometry tolerance (skew, stretch,
  imperfect punches), tempo-map monotonicity, no notes outside the 88-key range.
- **Build:** Medium, ~9 days. Image geometry is the work; audio is a small synth.
- **Crowding:** `player piano` = 147 noisy, `piano roll` = 83 noisy (top hits are music-education
  apps), nothing in the 304-title corpus.
- **Failure risk:** Without a real roll image it looks like a MIDI toy, and music demos are judged on
  taste.
- **Why not nostalgia:** It recovers an authored performance — interpretive data — that is otherwise
  lost, not the furniture around it.

### 8. Outline — transcribe handwritten shorthand by clustering, not by OCR

- **Pitch:** A page of Gregg or Pitman outlines becomes text after you label each *distinct* outline
  once; the tool does the repetition.
- **Dead tech:** Pen shorthand (Pitman, Gregg) and the stenographers' notebooks that hold decades of
  court, parliament and diary records.
- **Audience/need today:** Court and legislature record rooms, and families with shorthand diaries.
  Pitman is still taught and examined in India; shorthand reporters remain scarce — Lok Sabha
  Parliamentary Reporter posts still require 160 wpm. The problem is the *archive*, not new writing.
- **3-min demo:** A scanned page; outlines segment and cluster into ~60 shapes; the operator labels
  six; the page fills in progressively, with unlabelled clusters left visibly blank rather than
  guessed. Progress counter: 6 labels, 71% of the page resolved.
- **Kiro fit:** Good. PBT: cluster assignment is invariant to rotation/slant/scale within stated
  bounds; no two clusters share a centroid within epsilon; determinism across runs (seed).
- **Build:** Medium–high. Stroke segmentation is the risk; keep the promise to "clusters + assisted
  labelling", never "full OCR".
- **Crowding:** `gregg shorthand` = 2 (shorterhand is a typing aid; no clustering), `pitman` = **0**,
  `shorthand` = 253 noisy. Nothing in the 304-title corpus.
- **Failure risk:** Handwritten-stroke segmentation on real pages can eat the whole fortnight; scope
  to pre-segmented outlines or a single writer's page.
- **Why not nostalgia:** It makes an unreadable archive searchable with a bounded amount of human
  effort — a labour-cost argument, not a style one.

### 9. NICAM — the digital stereo hiding inside analogue TV recordings

- **Pitch:** Old broadcast tapes carry a digital stereo track that ordinary players decode as hiss;
  this pulls the clean audio out.
- **Dead tech:** NICAM 728: digital stereo audio carried in a subcarrier alongside the analogue TV
  sound, switched off with analogue television.
- **Audience/need today:** Broadcast archives and off-air recording collections in the UK, Hong Kong
  and much of Europe. The picture survives; the stereo often does not get decoded.
- **3-min demo:** A capture plays with hiss and one channel; hit decode and stereo appears with a
  bit-error count. Then a corrupted segment: audio mutes and flags rather than crackling.
- **Kiro fit:** Strong PBT: frame sync, bit interleaving/de-interleaving round-trip, parity and
  scaling-range checks, mute-on-error invariant.
- **Build:** Medium, ~8 days. DSP only.
- **Crowding:** `nicam` = **0** on all of Devpost.
- **Failure risk:** Needs a real off-air capture; and it sits in the same "audio DSP" family as wave
  1's Weatherfax, so a judge comparing the two may see one trick twice.
- **Why not nostalgia:** Broadcast audio that exists but is unlistenable is a preservation failure.

### 10. COM — computer-output microfilm, decoded

- **Pitch:** Banking and insurance history sits on COM fiche written by 1970s mainframes; this reads
  it back into rows and columns.
- **Dead tech:** COM (computer output microfilm): line-printer output photographically reduced onto
  fiche at fixed pitch, with an eye-readable title strip and a machine-readable index.
- **Audience/need today:** Banks, insurers and pension funds holding statement archives; auditors and
  customers requesting historic records. The fiche exists; the readers and the index software do not.
- **3-min demo:** A fiche image; the grid is detected; one frame is OCR'd into a table; a search for an
  account number jumps to the right frame. Then a skewed frame is auto-corrected.
- **Kiro fit:** Medium. PBT on fixed-pitch line/column segmentation, frame indexing and page-order
  reconstruction; steering holds COM formats (48x, 42x reduction, titling).
- **Build:** Medium–high. Fixed pitch helps a lot, but real fiche scans are rough.
- **Crowding:** `microfilm` = 6 (unrelated: games, a spec ad, CSI crowd-sourced indexing),
  `microfiche` = 2 per wave 1. Distinct from wave 1's "Fiche" (which *writes* an archival sheet); this
  *reads* machine-generated fiche.
- **Failure risk:** Same medium as wave 1's Fiche — judges may collapse the two. Also needs a real
  fiche scan.
- **Why not nostalgia:** It unlocks records that are legally required and currently unreadable.

### 11. MPT1327 — decode a trunked radio network's signalling

- **Pitch:** Turn a recorded control channel into a live view of who called whom on a legacy trunked
  radio system.
- **Dead tech:** MPT1327 trunked radio signalling: 1200 bps FFSK control channel, codewords for
  channel grant, registration and short data.
- **Audience/need today:** Utilities, mining, ports and disaster-response fleets still running MPT1327
  because replacement is expensive; auditors and engineers need to read what the network is doing.
- **3-min demo:** Play a control-channel capture; codewords decode; a call appears as a grant, then a
  unit registers, then an emergency-priority call pre-empts.
- **Kiro fit:** Good PBT: codeword parity/checksum, field extraction, and a state machine invariant
  that every grant references a known channel and unit.
- **Build:** Medium, ~9 days. Signal work is modest, protocol breadth is the cost.
- **Crowding:** `mpt1327` = **0**.
- **Failure risk:** Very few judges will recognise the technology, and the demo is a table of
  codewords unless the call story is animated.
- **Why not nostalgia:** It is an observability tool for infrastructure that is still in service.

### 12. XOT — X.25 over IP, for machines that never got replaced

- **Pitch:** A bridge and decoder for X.25 traffic that still moves money and rolling stock, with a
  clean packet view instead of a hex dump.
- **Dead tech:** X.25: LAPB framing, virtual circuits, packet-level protocol; superseded by Frame
  Relay then IP, but kept alive by ATMs, rail signalling and utility SCADA over XOT.
- **Audience/need today:** Payment and transport operators maintaining 1980s endpoints; engineers who
  inherit a capture and no decoder.
- **3-min demo:** Load a capture: virtual circuits appear, a call setup and clear, and a data flow
  reassembles into a readable transaction. Then bridge two emulated endpoints live.
- **Kiro fit:** Strong PBT: LAPB FCS, sequence-number wraparound, segmentation/reassembly of large
  packets, "no packet emitted that fails FCS".
- **Build:** Medium, ~9 days.
- **Crowding:** `x.25` = 35,828 (noisy, meaningless), `frame relay` = 363 (noisy), `isdn` = 2.
- **Failure risk:** Enterprise-plumbing framing scores poorly on Design and Presentation; needs a
  human story (an ATM that stops working) to survive.
- **Why not nostalgia:** Live infrastructure with no modern tooling.

### 13. Talking Book — the four-track cassette that blind readers lost

- **Pitch:** Recover the speech from a talking-book cassette: four tracks at half speed, indexed by
  tones, unplayable on any current machine.
- **Dead tech:** Talking-book cassettes (NLS/RNIB style): 4 tracks, 15/16 ips, tone-indexed, played on
  special machines with pitch correction.
- **Audience/need today:** Blind and print-disabled library members and the libraries holding the
  masters; the audio exists, the players do not.
- **3-min demo:** Play the raw capture — two voices at once, wrong pitch. Separate the tracks, correct
  speed, and a single narrator speaks clearly; the index tone jumps a chapter.
- **Kiro fit:** Good PBT: resampling/pitch invariants, track separation SNR bounds, index-tone
  detection under wow and flutter.
- **Build:** Medium, ~8 days.
- **Crowding:** `talking book` = 531 noisy, `braille` = 606 — accessibility audio is crowded on
  Devpost generally. Nothing cassette-specific in the 304-title corpus.
- **Failure risk:** Needs a real cassette capture, and accessibility claims invite scrutiny of whether
  actual users were involved.
- **Why not nostalgia:** It is the only remaining path to the content for the people it was made for.

### 14. Diazo — rescue a faded blueprint before it disappears

- **Pitch:** Ammonia-diazo prints fade to nothing; this recovers the linework from a phone photo and
  produces an archivally usable scan.
- **Dead tech:** Diazo/blueprint reproduction: UV exposure through a translucent original onto
  diazo-coated paper, developed in ammonia vapour. The process died; the drawings did not.
- **Audience/need today:** Architecture and infrastructure archives holding diazo sets from
  1950–1990 that are fading irreversibly; owners needing drawings for renovation or safety cases.
- **3-min demo:** A washed-out cyan print; one control restores contrast, a second removes the paper
  texture; dimension text becomes legible; a before/after slider.
- **Kiro fit:** Medium. PBT on tone-curve monotonicity, "no invented line" (edge preservation bounds),
  and geometry preservation (corner detection stable after enhancement).
- **Build:** Low–medium, ~5 days. Risk: it reads as a photo filter.
- **Crowding:** `diazo` = **0**; `blueprint` = 2,861 noisy (design tools use the word constantly).
- **Failure risk:** Perceived as an image filter with a history lesson — needs the fading-chemistry
  evidence and an archive partner to score Impact.
- **Why not nostalgia:** The information is being physically destroyed on a known timescale.

### 15. Stereo — make a stereograph viewable again

- **Pitch:** Take a 1900 stereograph card, split the pair, align it, and view it in 3D on a phone —
  the format died, the photographs did not.
- **Dead tech:** Stereoscopes and stereograph cards (View-Master, Keystone-style cards): two near
  identical prints viewed through lenses.
- **Audience/need today:** Photographic archives and museums with large stereograph holdings that are
  catalogued as flat images and therefore never seen in depth.
- **3-min demo:** A card photo; both halves detected and rectified; a wipe between flat and stereo;
  then an anaglyph and a phone-holder view.
- **Kiro fit:** Medium. PBT: rectification invariance, epipolar alignment residual bounds, "disparity
  never exceeds card geometry".
- **Build:** Low–medium, ~6 days.
- **Crowding:** `stereograph` = **1** (unrelated), `stereoscope` = 13 (3D-reconstruction projects, none
  archival). Nothing in the 304-title corpus.
- **Failure risk:** Design-heavy, Impact-light; a judge may ask "who needs this?" — answer with the
  archive, not the novelty.
- **Why not nostalgia:** Depth is the missing half of the artefact; catalogues are currently losing it.

### 16. Deck — RS-422 VTR control for tape archives

- **Pitch:** A browser console that drives broadcast tape machines over the 9-pin protocol, so
  archiving a Betacam shelf stops requiring a 1990s edit suite.
- **Dead tech:** Sony 9-pin (RS-422) VTR control: a simple command/response protocol with timecode,
  shuttle and status polling, plus Betacam/U-matic transports.
- **Audience/need today:** Broadcast and institutional archives with decks but no control software;
  the decks still work, the automation does not.
- **3-min demo:** A deck emulator and a real-looking transport panel: jog, shuttle, cue to timecode,
  mark in/out, batch-capture a list; a status log shows the protocol frames.
- **Kiro fit:** Good PBT: command framing and checksum, timecode arithmetic (drop-frame), state machine
  (no cue while recording), idempotent stop.
- **Build:** Medium, ~8 days; the protocol is documented and small.
- **Crowding:** `rs-422` = 1,257 noisy (GPIO/electronics projects), nothing archival.
- **Failure risk:** Without a deck it is an emulator demo, which judges discount heavily.
- **Why not nostalgia:** It is the only way to get specific tapes off specific shelves.

### 17. Seismogram — digitise smoked-paper earthquake records

- **Pitch:** Old seismograms are photographs of a pen scratch on soot; this turns them back into
  waveforms that modern analysis can use.
- **Dead tech:** Analogue seismographs: Wiechert and Press-Ewing drums, smoked or photographic paper,
  time marks, and hand-measured magnitudes.
- **Audience/need today:** Observatory archives extending the earthquake catalogue backwards; hazard
  models and magnitude re-estimation need the pre-digital record.
- **3-min demo:** A drum scan flattens (rotation removed), three traces separate, time marks lock, and
  the waveform overlays a modern station's record of the same event.
- **Kiro fit:** Strong PBT (synthetic trace with known period/amplitude → recovery within tolerance;
  time-mark spacing invariants; gap handling).
- **Build:** Medium–high, ~10 days. Overlaps Marigram technically — pick one, not both.
- **Crowding:** `seismograph` = 14 but all metaphorical ("a seismograph for Twitch chat", "negotiation
  seismograph"); nothing geophysical in the 304-title corpus.
- **Failure risk:** Same optics problem as Marigram with a smaller audience, and a judge may not know
  why old seismograms matter.
- **Why not nostalgia:** Extends a scientific catalogue that cannot be extended any other way.

### 18. Keykode — read film edge codes from a scan

- **Pitch:** Every film negative carries a machine-readable frame address between the perforations;
  this reads it, so a scan can be matched back to the reel it came from.
- **Dead tech:** Keykode / latent edge barcodes, printed at manufacture: a prefix, a count, and a
  frame offset identifying each foot of film.
- **Audience/need today:** Film labs and restoration houses matching scans to negatives, and archives
  proving provenance of a print.
- **3-min demo:** A strip image; the barcode decodes to a keycode; the frame log builds; a mismatch is
  flagged when two reels are spliced together.
- **Kiro fit:** Good PBT: barcode encode/decode with damage, offset arithmetic, monotonic frame
  numbering across splices.
- **Build:** Medium, ~8 days; low contrast and perforation interference are the pain.
- **Crowding:** `keykode` = **0**, `film edge code` = 174 noisy (unrelated).
- **Failure risk:** Very small audience and no emotional hook; likely 4th place in a 5-axis score.
- **Why not nostalgia:** It answers "which reel is this?" — a provenance question with legal weight.

---

## (b) Ideas rejected and why

| Rejected | Reason |
|---|---|
| Spirit duplicator / mimeograph / hectograph | `mimeograph` = 0, `spirit duplicator` = 0 — beautifully unclaimed, but no defensible modern need. Would be a craft demo, and Impact is 20% of the score. |
| Cash register / adding machine / comptometer | No audience today; arithmetic is free. |
| Optacon | `optacon` = 1 (NaviGlove, unrelated). Genuinely dead and genuinely needed, but the output device is a tactile array — hardware purchase, out of scope. |
| Cheque MICR / E-13B | Not dead in India: cheque truncation clearing runs on it today. No resurrection. |
| ISO 8583 / SWIFT MT / EDIFACT | Alive (ISO 8583) or a live migration (MT → ISO 20022), not a revival; also visually dull. `edifact` = 3. |
| PLC ladder logic | Already claimed in the corpus: `plc-frankenstein-one-ai-agent-many-plcs`. `plc` = 121. |
| Cadastral maps / land records | `cadastral` = 28 including Indian land-record projects (`land-records-for-india`, `3d-cadastral-system`); and paper cadastral maps are still legally authoritative, so "dead" fails. |
| Braille anything | `braille` = 606; heavily contested. |
| Ration card / voter roll | Civic CRUD with no dead-technique core to resurrect. |
| Typewriter forensics (identify a machine from typebar defects) | Great story, wrong size: glyph-defect clustering is a research problem, not a 14-day one. |
| Jacquard cards → weave draft (Varanasi) | Real Indian need (`jacquard` = 10, incl. a Loom game; card-punching studios exist), but the cards are still in production — the tech is not dead, so the category premise collapses. |
| LaserDisc CX noise reduction | `laserdisc` = **0**, but `ld-decode` already ships a CX decoder prototype and a standalone PCW CX decoder exists — prior art in open source. Would be "reimplement ld-decode". |
| Slide rule, log tables, language labs, teaching machines | Wave 1's filmstrip territory or too thin technically. |
| Scantron / OMR | Wave 1 flagged it as claimed (Testduino, digiTron, Scanify, ParseTron, Pupil). |
| Chart recorder / paper ECG | Direct prior art outside Kiroween: "TraceGate: Calibrated Paper-ECG Digitizer" (Vite/FastAPI, Viterbi trace tracking, PhysioNet evaluation). Do not enter. |

---

## (c) Top five, one line each

1. **Marigram** — tide-gauge chart → sea-level series; zero crowding, perfect PBT, real climate-data
   rescue funding already on the record.
2. **Chord** — a working stenotype for courts sitting on 5 crore cases; hardest-to-fake demo, best
   "before/after" (no transcript → transcript).
3. **Optical** — read sound off a film's optical track; image becomes audio in front of the judges, and
   no one else will pick film sound.
4. **Datecode** — MiniDV subcode dates and scene marks; cheapest strong build, honest hidden-metadata
   story, `minidv` = 1.
5. **Chain** — eLoran fix while GPS is jammed; strongest current-events need, with a solver whose
   invariants make property-based tests look like the point of the project.

---

## (d) Crowding warnings

1. **Pager is taken in all but name.** `pager` = 327, and **"8282: the pager code, resurrected"** is a
   Kiroween-era project built with `kiro` + `fast-check` + web-audio that already trades on pager
   nostalgia and property-based tests. A POCSAG entry must lead with the radio layer (BCH, batches,
   FSK) and never with the word "pager" as the pitch. Note: 8282's page says kiroween but it is absent
   from the 304-title corpus, so the corpus is an approximation.
2. **Audio-DSP revivals are becoming a genre.** Wave 1 already has Weatherfax (HF fax) and Baudot
   Bridge (TTY tones). NICAM, POCSAG and optical sound are all "signal in, meaning out" demos. One is
   fine; two in the same submission reads as one trick. Also **paper-ECG digitising has direct prior
   art** (TraceGate) and **LaserDisc decoding is open-sourced** (ld-decode), so neither is a free win.
3. **Metaphor pollution in search.** `seismograph` = 14 and `blueprint` = 2,861 return metaphor hits,
   not topic hits; `x.25` = 35,828 is meaningless. Only the zero/near-zero counts (marigram, nicam,
   pocsag, mpt1327, diazo, keykode, laserdisc, pitman, minitel, videotex) are trustworthy crowding
   evidence.
4. **Industrial/PLC and land-records lanes are already occupied this year** — `plc-frankenstein…` in
   the corpus; `land-records-for-india` and `3d-cadastral-system` globally. Do not enter either.

---

## URLs actually loaded

Devpost corpus (13 pages, 304 titles extracted):

- https://devpost.com/software/search?query=kiroween&page=1 … `&page=13`

Devpost global term queries (48): `laserdisc`, `player piano`, `piano roll`, `typewriter`,
`mimeograph`, `spirit duplicator`, `slide rule`, `view-master`, `music box`, `cash register`,
`adding machine`, `blueprint machine`, `pocsag`, `pager`, `rds`, `strip chart`, `chart recorder`,
`holter`, `x-ray film`, `minidv`, `microfilm`, `ledger card`, `passbook`, `stenotype`, `micr`,
`cheque`, `iso 8583`, `swift mt`, `edifact`, `cadastral`, `land records`, `ration card`, `voter roll`,
`shorthand`, `gregg shorthand`, `pitman`, `ladder logic`, `plc`, `x.25`, `frame relay`, `isdn`,
`optacon`, `braille`, `talking book`, `keykode`, `film edge code`, `stereoscope`, `dv tape`,
`loran`, `tide gauge`, `marigram`, `seismograph`, `stereograph`, `blueprint`, `nicam`, `ocr-b`,
`mpt1327`, `paperpilot`, `teletype`, `analog video capture`, `optical sound`, `diazo`, `rs-422`,
`16mm film`, `film restoration`, plus Kiroween-scoped probes: `kiroween pager`, `kiroween laserdisc`,
`kiroween braille`, `kiroween stenograph`, `kiroween jacquard`, `kiroween loom`, `kiroween ecg`,
`kiroween film` (multi-term queries proved unreliable — the scoped probes returned 0 even for a term
that does appear; treat them as no evidence either way).

Devpost project pages opened:

- https://devpost.com/software/8282-the-pager-code-resurrected
- https://devpost.com/software/tracegate-calibrated-paper-ecg-digitizer-measured-honestly
- https://devpost.com/software/plasticam
- https://devpost.com/software/shorterhand
- https://devpost.com/software/loom-5g6dbl
- https://devpost.com/software/naviglove
- https://devpost.com/software/land-records-for-india
- https://devpost.com/software/3d-cadastral-system-bf49x6

DuckDuckGo lite result pages (snippets only; target pages not opened):

- https://lite.duckduckgo.com/lite/?q=eLoran+Loran-C+revival+GPS+jamming+backup+2025
- https://lite.duckduckgo.com/lite/?q=PSMSL+tide+gauge+analogue+charts+digitisation+backlog
- https://lite.duckduckgo.com/lite/?q=India+courts+stenographer+shortage+shorthand+writers+pending+cases
- https://lite.duckduckgo.com/lite/?q=MiniDV+tape+archive+deck+obsolescence+camcorder+tapes+2025
- https://lite.duckduckgo.com/lite/?q=NHS+pager+numbers+hospitals+still+using+pagers+2025
- https://lite.duckduckgo.com/lite/?q=LaserDisc+CX+noise+reduction+decoder+software+audio+capture
- https://lite.duckduckgo.com/lite/?q=Varanasi+handloom+jacquard+cards+dying+designs+archive+weavers
- https://lite.duckduckgo.com/lite/?q=Parliament+shorthand+stenographers+India+Rajya+Sabha+Lok+Sabha+records
- https://lite.duckduckgo.com/lite/?q=historical+tide+gauge+chart+images+digitisation+data+rescue+climate

## Unverified

- The exact 2026 submission count and category split (gallery still unpublished; corpus = 304 titles).
- Whether any 2026 entry uses tide gauges, stenotype, eLoran, DV subcode, optical sound, NICAM,
  MPT1327, COM fiche, diazo or Keykode — the corpus search found none, but it is a query approximation.
- All real-world need figures are snippet-level: PSMSL's 65,000 station-years / 2,200 stations, BODC's
  eight rescued UK sites, India's 5 crore pendency and 7,300 vacancies, 160 wpm Parliamentary Reporter
  requirement, NHS pager timeline, 2025 jamming incidents (MSC ANTONIA, FRONT EAGLE–ADALYNN). Primary
  documents were not opened.
- Technical feasibility estimates (DV subcode pack layout, NICAM frame structure, Loran pulse tracking,
  optical-sound density curve) are from general knowledge, not read from specifications in this
  session.
