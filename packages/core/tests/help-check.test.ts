import { describe, it, expect } from "vitest";
import {
  BUILTIN_REGISTRY,
  checkToolText,
  createWorkbenchState,
  formatCommand,
  formatLogBody,
  parseDocument,
  renderToolCheck,
  runLine,
  serializeTree,
  type WorkbenchState,
} from "../src/index.js";

const DOC = "# Billing\n\nThe service MUST retry failed charges. Retries run for 3 days.\n";

/** The last log entry as the log shows it: title and error line removed. */
function shown(state: WorkbenchState): string {
  const entry = state.log.at(-1);
  return entry === undefined ? "" : formatLogBody(entry);
}

async function run(line: string, state?: WorkbenchState, padText?: string): Promise<WorkbenchState> {
  const start = state ?? createWorkbenchState(parseDocument(DOC));
  return runLine(start, line, BUILTIN_REGISTRY, padText === undefined ? {} : { padText });
}

describe("Help.Show", () => {
  it("describes one command with its argument, mutation flag, and example", async () => {
    const state = await run("Help.Show(View.Spec)");
    expect(state.log.at(-1)?.error).toBeUndefined();
    expect(shown(state)).toBe(
      "View.Spec\nSwitch the View-Spec filter. View.Spec(a) also clears the View.Level clip. Any View.Spec turns off View.Brief.\nArgument: one of a, h, f, u, r.\nMutates tree: no.\nScope: Full Doc.\nExample: View.Spec(u)",
    );
    expect(state.log.at(-1)?.body).toContain("Argument: one of a, h, f, u, r.");
    expect(state.log.at(-1)?.body).toContain("Mutates tree: no.");
    expect(state.log.at(-1)?.body).toContain("Example: View.Spec(u)");
  });

  it("reports a mutating command as mutating", async () => {
    const state = await run("Help.Show(Spec.Tighten)");
    expect(state.log.at(-1)?.body).toContain("Mutates tree: yes.");
    expect(state.log.at(-1)?.body).toContain("Argument: none.");
  });

  it("lists every command grouped by module when it has no argument", async () => {
    const state = await run("Help.Show");
    const body = state.log.at(-1)?.body ?? "";
    expect(body).toContain("\nView\n  View.Spec  ");
    expect(body).toContain("\nFind\n  Find.Look  ");
    expect(body).toContain("Help.Show  ");
    expect(body).toContain("Browser only, not in this list: Doc.Load");
  });

  it("gives a description for every registered command", async () => {
    for (const token of BUILTIN_REGISTRY.keys()) {
      const state = await run(`Help.Show(${token})`);
      expect(state.log.at(-1)?.error, token).toBeUndefined();
      expect(state.log.at(-1)?.body, token).toContain(`Mutates tree: `);
    }
  });

  it("rejects an unknown command and an empty argument", async () => {
    expect((await run("Help.Show(Nope.Nope)")).log.at(-1)?.error).toBe(
      "No core command named Nope.Nope. Help.Show with no argument lists them all.",
    );
    expect((await run("Help.Show()")).log.at(-1)?.error).toContain("Help.Show expects Module.Action");
  });
});

