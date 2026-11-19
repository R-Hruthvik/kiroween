---
name: augeron-ui-gate
description: Enforce Augeron zero-menu Swiss editorial UI rules, middle-click handling, selection persistence, and core isolation. Use when building, editing, or reviewing React components in packages/web.
---

## Augeron Frontend Guardrails
Before writing or finalizing any component in `packages/web/src/`:

1. **Zero-Menu Rule:** Confirm there are zero icon toolbars, dropdown menus, sidebars, or blocking modal dialogs. Every action must be invocable via plain-text `Module.Action` tokens or single-key View-Spec shortcuts (`a`, `h`, `f`, `u`, `r`).
2. **Aesthetic & Typography:** Use warm editorial paper (`#FAF9F6`), deep ink (`#141413`), 1px hairline borders (`#E5E2DC`), serif body typography for the NLS Document Track, and monospace for `§` coordinates, `System.Tool`, and `System.Log`. Never add CRT scanlines or retro terminal skins.
3. **Middle-Click & Selection Persistence:**
   - Attach `onMouseDown` (`e.button === 1` with `e.preventDefault()`) AND `onClick` (`e.metaKey || e.ctrlKey`) to every clickable `Module.Action` token.
   - Read target nodes from persisted `lastSelection` state so clicking `System.Tool` never loses the active selection in `NlsDocumentPane`.
4. **Core Isolation:** Ensure zero DOM or React code leaks into `packages/core`. Check with `grep -rnE "from ['\"](react|react-dom)|\bwindow\b|\bdocument\b|node:fs" packages/core/src` and confirm there are no matches.
5. **Verification:** Run `npm --workspace=packages/web run build` and `npm test` before reporting completion. If `packages/web` has no build script yet, say so explicitly and do not report the build as passing.
