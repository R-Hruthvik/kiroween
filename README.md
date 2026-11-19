# Augeron

Augeron fuses two abandoned computing paradigms into one local-first workbench for reading and verifying AI-generated specs:

- **Engelbart's NLS / Augment (1968):** permanently addressable sections (`§2.1b`) and single-key View-Specs (`a`, `h`, `f`, `u`, `r`) that filter a document without changing its text.
- **Wirth's Oberon System (1986):** no menus or modals. Any `Module.Action` token is a live command, run by middle-clicking it against the active selection. Commands chain with `->`.

Everything runs offline in the browser with deterministic analyzers. An optional OpenAI-compatible key can enrich `Spec.Audit` and `Spec.Tighten`.

## Repository layout

| Path | Purpose |
| --- | --- |
| `packages/core` | Pure TypeScript domain engine. No DOM, React, or Node `fs` imports. |
| `packages/web` | React + Vite workbench UI (Phase 4). |
| `packages/mcp-server` | Local stdio MCP server exposing core tools to Kiro (Phase 5). |
| `.kiro/` | Kiro specs, steering, and hooks. Committed on purpose. |

## Development

```bash
npm install
npm test          # unit and property tests across workspaces
npm run test:pbt  # fast-check invariant suite only
```

Requires Node.js 22 or newer.

## License

MIT. See [LICENSE](./LICENSE).

---

## Hackathon context (Kiroween 2026)

This is the build repo for our Kiroween 2026 hackathon project (Kiro × Devpost, $100,000 prize pool).

- Hackathon: https://kiroween.devpost.com. Deadline **Dec 4, 2026, 2:00 PM PT**.
- Categories: Resurrection · Frankenstein · Skeleton Crew · Costume Contest.
- This repo is the **public judging repo**. It must keep the `/.kiro` directory at root (specs, hooks, steering), an OSS license, and a working app.

> Research is in `docs/`. Final pick and build plan are in `docs/04-final-pick.md`.
