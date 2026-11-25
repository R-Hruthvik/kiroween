/**
 * Text that a reference check should read. Inline code spans are removed, because they show syntax
 * examples such as `§2`. Markdown link text is removed, so "[Story 1](#story-1)" leaves only its target.
 * Lengths and positions do not matter to callers, so spans are replaced by a space.
 */
export function withoutCodeAndLinkText(text: string): string {
  return text
    .replace(/(`+)[^\n]*?\1/g, " ")
    .replace(/\[[^\]\n]*\]\(([^)\n]*)\)/g, " $1 ");
}
