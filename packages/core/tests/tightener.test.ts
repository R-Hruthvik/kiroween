import { describe, it, expect } from "vitest";
import { tightenText } from "../src/index.js";

describe("Spec.Tighten casing and punctuation (A4 / G12)", () => {
  it("never emits uppercase THE SYSTEM mid-sentence", () => {
    expect(tightenText("We expect the system should scale.")).toBe("We expect the system SHALL scale.");
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
