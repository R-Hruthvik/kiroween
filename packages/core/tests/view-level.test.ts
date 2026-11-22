import { describe, it, expect } from "vitest";
import {
  BUILTIN_REGISTRY,
  createWorkbenchState,
  flattenProjected,
  parseDocument,
  projectTree,
  runLine,
  serializeTree,
  type WorkbenchState,
} from "../src/index.js";

const SPEC = [
  "Preamble text before any heading.",
  "",
  "# Alpha",
  "",
  "Alpha body.",
  "",
  "## Beta",
  "",
  "Beta body.",
  "",
  "### Gamma",
  "",
  "Gamma body.",
  "",
  "# Delta",
  "",
  "Delta body.",
  "",
].join("\n");

const tree = parseDocument(SPEC);

function shownCoordinates(level: number | undefined, code: "a" | "h" = "a"): string[] {
  return flattenProjected(projectTree(tree, code, level)).map((item) => item.node.coordinate);
}

describe("View.Level projection", () => {
  it("depth 1 shows top-level headings and their body text, and clips every deeper heading", () => {
    expect(shownCoordinates(1)).toEqual(["§0a", "§1", "§1a", "§2", "§2a"]);
  });

  it("depth 2 keeps the second level and clips the third", () => {
    expect(shownCoordinates(2)).toEqual(["§0a", "§1", "§1a", "§1.1", "§1.1a", "§2", "§2a"]);
  });

  it("a depth at or beyond the deepest heading shows the whole document", () => {
    expect(shownCoordinates(3)).toEqual(shownCoordinates(undefined));
    expect(shownCoordinates(6)).toEqual(shownCoordinates(undefined));
  });

  it("clipped headings take their whole subtree with them, and collapsed flags the gap", () => {
    const top = projectTree(tree, "a", 1);
    const alpha = top.find((item) => item.node.coordinate === "§1");
    expect(alpha?.children.map((item) => item.node.coordinate)).toEqual(["§1a"]);
    expect(alpha?.collapsed).toBe(true);
  });

  it("layers on the active view code: h at depth 1 shows only level-1 headings", () => {
    expect(shownCoordinates(1, "h")).toEqual(["§1", "§2"]);
  });
});

describe("View.Level command", () => {
  async function run(line: string, start: WorkbenchState = createWorkbenchState(tree)): Promise<WorkbenchState> {
    return runLine(start, line, BUILTIN_REGISTRY);
  }

  it("sets the clip on the workbench state and logs the visible count", async () => {
    const after = await run("View.Level(1)");
    expect(after.activeLevel).toBe(1);
    const entry = after.log.at(-1);
    expect(entry?.error).toBeUndefined();
    expect(entry?.body).toContain("down to level 1");
    expect(entry?.body).toContain("Visible nodes: 5. Hidden nodes: 4.");
  });

  it.each(["View.Level()", "View.Level", "View.Level(0)", "View.Level(1.5)", "View.Level(-1)", "View.Level(x)"])(
    "rejects %s with an error and leaves the clip unchanged",
    async (line) => {
      const before = await run("View.Level(2)");
      const after = await run(line, before);
      expect(after.activeLevel).toBe(2);
      expect(after.log.at(-1)?.error).toBeDefined();
      expect(after.log.at(-1)?.body).toContain("ERROR: View.Level expects a positive integer depth");
    },
  );

  it("keeps the clip when the view code changes, and View.Spec(a) clears it", async () => {
    const clipped = await run("View.Level(1)");
    const hview = await run("View.Spec(h)", clipped);
    expect(hview.activeLevel).toBe(1);
    expect(hview.activeViewSpec).toBe("h");
    const full = await run("View.Spec(a)", hview);
    expect(full.activeLevel).toBeUndefined();
    expect(full.activeViewSpec).toBe("a");
  });

  it("never mutates the tree or rawText, and View.Spec(a) restores the original projection", async () => {
    const before = createWorkbenchState(tree);
    const clipped = await run("View.Level(1)", before);
    expect(clipped.history.present).toBe(before.history.present);
    expect(clipped.history.past).toHaveLength(before.history.past.length);
    expect(serializeTree(clipped.history.present)).toBe(serializeTree(tree));

    const restored = await run("View.Spec(a)", clipped);
    const allNodes = flattenProjected(projectTree(restored.history.present, restored.activeViewSpec));
    expect(allNodes.map((item) => item.node.coordinate)).toEqual(shownCoordinates(undefined));
    expect(restored.history.present).toBe(before.history.present);
  });
});