describe("Tool.Check", () => {
  const registry = BUILTIN_REGISTRY;

  it("skips blank lines and group headings, and keeps editor line numbers", () => {
    const report = checkToolText("# GROUP\nView.Spec(u)  View.Spec(h)\n\nSpec.Audit -> Doc.Load(rfc)\n", registry);
    expect(report.errorLines).toBe(0);
    expect(report.lines.map((line) => line.lineNumber)).toEqual([2, 4]);
    expect(report.lines[0]?.stages.map((stage) => stage.token)).toEqual(["View.Spec(u)", "View.Spec(h)"]);
    expect(report.lines[0]?.mutates).toBe(false);
  });

  it("reads each stage's scope and whether it mutates the tree", () => {
    const report = checkToolText("Doc.InjectFlaw -> Spec.Audit\n", registry);
    const [line] = report.lines;
    expect(line?.mutates).toBe(true);
    expect(line?.stages).toEqual([
      { token: "Doc.InjectFlaw", reads: "Full Doc", mutates: true, error: null },
      { token: "Spec.Audit", reads: "Full Doc", mutates: false, error: null },
    ]);
  });

  it("lists unknown commands with their line numbers", () => {
    const report = checkToolText("Spec.Audit\nSpec.Tidy\nCite.Verify -> Spec.Tighten2 -> View.Spec(u)\n", registry);
    expect(report.errorLines).toBe(2);
    expect(report.lines[1]?.stages[0]?.error).toBe("Unknown command: Spec.Tidy.");
    expect(report.lines[2]?.stages[1]).toMatchObject({ token: "Spec.Tighten2", error: "Unknown command: Spec.Tighten2." });
    const text = renderToolCheck(report);
    expect(text).toContain("Line 2: Spec.Tidy\n  ERROR line 2: Unknown command: Spec.Tidy.");
    expect(text).toContain("Line 3: Cite.Verify -> Spec.Tighten2 -> View.Spec(u)\n  Cite.Verify");
  });

  it("flags a line with no command, a missing close paren, and an empty pipeline stage", () => {
    const report = checkToolText("hello there\nView.Spec(u\nSpec.Audit -> \nCite.Verify -> foo bar\n", registry);
    expect(report.lines[0]?.error).toBe("No command on this line.");
    expect(report.lines[1]?.stages[0]?.error).toBe('Missing ")" after View.Spec.');
    expect(report.lines[2]?.stages[1]?.error).toBe('Empty stage around "->".');
    expect(report.lines[3]?.stages[1]?.error).toBe('Not a command token: "foo bar".');
    expect(report.errorLines).toBe(4);
  });

  it("reports a clean pad in one summary line", () => {
    const text = renderToolCheck(checkToolText("View.Spec(a)\n", registry));
    expect(text.split("\n")[0]).toBe("All 1 checked lines parse and name known commands.");
  });

  it("runs as a browser command and reports the pad it was given", async () => {
    const state = await run("Tool.Check", undefined, "Spec.Audit\nSpec.Tidy\n");
    expect(state.log.at(-1)?.error).toBeUndefined();
    expect(state.log.at(-1)?.body).toContain("1 of 2 checked lines have a problem.");
    expect(state.log.at(-1)?.body).toContain("Line 2: Spec.Tidy");
  });

  it("refuses to run without a pad, as in the MCP server", async () => {
    const state = await run("Tool.Check");
    expect(state.log.at(-1)?.error).toBe("Tool.Check reads the System.Tool pad, so it runs in the browser.");
  });

  it("never changes the document", async () => {
    const before = createWorkbenchState(parseDocument(DOC));
    const after = await run("Tool.Check", before, "Spec.Tighten\n");
    expect(serializeTree(after.history.present)).toBe(serializeTree(before.history.present));
  });
});

describe("System.History", () => {
  it("says so when no command has run", async () => {
    const state = await run("System.History");
    expect(shown(state)).toBe("No commands have run this session.");
  });

  it("lists the commands that ran, in order, in Module.Action(arg) form", async () => {
    let state = await run("Spec.Audit");
    state = await run("View.Spec(u)", state);
    state = await run("Find.Look(billing)", state);
    state = await run("System.History", state);
    expect(state.commandHistory).toEqual(["Spec.Audit", "View.Spec(u)", "Find.Look(billing)"]);
    expect(shown(state)).toBe("Spec.Audit\nView.Spec(u)\nFind.Look(billing)");
  });

  it("records each stage of a pipeline and skips failed commands", async () => {
    let state = await run("Cite.Verify -> View.Spec(u)");
    state = await run("View.Spec(z)", state);
    state = await run("Find.Look()", state);
    expect(state.commandHistory).toEqual(["Cite.Verify", "View.Spec(u)"]);
  });

  it("never lists itself, and records each command as formatCommand writes it", async () => {
    let state = await run("View.Brief(3)");
    state = await run("System.History", state);
    state = await run("System.History", state);
    expect(state.commandHistory).toEqual(["View.Brief(3)"]);
    expect(formatCommand({ module: "View", action: "Brief", arg: "3" })).toBe("View.Brief(3)");
  });

  it("does not change the document text", async () => {
    let state = await run("Spec.Tighten");
    const textBefore = serializeTree(state.history.present);
    state = await run("System.History", state);
    expect(serializeTree(state.history.present)).toBe(textBefore);
  });
});
