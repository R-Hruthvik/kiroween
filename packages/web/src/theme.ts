/**
 * Visual themes. The theme is a `data-theme` attribute on <html>; index.css defines the tokens for
 * each value. Switched only by the View.Theme(name) text command, never by a toggle or menu.
 */
export const THEMES = ["exhumed", "paper"] as const;
export type ThemeName = (typeof THEMES)[number];

const THEME_KEY = "augeron.theme";
const DEFAULT_THEME: ThemeName = "exhumed";

export function isThemeName(value: string): value is ThemeName {
  return (THEMES as readonly string[]).includes(value);
}

function readSavedTheme(): ThemeName {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return saved !== null && isThemeName(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Sets the theme attribute and saves the choice. Storage failures are ignored. */
export function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be full or blocked. The theme still applies for this session.
  }
}

/** Applies the saved theme, or the default. Call once before the first render. */
export function initTheme(): void {
  document.documentElement.dataset.theme = readSavedTheme();
}
