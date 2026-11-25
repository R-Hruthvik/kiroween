import { describe, it, expect } from "vitest";
import {
  parseDocument,
  flattenNodes,
  computeAuditFlags,
  applyFlags,
  detectContradictions,
} from "../src/index.js";
import { claimOf } from "../src/ast/classifier.js";
import type { DocumentTree, NodeFlag } from "../src/types.js";

function auditedFlags(markdown: string): { coordinate: string; flag: NodeFlag }[] {
  const tree: DocumentTree = parseDocument(markdown);
  const audited = applyFlags(tree, computeAuditFlags(tree));
  return flattenNodes(audited).flatMap((node) => node.flags.map((flag) => ({ coordinate: node.coordinate, flag })));
}

function ofType(markdown: string, type: NodeFlag["type"]): { coordinate: string; flag: NodeFlag }[] {
  return auditedFlags(markdown).filter((item) => item.flag.type === type);
}

describe("numeric claims are checked in every sentence (F6)", () => {
  it("flags numbers in a requirement paragraph that has no citation", () => {
    const found = ofType(
      "## A\n\nThe payload limit is 3.5 GB per object. Uploads larger than 3.5 GB MUST NOT be accepted by the edge tier.\n",
      "UNVERIFIED_CLAIM",
    );
    expect(found.map((item) => item.coordinate)).toEqual(["§1a", "§1a"]);
    expect(found[0]?.flag.message).toContain("3.5 GB");
  });

  it("does not flag the numbers when the paragraph has a citation", () => {
    expect(ofType("## A\n\nThe payload limit is 3.5 GB per object [1]. Uploads MUST NOT exceed it.\n", "UNVERIFIED_CLAIM")).toEqual([]);
  });

  it("reads months and years as units", () => {
    expect(claimOf("Records are kept for 12 months.")?.trigger).toBe("12 months");
    expect(claimOf("Records are kept for 2 years.")?.trigger).toBe("2 years");
  });
});

describe("contradictions: months and years, generic objects, scope, and code (F6)", () => {
  it("catches 12 months against 24 months on the same record", () => {
    const found = ofType(
      "## A\n\nCustomer records are deleted after 12 months.\n\nCustomer records are deleted after 24 months for tax reasons.\n",
      "CONTRADICTION",
    );
    expect(found.map((item) => item.coordinate).sort()).toEqual(["§1a", "§1b"]);
  });

  it("treats 12 months and 1 year as the same duration", () => {
    expect(ofType("## A\n\nLogs are kept for 12 months.\n\nLogs are kept for 1 year.\n", "CONTRADICTION")).toEqual([]);
  });

  it("does not pair two sentences that share only a generic object word", () => {
    const markdown =
      "## A\n\nA server MUST NOT generate a Content-Range header field in a 206 response.\n\nAn origin server MUST generate an Allow header field in a 405 response.\n";
    expect(ofType(markdown, "CONTRADICTION")).toEqual([]);
  });

  it("still pairs a MUST and a MUST NOT on the same unscoped object", () => {
    const found = ofType("## A\n\nThe gateway MUST encrypt card data in transit.\n\nThe gateway MUST NOT encrypt card data in transit.\n", "CONTRADICTION");
    expect(found.map((item) => item.coordinate).sort()).toEqual(["§1a", "§1b"]);
  });

  it("does not treat an if or when clause as a conflict", () => {
    expect(
      ofType(
        "## A\n\nThe gateway MUST encrypt all card data in transit.\n\nThe gateway MUST NOT encrypt card data in transit when the merchant opts out.\n",
        "CONTRADICTION",
      ),
    ).toEqual([]);
    expect(
      ofType("## A\n\nSessions are kept for 30 minutes.\n\nSessions are kept for 60 minutes if the account is enterprise.\n", "CONTRADICTION"),
    ).toEqual([]);
  });

  it("does not read a scoped metric as a contradiction", () => {
    const tree = parseDocument("## A\n\nThe system SHALL respond within 50 ms.\n\nResponses take 200 ms when the cache is cold.\n");
    expect(detectContradictions(flattenNodes(tree)).size).toBe(0);
  });
});

describe("broken references skip code spans and link text (F6)", () => {
  it("does not flag § examples in inline code", () => {
    expect(ofType("## A\n\nTop-level headings are `§1`, `§2`, and `§1.2b` in these examples.\n", "BROKEN_REF")).toEqual([]);
  });

  it("does not flag Markdown link text as a citation key", () => {
    expect(ofType("## A\n\nSee [Story 1](#story-1) for the details.\n", "BROKEN_REF")).toEqual([]);
  });

  it("still flags a real missing § reference outside code", () => {
    const found = ofType("## A\n\nSee `x` and §9.9z for the rest.\n", "BROKEN_REF");
    expect(found.map((item) => item.flag.relatedCoordinate)).toEqual(["§9.9z"]);
  });
});

describe("HTTP versions and status names are not quantities (F6)", () => {
  it("ignores HTTP/1.1 and a 431 Request status name", () => {
    expect(claimOf("HTTP/1.1 431 Request Header Fields Too Large")).toBeNull();
    expect(claimOf("HTTP/1.1 User-Agent header")).toBeNull();
  });

  it("still reads a real request count", () => {
    expect(claimOf("The API takes 500 requests per second.")?.trigger).toBe("500 requests");
  });
});
