# Architecture Rules: Augeron

## 1. Package boundaries

- `packages/core` is the domain engine. It must have **zero** imports from:
  - `react` or `react-dom`
  - `window`, `document`, or any DOM API
  - `node:fs`, `fs`, or any other Node built-in I/O module
- `packages/core/tsconfig.json` must not add `DOM` to `lib`. `tsconfig.base.json` sets `lib` to `ES2022`. Keep it that way.
- Core functions take plain TypeScript objects and return plain TypeScript objects. They have no side effects and no hidden global state.
- `packages/web` imports `packages/core`. It owns DOM events, hotkeys, `localStorage`, and animation.
- `packages/mcp-server` imports `packages/core`. It owns stdio transport and tool registration.
- Only `packages/core` may contain analysis logic. Web and MCP code call core. They do not reimplement it.

## 2. Deterministic offline fallback

- Every core command must produce the same output for the same input on every run, with no network calls.
- Analyzers (`Spec.Audit`, `Spec.Tighten`, `Cite.Verify`, `Outline.ExtractTasks`, `Doc.InjectFlaw`) are deterministic TypeScript engines. They are the default path.
- Any LLM enrichment goes through `optionalLlmAdapter.ts`. On a missing key, a network error, a timeout, or offline mode, the adapter must return the deterministic result. Never surface an LLM failure as a command failure.
- Do not use `Math.random`, `Date.now`, or unordered iteration over object keys in analyzer output. Sort where order matters.

## 3. TypeScript standards

- `strict: true`, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, and `verbatimModuleSyntax`, all from `tsconfig.base.json`.
- No `any`. Use `unknown` and narrow it.
- Types come from `packages/core/src/types.ts`. Do not redeclare them elsewhere. Canonical shapes are SPEC.md Section 4.
- ESM only (`"type": "module"`). Use `.js` extensions in relative imports.

## 4. Testing

- Unit tests live in `packages/core/tests/` and use vitest.
- Property tests use fast-check and live in `packages/core/tests/invariants.prop.test.ts`. They cover INV-1 to INV-5.
- `npm test` runs all tests from the repo root. `npm --workspace=packages/core run test:pbt` runs the property suite. The Kiro hook `verify-invariants` runs the property suite on save.
- Do not add tests that the task did not ask for.

## 5. Repository hygiene

- `.kiro/` is committed and must never be added to `.gitignore`.
- Do not commit `.env` files or API keys. `AI.Config` keys stay in session memory or `localStorage`.
