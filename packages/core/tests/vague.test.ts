import { describe, it, expect } from "vitest";
import { vagueTermsIn, VAGUE_TERMS } from "../src/analyzers/vague.js";

describe("AMBIGUOUS_TERM vocabulary (A4 / G12)", () => {
  it("has a curated list of roughly 35 to 40 terms", () => {
    expect(VAGUE_TERMS.length).toBeGreaterThanOrEqual(35);
    expect(VAGUE_TERMS.length).toBeLessThanOrEqual(40);
  });

  it("matches whole words and phrases only", () => {
    expect(vagueTermsIn("It must be robust and user-friendly, as needed.")).toEqual(["robust", "user-friendly", "as needed"]);
    expect(vagueTermsIn("Fastening the cover is not vague.")).toEqual([]);
  });
});
