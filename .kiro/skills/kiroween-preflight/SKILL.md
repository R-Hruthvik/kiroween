---
name: kiroween-preflight
description: Audit repository structure, Kiro artifacts, tests, and submission compliance for Kiroween 2026. Use when preparing for demo recording, deployment, or final submission checks.
---

## Kiroween 2026 Readiness Audit
Execute each check in order and report exact pass/fail evidence. Quote the command, its exit code, and the relevant output lines.

1. **Root `.kiro` Visibility:** Run `git status --ignored` and `git ls-files .kiro` to confirm `.kiro/specs/`, `.kiro/steering/`, `.kiro/hooks/`, `.kiro/skills/`, and `.kiro/settings/mcp.json` are tracked and NOT ignored by `.gitignore`. Mark `settings/mcp.json` as "not yet created" if it does not exist, since it arrives in Phase 5.
2. **Open-Source License:** Verify `LICENSE` (MIT) exists at the repository root.
3. **Full Test & Invariant Suite:** Run `npm test` and `npm --workspace=packages/core run test:pbt` and confirm exit code `0` with all 5 property invariants passing.
4. **Clean Build & Offline Readiness:** For each workspace (`core`, `web`, `mcp-server`), run `npm --workspace=<name> run build` if that workspace defines a `build` script. Report a workspace that is missing, or has no build script, as "not yet scaffolded" rather than a failure. Confirm the default fixtures load with no API key set in the environment (`env -u OPENAI_API_KEY`).
5. **Demo Flow Check:** Create a temporary vitest file in `packages/core/tests/` that runs `Doc.InjectFlaw -> Spec.Audit -> Outline.ExtractTasks` through `runLine`. Confirm it exits without error and that the output contains a `CONTRADICTION` flag and a `BROKEN_REF` flag naming the injected `§` coordinate. Delete the temporary file afterward.
