import { describe, it, expect } from "vitest";
import {
  BUILTIN_REGISTRY,
  createWorkbenchState,
  parseDocument,
  runLine,
  serializeTree,
  formatLogBody,
  type WorkbenchState,
} from "../src/index.js";

/** The last log entry as the log shows it: title and error line removed. */
function shown(state: WorkbenchState): string {
  const entry = state.log.at(-1);
  return entry === undefined ? "" : formatLogBody(entry);
}

const DOC = [
  "# Billing",
  "",
  "The service MUST retry failed charges. Retries run for 3 days.",
  "",
  "## Retention",
  "",
  "Records are kept for 30 days.",
  "",
  "Billing follows the retention rules in §1.1a.",
  "",
  "Plain closing line.",
].join("\n");

async function run(line: string, state?: WorkbenchState): Promise<WorkbenchState> {
  return runLine(state ?? createWorkbenchState(parseDocument(DOC)), line, BUILTIN_REGISTRY);
}

describe("Find.Look(text)", () => {
  it("matches ignoring case, in headings and paragraphs, in document order", async () => {
    const state = await run("Find.Look(RETENTION)");
    const entry = state.log.at(-1);
    expect(entry?.error).toBeUndefined();
    expect(entry?.body).toContain('2 matches for "RETENTION".');
    expect(entry?.body).toContain("- §1.1  ## Retention");
    expect(entry?.body).toContain("- §1.1b  Billing follows the retention rules in §1.1a.");
    expect(entry?.body.indexOf("§1.1 ")).toBeLessThan(entry?.body.indexOf("§1.1b") ?? -1);
  });

  it("treats the text as a literal, not a pattern", async () => {
    const state = await run("Find.Look(3 days.)");
    expect(state.log.at(-1)?.body).toContain('1 match for "3 days.".');
    expect(state.log.at(-1)?.body).toContain("- §1a");
    const none = await run("Find.Look(3.days)");
    expect(shown(none)).toBe('No paragraph or heading contains "3.days".');
  });

  it("says so when nothing matches", async () => {
    const state = await run("Find.Look(zebra)");
    expect(state.log.at(-1)?.error).toBeUndefined();
    expect(shown(state)).toBe('No paragraph or heading contains "zebra".');
  });

  it("rejects empty text instead of matching every node", async () => {
    for (const line of ["Find.Look()", "Find.Look(   )", "Find.Look"]) {
      const state = await run(line);
      expect(state.log.at(-1)?.error, line).toContain("Find.Look expects the text to search for");
    }
  });

  it("never changes the document", async () => {
    const before = createWorkbenchState(parseDocument(DOC));
    const after = await run("Find.Look(retention)", before);
    expect(serializeTree(after.history.present)).toBe(serializeTree(before.history.present));
    expect(after.history.past).toHaveLength(before.history.past.length);
  });
});

describe("Link.Back(§x)", () => {
  it("lists every paragraph whose text refers to the address", async () => {
    const state = await run("Link.Back(§1.1a)");
    expect(state.log.at(-1)?.error).toBeUndefined();
    expect(shown(state)).toBe(
      "1 paragraph refers to §1.1a.\n- §1.1b  Billing follows the retention rules in §1.1a.",
    );
  });

  it("says so when no paragraph refers to the address", async () => {
    const state = await run("Link.Back(§1.1)");
    expect(shown(state)).toBe("No paragraph refers to §1.1.");
  });

  it("rejects an address that does not exist", async () => {
    const state = await run("Link.Back(§9.9)");
    expect(state.log.at(-1)?.error).toBe("No paragraph or heading at §9.9.");
  });

  it("rejects text that is not a § address", async () => {
    for (const line of ["Link.Back(1.1a)", "Link.Back()", "Link.Back"]) {
      const state = await run(line);
      expect(state.log.at(-1)?.error, line).toContain("Link.Back expects a § address");
    }
  });

  it("never changes the document", async () => {
    const before = createWorkbenchState(parseDocument(DOC));
    const after = await run("Link.Back(§1.1a)", before);
    expect(serializeTree(after.history.present)).toBe(serializeTree(before.history.present));
  });
});
