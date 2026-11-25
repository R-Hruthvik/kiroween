import { describe, it, expect } from "vitest";
import {
  findProtectedChange,
  findProtectedExcerptViolation,
  rfc2119KeywordsIn,
} from "../src/index.js";

describe("protected-word guard: pairs a rewrite must never merge", () => {
  it.each([
    ["The client MAY retry.", "The client may retry.", 'RFC 2119 keyword "MAY" changed'],
    ["The server SHOULD close.", "The server SHOULD NOT close.", 'RFC 2119 keyword "SHOULD" changed'],
    ["Keep the limit at least 3.", "Keep the limit at most 3.", 'bound "at least" changed'],
    ["Retry unless the body is empty.", "Retry if the body is empty.", 'condition word "unless" changed'],
  ])("%s vs %s is a change", (before, after, message) => {
    expect(findProtectedChange(before, after)).toBe(message);
  });
});

describe("protected-word guard: units, negations, identifiers, references", () => {
  it("treats 30 s and 30000 ms as the same number", () => {
    expect(findProtectedChange("Wait 30 s.", "Wait 30000 ms.")).toBeNull();
    expect(findProtectedChange("Wait 2 seconds.", "Wait 2 s.")).toBeNull();
    expect(findProtectedChange("Store 1 KB.", "Store 1000 B.")).toBeNull();
  });

  it("reports a different unit as a changed number", () => {
    expect(findProtectedChange("Keep 30 days.", "Keep 1 month.")).toBe('number "30 days" changed');
    expect(findProtectedChange("Wait 30 s.", "Wait 30 days.")).toBe('number "30 s" changed');
  });

  it("checks negations per clause, not only per text", () => {
    const before = "The server MUST NOT close the socket, and MUST reply.";
    const after = "The server MUST close the socket, and MUST NOT reply.";
    expect(findProtectedChange(before, after)).toBe(
      'negation in clause "The server MUST NOT close the socket" changed',
    );
  });

  it("keeps identifiers verbatim", () => {
    expect(findProtectedChange("Send Content-Length.", "Send Content-Lenght.")).toBe(
      'identifier "Content-Length" changed',
    );
    expect(findProtectedChange("Read `Retry-After`.", "Read `Retry-After!`.")).toBe(
      'identifier "`Retry-After`" changed',
    );
  });

  it("keeps § and citation references verbatim", () => {
    expect(findProtectedChange("See §1.2a [1].", "See §1.2b [1].")).toBe('reference "§1.2a" changed');
  });

  it("returns null when only filler changes", () => {
    expect(findProtectedChange("It is very fast, MUST keep 5 ms [1].", "It is fast, MUST keep 5 ms [1].")).toBeNull();
  });
});

describe("protected-word guard: excerpts", () => {
  it("accepts an excerpt whose protected words all appear in its source paragraph", () => {
    const source = "The API MUST NOT log 30 s. Retries MAY run.";
    expect(findProtectedExcerptViolation(source, "The API MUST NOT log 30 s.")).toBeNull();
  });

  it("rejects an excerpt that adds or changes a protected word", () => {
    const source = "The API MUST NOT log 30 s.";
    expect(findProtectedExcerptViolation(source, "The API MUST log 30 s.")).toBe(
      'RFC 2119 keyword "MUST" is not in the source paragraph',
    );
    expect(findProtectedExcerptViolation(source, "The API MUST NOT log 40 s.")).toBe(
      'number "40 s" is not in the source paragraph',
    );
  });

  it("lists RFC 2119 keywords in order, with MUST NOT as one keyword", () => {
    expect(rfc2119KeywordsIn("Clients MUST NOT retry, and MAY wait.")).toEqual(["MUST NOT", "MAY"]);
    expect(rfc2119KeywordsIn("Clients must retry.")).toEqual([]);
  });
});
