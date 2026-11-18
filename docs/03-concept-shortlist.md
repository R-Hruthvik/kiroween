# Kiroween 2026 — Concept Shortlist (scored)

Judging: Impact 20% · Kiro depth 20% · Design 20% · Innovation 20% · Presentation 20%.
"Win chance" also weighs competition density (2025: 747 subs; Resurrection was the most crowded category) and 17-day feasibility.

## Scoring (1-5 per criterion, /25)

| # | Concept | Category | Impact | Kiro depth | Design | Innovation | Presentation | Build risk | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **The Gravekeeper Crew** — agent crew that resurrects dead GitHub repos | Resurrection | 4 | 5 | 4 | 4 | 5 | Low | **22** |
| 2 | GhostNet — packet radio (AX.25/BBS) → modern chat bridge | Frankenstein | 5 | 4 | 3 | 5 | 4 | High (radio hw) | 21 |
| 3 | Voice agent that navigates legacy IVR phone trees for citizens | Resurrection | 5 | 3 | 3 | 4 | 4 | High (telephony) | 19 |
| 4 | Kiro Crew "self-healing homelab/oncall" ops crew | Frankenstein | 3 | 5 | 3 | 3 | 3 | Medium | 17 |
| 5 | Skeleton Crew: offline-first store-and-forward app template (+2 apps) | Skeleton Crew | 4 | 4 | 3 | 3 | 3 | Medium | 17 |
| 6 | Paper-first interface for the elderly (print → scan → app loop) | Resurrection | 5 | 3 | 3 | 4 | 3 | Medium | 18 |
| 7 | Haunted dark-mode SaaS (SpookBnB-style) | Costume Contest | 2 | 2 | 4 | 2 | 4 | Low | 13 |

## Notes

- **2025 grand prize was a Skeleton Crew template** (InteractionKit). But 2026 clones of "dev template kit" will be common — InteractionKit clones are the new ELIZA-in-CRT cliché.
- **Kiro Crew is new in 2026** and has its own bonus prize ($1,000) judged by the Kiro team on "value/usefulness and technical innovation" from the top-50 pool. Building the project AS a Crew app double-dips: bonus prize + max Kiro-depth score.
- Resurrection 2025 winners were *literal* dead tech (fax, COBOL, ELIZA, KaiOS). "Dead software" (abandoned repos / dependency rot / legacy code nobody maintains) is the same idea applied to the judges' own daily pain — every industry judge has inherited a dead codebase.
- Concepts 2/3 have the highest raw impact but need hardware/telephony — demo risk, credit burn, 17 days. Concepts 4/5 are safe but less novel.
- Everyone writes an ELIZA/CRT-terminal clone for Resurrection. Avoid.

## Recommendation: #1 — The Gravekeeper Crew

**What:** An open-source Kiro Crew application that takes a dead/abandoned GitHub project and resurrects it end-to-end: agent crew audits the code ("archaeologist"), maps dependency rot ("mortician"), upgrades and fixes ("healer"), regenerates specs and docs ("scribe"), revives CI/tests ("pathologist"), and files a resurrection report. Graveyard dashboard UI: tombstone → resurrection animation, before/after health score.

**Why it wins each criterion:**
- Impact: real problem — thousands of abandoned OSS projects; enterprises inherit legacy code constantly. Output is actually usable OSS.
- Kiro depth: uses Crew (agents, bots, memory/lessons, scheduling), specs, hooks, steering, MCP — the exact checklist in the submission write-up requirements.
- Design: graveyard/resurrection metaphor gives a coherent, spooky-but-functional UI (also eligible to pitch at Costume elements).
- Innovation: nobody in the 2025 gallery did "agent crew revives abandoned codebase"; category-literal ("bring dead tech back to life" — dead *software*).
- Presentation: perfect video arc — show a genuinely dead repo, run the crew on camera, end with it alive (green CI) + tombstone-to-life animation.

**Build plan is light:** Crew does most of the coding; the UI is one dashboard page; no hardware, no paid APIs (GitHub API is free).
