import { describe, it, expect } from "vitest";
import { tightenText, findProtectedChange } from "../src/index.js";

describe("Spec.Tighten casing and punctuation (A4 / G12)", () => {
  it("never emits uppercase THE SYSTEM mid-sentence", () => {
    expect(tightenText("We expect the system should scale.")).toBe("We expect the system should scale.");
    expect(tightenText("We expect the system should scale.")).not.toContain("THE SYSTEM");
  });

  it("keeps sentence casing when filler at the start is removed", () => {
    expect(tightenText("It is worth noting that the cache is fast.")).toBe("The cache is fast.");
    expect(tightenText("Basically, we should keep it simple.")).toBe("We should keep it simple.");
    expect(tightenText("In order to reduce load, we shard.")).toBe("To reduce load, we shard.");
  });

  it("leaves punctuation-adjacent intensifiers alone instead of producing a collision", () => {
    expect(tightenText("This is very, important.")).toBe("This is very, important.");
    expect(tightenText("NOTE: to keep it simple.")).toBe("NOTE: to keep it simple.");
  });

  it("removes a plain intensifier and keeps the rest of the sentence", () => {
    expect(tightenText("This is very important.")).toBe("This is important.");
  });

  it("returns the input unchanged when no rule applies", () => {
    const text = "The cache holds 3 replicas [1].";
    expect(tightenText(text)).toBe(text);
  });
});

describe("Spec.Tighten keeps modal strength (F1)", () => {
  it("does not turn should or will into SHALL", () => {
    expect(tightenText("The system should try to keep the hit ratio high.")).toBe(
      "The system should try to keep the hit ratio high.",
    );
    expect(tightenText("The system will revert to the legacy ledger.")).toBe(
      "The system will revert to the legacy ledger.",
    );
  });

  it("never emits SHALL not or SHOULD NOT for a should-not sentence", () => {
    const out = tightenText("The system should not store passwords in plain text.");
    expect(out).toBe("The system should not store passwords in plain text.");
    expect(out).not.toContain("SHALL not");
  });

  it("does not turn passive is required to into a normative keyword", () => {
    const text = "The team is required to produce a daily report.";
    expect(tightenText(text)).toBe(text);
  });

  it("keeps an existing MUST NOT and the negation count unchanged", () => {
    expect(tightenText("The gateway MUST NOT encrypt data in order to save CPU.")).toBe(
      "The gateway MUST NOT encrypt data to save CPU.",
    );
  });

  it("reports the first protected token that changed", () => {
    expect(findProtectedChange("The API SHALL reply.", "The API should reply.")).toBe(
      'RFC 2119 keyword "SHALL" changed',
    );
    expect(findProtectedChange("Do not log it.", "Do log it.")).toBe('negation "not" changed');
    expect(findProtectedChange("Keep 30 s.", "Keep 30 ms.")).toBe('number "30 s" changed');
    expect(findProtectedChange("See §1.2a.", "See §1.2b.")).toBe('reference "§1.2a" changed');
  });

  it("accepts a rewrite that only changes filler words", () => {
    expect(findProtectedChange("It is very fast, MUST keep 5 ms [1].", "It is fast, MUST keep 5 ms [1].")).toBeNull();
  });

  it("rejects a rewrite that changes a number even when the words around it stay", () => {
    expect(findProtectedChange("Retry 3 times.", "Retry 4 times.")).toBe('number "3 times" changed');
  });
});
