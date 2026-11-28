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

// Fence rules match the parser: up to 3 indent characters, then a run of 3 or more ` or ~.
const FENCE_OPEN = /^[ \t]{0,3}(`{3,}|~{3,})/;
const FENCE_CLOSE = /^[ \t]{0,3}(`{3,}|~{3,})[ \t\r]*$/;
const HEADING_LINE = /^ {0,3}#{1,6}[ \t]/;

/**
 * The text that Spec.Audit reads as prose. Each removed span becomes one space, and newlines around
 * it stay. Removed spans are HTML comments (from `<!--` to the next `-->`, or to the end when
 * unterminated), fenced code blocks (an unclosed fence runs to the end), heading lines, inline code
 * spans, and URLs.
 *
 * Block rules apply at the start of a line outside a comment. Inline spans are matched left to
 * right, so a comment that opens inside a code span is code, and a code span inside a comment is
 * comment text. Lines are split on "\n" only, so a trailing "\r" is kept as it was.
 */
export function proseForAudit(text: string): string {
  const out: string[] = [];
  let fence: string | null = null;
  let inComment = false;
  for (const line of text.split("\n")) {
    if (fence !== null) {
      const close = FENCE_CLOSE.exec(line);
      const run = close?.[1] ?? "";
      if (run.charAt(0) === fence.charAt(0) && run.length >= fence.length) fence = null;
      continue;
    }
    if (!inComment) {
      const open = FENCE_OPEN.exec(line);
      if (open) {
        fence = open[1] ?? "";
        out.push(" ");
        continue;
      }
      if (HEADING_LINE.test(line)) {
        out.push(" ");
        continue;
      }
    }
    let pos = 0;
    if (inComment) {
      const close = line.indexOf("-->");
      if (close === -1) continue;
      inComment = false;
      pos = close + 3;
    }
    const spans = /<!--|(`+)[^\n]*?\1|https?:\/\/\S+/g;
    spans.lastIndex = pos;
    let kept = "";
    for (let match = spans.exec(line); match !== null; match = spans.exec(line)) {
      kept += `${line.slice(pos, match.index)} `;
      const end = match.index + match[0].length;
      if (match[0] === "<!--") {
        const close = line.indexOf("-->", end);
        if (close === -1) {
          inComment = true;
          pos = line.length;
          break;
        }
        pos = close + 3;
      } else {
        pos = end;
      }
      spans.lastIndex = pos;
    }
    out.push(kept + line.slice(pos));
  }
  return out.join("\n");
}
