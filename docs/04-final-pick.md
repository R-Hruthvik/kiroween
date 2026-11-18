# Kiroween 2026 — Final Pick v2 (single deep resurrection) — DRAFT, pending approval

## Strategy revision

User challenge (correct): rules say "uses Kiro (IDE, CLI, Web, and/or Kiro Crew)" — **Kiro Crew is optional**, and a generic "resurrect anything on demand" engine dilutes story and polish. Re-asked ChatGPT; asked Claude (Sonnet 5.5, medium effort) with one complete brief.

**All AIs now agree: build ONE deep resurrection, not an engine.**

| | ChatGPT (re-evaluated) | Claude |
|---|---|---|
| Engine vs single project | "Build a resurrection, not a resurrection engine." Deep resurrection 92/100 vs engine 76/100 | "Yes." Engine = demo of a pipeline, no emotional payload; arbitrary input = unrehearsable demo failure; 2025 winners were all legible in one sentence |
| Best single project | HyperCard (94/100; GeoCities 87, Flash 87, Pipes 86, Reader 78) | HyperCard — "but not ChatGPT's version" |
| Key caveat | Don't confuse single focus with shallow build; judges must feel the original magic | **Prior art exists**: Decker (browser HyperCard successor), LiveCode, Internet Archive in-browser stack playback. Novelty must come from the combination, and the video should name prior art and say what we go beyond |

## The pick: a haunted HyperCard revival (Resurrection category)

**One-liner:** "Drag in a real 1989 HyperCard stack — it runs in your browser, and you can edit its scripts." Framed as a haunted Macintosh: stacks are "séances" for dead software.

**What we build:** browser-based HyperCard revival — cards, backgrounds, buttons, fields, browse/edit modes, System 6–style chrome, HyperTalk subset interpreter, classic visual effects (wipe/iris/dissolve), JSON stack format, share/export URL, plus a custom MCP server so Kiro can author stacks from a prompt.

**Why it wins each pillar:**
- Impact: "software authoring for ordinary people" argument is still true; judges 35+ feel it instantly, others get a charming 1-bit Mac
- Kiro depth: specs per subsystem (stack model, editor, interpreter, export); PBT on the HyperTalk interpreter (parse/round-trip/eval); hooks run tests on save; steering encodes the HyperTalk grammar + System 6 style guide; MCP = stack authoring
- Design: complete product — menu bar, window chrome, sounds, effects
- Innovation: real-stack import + Kiro-driven authoring loop + haunted framing (beyond Decker/LiveCode/Archive playback)
- Presentation: dead 1989 stack → live in browser → edited live → shared. One take, rehearsable.

## 17-day plan (submit by Dec 3, Dec 4 = buffer)

- D1–2: steering files (vision, HyperTalk grammar, style guide) + specs for 4 subsystems; JSON stack format; render a card
- D3–6: runtime + editor (cards, backgrounds, buttons, fields, modes, nav, effects, sounds, minimal paint layer)
- D4–9: HyperTalk interpreter (on mouseUp, go to, put into, if/repeat, ask/answer, visual effect, play, send, chunk expressions) + PBT suite + save hook
- D7–11: share/export URL + MCP server (add card/button/set script → Kiro authors stacks from prompts)
- D10–13: real-stack import, timeboxed 3 days, exactly 2–3 freely redistributable stacks. Cut if failing by D13 — fallback: own stacks + prompt-to-stack MCP flow
- D12–15: 3 showcase stacks (game, interactive story, utility) + haunted-Mac polish
- D15–17: video, blog post, social post, submission. Video recorded by D15.

**MVP must include:** edit/browse modes, buttons, fields, navigation, working HyperTalk subset, share URL, 3 polished stacks, ≥1 imported real stack.
**Cut:** color, XCMDs, deep paint tools, accounts, cloud, collab, mobile, full compatibility claims.

**#1 demo risk:** real-stack import (binary format + HyperTalk long tail) — choose demo stacks FIRST and build toward them.

## Bonus prizes to stack (pending eligibility answers)

Best Demo (automatic) · Bonus Blog Prize (blog post → 2,000 credits) · Social Blitz (#KiroweenHackathon26 post) · Best Kiro Crew App — optional; only if we ship a small Crew companion, otherwise skip.

## Status

Awaiting operator approval before build starts.
