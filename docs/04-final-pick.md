# Kiroween 2026 — Final Pick (DRAFT, pending approval)

## External AI cross-check (Nov 18, 2026)

Asked both ChatGPT and Gemini (via browser) to evaluate Gravekeeper Crew vs PHANTOM vs NECROMANCER OS.

| Question | ChatGPT verdict | Gemini verdict |
|---|---|---|
| Gravekeeper Crew | Solid but "automated repo maintenance tool with Halloween dashboard" risk; 8.4/10; weakest innovation | Category-prize only ($5k Resurrection); arbitrary-repo parsing is a scope trap; demo compile failure risk |
| PHANTOM (incident-response crew) | Ranked #1, 9.5/10 business relevance | Too dry for a Halloween hackathon; over-engineering scope trap; judges fatigue on DevOps tools |
| NECROMANCER OS (dead-internet revival) | Ranked #2, most memorable visual concept | **"The absolute winner if executed correctly"** — hits Resurrection + Costume-grade design + natural Kiro-depth |

**Agreement:** Gravekeeper is the weakest grand-prize candidate. Disagreement: PHANTOM vs NECROMANCER for #1 — ChatGPT optimizes for impact/rubric, Gemini optimizes for theme/memorability.

## Decision: NECROMANCER OS (Resurrection category)

Why it beats PHANTOM here:
1. **Presentation (20%)** — Kiroween judges watch ~hundreds of videos. A resurrected 1998 homepage is emotional and visual; an outage log dashboard is a corporate demo. Gemini is right that dry enterprise tools underperform at themed hackathons (ChatGPT's rubric math underweights theme fatigue).
2. **Innovation (20%)** — transpiling dead web stack (early JS, table layouts, Flash-era) into modern React while *preserving the ghost* is a story no 2025 winner did. Repo-maintenance and incident-response both have existing analogs.
3. **Feasibility** — with a Wayback Machine MCP + curated scope (3 chosen dead sites), the failure mode is controllable. PHANTOM needs a convincing fake production incident; one flaky sim scene sinks the demo.
4. **Design (20%)** — "terminal of the dead" UI: paste a dead URL → watch agents dissect it live → resurrected side-by-side with the original. Doubles as Costume-Contest-grade polish without entering that category.

## Concept

**NECROMANCER OS — "The internet forgot its past. We're bringing it back."**
User pastes the URL of a dead website/app. A Kiro Crew of agents:
1. **Archivist** — fetches archived source + assets via a custom **Wayback Machine MCP** server
2. **Time Traveler** — identifies era, browser assumptions, obsolete APIs
3. **Reverse Engineer** — reconstructs intended interactions from code
4. **Translator** — converts obsolete code → modern stack (React/TS)
5. **Artist** — preserves original visual identity (steering doc enforces it)
6. **QA Ghost** — verifies it runs in a modern browser
7. **Curator** — writes historical documentation + side-by-side compare

UI: neon-haunted "terminal of the dead" graveyard; tombstone per site; RESURRECT button; live agent log; original-vs-revived split view.

## Scope (hard limits — scope creep is the documented #1 risk)

- **3 curated dead experiences** only:
  1. A GeoCities-style personal homepage (GIFs, counters, guestbook, tables layout)
  2. A classic guestbook app (form + server logic)
  3. A legacy interactive mini-game or DHTML toy
- Pipeline works for these 3 archetypes; generic "any site" is a non-goal (disclosed honestly in write-up as the current boundary).
- No PHP/Perl backend execution in-browser — guestbook server logic is modernized client-side or via demo server.

## Kiro depth checklist (matches submission write-up requirements exactly)

- **Kiro Crew**: the 7 agents above (also qualifies repo for Best Kiro Crew App bonus)
- **Specs**: spec-driven pipeline definition
- **Steering**: `legacy-transpile.md` + `preserve-visual-identity.md`
- **Hooks**: auto-run QA checks when generated components change
- **MCP**: custom Wayback Machine server (fetch archived pages/assets/metadata)
- **PBT**: property-based tests on translator round-trips where sensible

## Prize strategy

- Main: Resurrection $5k + overall pool ($30k/$20k/$10k)
- Bonus stack (free points): Best Demo ($1k), Bonus Blog Prize (blog post → 2,000 credits, top-100 pool), Social Blitz (post with `#KiroweenHackathon26`), Best Kiro Crew App ($1k). Startup/Student/Ghost prizes depend on the builder's eligibility — pending operator answers.

## Build plan (17 days)

- Days 1-3: Wayback MCP server + Crew skeleton + spec
- Days 4-9: pipeline per archetype (homepage → guestbook → game)
- Days 10-12: graveyard UI + live agent log
- Days 13-15: polish, fixes, deploy working app
- Days 16-17: video, blog post, social post, submission form

## Risks

- Wayback availability/rate limits → pre-cached fixture fallback for demo
- LLM transpile brittleness → steering docs + human-curated targets; QA Ghost gate before "resurrected" verdict
- Demo crash → recorded screen recording as backup, plus pre-run state
