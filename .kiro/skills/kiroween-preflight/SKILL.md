---
name: kiroween-preflight
description: Audit repository structure, Kiro artifacts, tests, and submission compliance for Kiroween 2026. Use when preparing for demo recording, deployment, or final submission checks.
---

## Kiroween 2026 Readiness Audit
Execute each check in order and report exact pass/fail evidence. Quote the command, its exit code, and the relevant output lines.

1. **Root `.kiro` Visibility:** Run `git status --ignored` and `git ls-files .kiro` to confirm `.kiro/specs/`, `.kiro/steering/`, `.kiro/hooks/`, `.kiro/skills/`, and `.kiro/settings/mcp.json` are tracked and NOT ignored by `.gitignore`. Report `settings/mcp.json` as a failure if it is missing or ignored.
2. **Open-Source License:** Verify `LICENSE` (MIT) exists at the repository root.
3. **Full Test & Invariant Suite:** Run `npm test` and `npm --workspace=packages/core run test:pbt` and confirm exit code `0` with all 5 property invariants passing.
4. **Clean Build & Offline Readiness:** For each workspace (`core`, `web`, `mcp-server`), run `npm --workspace=<name> run build` if that workspace defines a `build` script. Report a workspace that is missing, or has no build script, as "not yet scaffolded" rather than a failure. Confirm the default fixtures load with no API key set in the environment (`env -u OPENAI_API_KEY`).
5. **Demo Flow Check:** Create a temporary vitest file in `packages/core/tests/` that runs `Doc.InjectFlaw -> Spec.Audit -> Outline.ExtractTasks` through `runLine`. Confirm it exits without error and that the output contains a `CONTRADICTION` flag and a `BROKEN_REF` flag naming the injected `§` coordinate. Delete the temporary file afterward.
6. **Deployed URL:** Read the live app URL from the `Live demo:` line in `README.md`. If the line is missing or empty, report FAIL "no deployed URL recorded". If it exists, run `curl -sS -o /dev/null -w '%{http_code}' <url>` and expect `200`. Quote the URL and the status code. Also confirm the app loads with no API key: `env -u OPENAI_API_KEY` before the browser check. Do not count a localhost URL as deployed.
7. **Demo Video Link:** Read the `Demo video:` line in `README.md`. If missing, report FAIL "no demo video recorded". If present, run `curl -sSL -o /dev/null -w '%{http_code}' <url>` and expect `200`. Confirm the video runs under 3 minutes and quote the duration you observed. A link that is not public counts as FAIL.
8. **Kiro Usage Write-up:** Confirm `KIRO_USAGE.md` exists at the repo root and is tracked by git (`git ls-files KIRO_USAGE.md` prints the path). The write-up must name at least these items, each with evidence: the hook runs (count, with the session transcript path), the `/kiroween-preflight` runs, the MCP tool calls made from kiro-cli, and one bug that a Kiro-driven check found and fixed. Report FAIL if the file is missing, untracked, or does not name these items.
