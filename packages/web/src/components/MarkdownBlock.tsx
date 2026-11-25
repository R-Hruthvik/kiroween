import type { JSX } from "react";
import { OberonTextRenderer } from "./OberonTextRenderer";

interface Props {
  /** Markdown of one body node, as the projector returns it. */
  text: string;
  idPrefix: string;
  plainClickRuns: boolean;
  sourceCoord?: string;
  onPlainClick?: (command: string) => void;
}

/** HTML comments are authoring notes. They are stripped from the display, and the stored text keeps them. */
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const LIST_ITEM = /^\s{0,3}([-*+]|\d{1,9}[.)])\s+(.*)$/;
const FENCE = /^\s{0,3}(`{3,}|~{3,})/;

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; lines: string[] };

/** Groups lines into paragraphs, lists and fenced code. Code lines are kept as written. */
function blocksOf(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split(/\r?\n/);
  let fence: string | null = null;
  let codeLines: string[] = [];
  for (const line of lines) {
    if (fence !== null) {
      if (line.trimStart().startsWith(fence)) {
        blocks.push({ kind: "code", lines: codeLines });
        fence = null;
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }
    const open = FENCE.exec(line);
    if (open) {
      fence = open[1] ?? "```";
      continue;
    }
    if (line.trim() === "") continue;
    const item = LIST_ITEM.exec(line);
    if (item) {
      const ordered = /\d/.test(item[1] ?? "");
      const last = blocks.at(-1);
      if (last?.kind === "list" && last.ordered === ordered) {
        last.items.push(item[2] ?? "");
      } else {
        blocks.push({ kind: "list", ordered, items: [item[2] ?? ""] });
      }
      continue;
    }
    const last = blocks.at(-1);
    // An indented line after a list item continues that item.
    if (last?.kind === "list" && /^\s+\S/.test(line)) {
      last.items[last.items.length - 1] = `${last.items.at(-1) ?? ""} ${line.trim()}`;
      continue;
    }
    if (last?.kind === "paragraph") last.lines.push(line.trim());
    else blocks.push({ kind: "paragraph", lines: [line.trim()] });
  }
  // An unclosed fence still shows its code, so a missing closing fence never hides the rest of the document.
  if (fence !== null && codeLines.length > 0) blocks.push({ kind: "code", lines: codeLines });
  return blocks;
}

/**
 * Body text as Markdown: paragraphs, bulleted and numbered lists, and fenced code. Inline markup is handled
 * by OberonTextRenderer. Heading nodes skip this and render inline.
 */
export function MarkdownBlock({ text, idPrefix, plainClickRuns, sourceCoord, onPlainClick }: Props): JSX.Element | null {
  const clean = text.replace(HTML_COMMENT, "").trim();
  if (clean === "") return null;
  const blocks = blocksOf(clean);
  return (
    <div className="md-block">
      {blocks.map((block, index) => {
        const key = `${idPrefix}-b${index}`;
        if (block.kind === "code") {
          return (
            <pre key={key} className="md-pre">
              <code>{block.lines.join("\n")}</code>
            </pre>
          );
        }
        if (block.kind === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={key} className="md-list">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>
                  <OberonTextRenderer
                    text={item}
                    idPrefix={`${key}-${itemIndex}`}
                    plainClickRuns={plainClickRuns}
                    sourceCoord={sourceCoord}
                    onPlainClick={onPlainClick}
                  />
                </li>
              ))}
            </ListTag>
          );
        }
        return (
          <p key={key} className="md-p">
            <OberonTextRenderer
              text={block.lines.join(" ")}
              idPrefix={key}
              plainClickRuns={plainClickRuns}
              sourceCoord={sourceCoord}
              onPlainClick={onPlainClick}
            />
          </p>
        );
      })}
    </div>
  );
}
