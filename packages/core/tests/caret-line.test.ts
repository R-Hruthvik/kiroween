import { describe, it, expect } from "vitest";
import { commandLineAt } from "../src/index.js";

describe("commandLineAt (Ctrl/Cmd+Enter in System.Tool)", () => {
  it("runs the command on a line that has one", () => {
    expect(commandLineAt("Spec.Audit\nView.Spec(a)", 3)).toBe("Spec.Audit");
    expect(commandLineAt("Spec.Audit\nView.Spec(a)", 14)).toBe("View.Spec(a)");
    expect(commandLineAt("View.Spec(a)", 0)).toBe("View.Spec(a)");
  });

  it("runs a chain line whole, wherever the caret is", () => {
    expect(commandLineAt("Spec.Audit -> Outline.ExtractTasks", 25)).toBe("Spec.Audit -> Outline.ExtractTasks");
  });

  it("runs the command under the caret when a line has several", () => {
    const line = "Spec.Audit  Spec.Tighten  Cite.Verify";
    expect(commandLineAt(line, 15)).toBe("Spec.Tighten");
    expect(commandLineAt(line, 36)).toBe("Cite.Verify");
    expect(commandLineAt(line, 11)).toBe("Spec.Audit");
  });

  it("returns the single command in a line with prose around it", () => {
    expect(commandLineAt("Run Spec.Audit now", 0)).toBe("Spec.Audit");
  });

  it("returns null for blank lines, group headings, and lines with no command", () => {
    expect(commandLineAt("", 0)).toBeNull();
    expect(commandLineAt("Spec.Audit\n\nView.Spec(a)", 11)).toBeNull();
    expect(commandLineAt("# X-RAY VIEWS\nView.Spec(a)", 4)).toBeNull();
    expect(commandLineAt("just words", 3)).toBeNull();
  });

  it("clamps a caret outside the text", () => {
    expect(commandLineAt("Spec.Audit", 99)).toBe("Spec.Audit");
    expect(commandLineAt("Spec.Audit", -5)).toBe("Spec.Audit");
  });
});
