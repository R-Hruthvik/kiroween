# Product Rules: Augeron

Apply these rules to all generated UI, copy, and code.

## 1. Zero-menu Oberon UX

- No icon toolbars, dropdown menus, sidebars with nested navigation, or blocking modal dialogs.
- Every action is a text command (`Module.Action` or `Module.Action(arg)`) or a documented single-key shortcut.
- Commands run by middle-click (button `1`) or Ctrl/Cmd-click on the token, against the active selection or focused `§` node.
- Layout is two tracks. Left is the NLS Document Track. Right is `System.Tool` (editable command pad) over `System.Log` (append-only output).
- Do not add a settings panel, a file menu, or a confirmation modal. For destructive intent, use `System.Undo` instead of a confirmation dialog.

## 2. No retro CRT skins

- No scanlines, screen curvature, glow, flicker, green or amber phosphor text, bezels, or 1980s OS chrome.
- Typography is crisp, modern, Swiss editorial. Use a high-contrast sans or serif pair with a clear type scale.
- Visual style must come from layout and type. Decorative effects are out of scope.

## 3. Non-destructive NLS View-Specs

- View-Specs (`a`, `h`, `f`, `u`, `r`) are pure projections over the `DocumentTree`.
- A View-Spec never mutates `DocNode.rawText`, never drops a node from the tree, and never changes `indexByCoord`.
- Switching back to `a` restores the original document byte for byte. This is property INV-1.
- Only commands that declare "Mutates tree: Yes" in the catalog may change document text. Those commands must push a history snapshot (REQ-5.3).

## 4. Scope guardrails

- No cloud accounts, no database, no multi-user real-time collaboration.
- Every core command works offline without an API key. An LLM is an optional enhancement only.
