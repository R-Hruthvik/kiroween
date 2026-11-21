import { describe, it, expect } from "vitest";
import { parseDocument, flattenNodes, computeAuditFlags, applyFlags } from "../src/index.js";
import { citeVerifyFlags } from "../src/analyzers/audit.js";
import type { DocumentTree, NodeFlag } from "../src/types.js";

const RFC_6585_EXCERPT = `# RFC 6585 excerpt

## 3. 428 Precondition Required

The 428 status code indicates that the origin server requires the request to be conditional [RFC2616].

Servers SHOULD apply this status on port 443 for TLS-only resources [RFC2818].

## 4. 429 Too Many Requests

The 429 status code indicates that the user has sent too many requests in a given amount of time. Responses use max-age=0 caching [RFC2616].

## 6. 511 Network Authentication Required

The 511 status code indicates that the client must authenticate to gain network access. See Section 7 of [RFC2616] for version details (HTTP/1.1, v2.3).

1. Register the status code.
2. Publish the document in 2024.

## References

[RFC2616] Fielding, R., et al., "Hypertext Transfer Protocol -- HTTP/1.1", RFC 2616, June 1999.
[RFC2818] Rescorla, E., "HTTP Over TLS", RFC 2818, May 2000.
`;

function flagsOf(tree: DocumentTree): { coordinate: string; flag: NodeFlag }[] {
  const audited = applyFlags(tree, computeAuditFlags(tree));
  return flattenNodes(audited).flatMap((node) => node.flags.map((flag) => ({ coordinate: node.coordinate, flag })));
}

describe("false-positive noise on real RFC text (A1, C13)", () => {
  it("raises no flags on an RFC 6585 excerpt with status codes, ports, versions, and section refs", () => {
    expect(flagsOf(parseDocument(RFC_6585_EXCERPT))).toEqual([]);
  });

  it("does not treat list numbers, years, or key=value tokens as numeric claims", () => {
    const tree = parseDocument("## A\n\n1. Install it.\n\nPublished in 2024 on port 443 with max-age=0.\n\nSee Section 7 and HTTP/1.1.\n");
    expect(flagsOf(tree)).toEqual([]);
  });

  it("still flags a real numeric claim that has no citation", () => {
    const tree = parseDocument("## A\n\nCaches cut cost by 40% in production.\n");
    const flags = flagsOf(tree).map((item) => item.flag.type);
    expect(flags).toEqual(["UNVERIFIED_CLAIM"]);
  });
});

describe("accurate UNVERIFIED_CLAIM messages (C12)", () => {
  it("uses the comparative message when the trigger is a word, not a number", () => {
    const tree = parseDocument("## A\n\nCaching will reduce load for readers.\n");
    const messages = flagsOf(tree).map((item) => item.flag.message);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('Comparative claim ("reduce")');
    expect(messages[0]).not.toContain("Numeric");
  });

  it("uses the numeric message and quotes the number when a unit is present", () => {
    const tree = parseDocument("## A\n\nResults reduce errors by 40%.\n");
    const messages = flagsOf(tree).map((item) => item.flag.message);
    expect(messages).toEqual(['Numeric claim "40%" has no citation, evidence link, or § reference.']);
  });
});

describe("bracketed citations resolve against references (A6 / G12)", () => {
  it("flags an orphan [7] when no reference entry 7 exists", () => {
    const tree = parseDocument("## A\n\nCaches cut cost by 40% [7].\n\n## References\n\n[1] Source one.\n");
    const orphan = flagsOf(tree).filter((item) => item.flag.message.includes("[7]"));
    expect(orphan.map((item) => item.flag.type)).toEqual(["BROKEN_REF"]);
    expect(orphan[0]?.flag.message).toBe("Citation [7] has no matching entry in the references section.");
  });

  it("resolves [RFC2616] and [RFC 2616] against an entry in a Sources section", () => {
    const tree = parseDocument("## A\n\nSee the spec [RFC 2616] and [RFC2616].\n\n# Sources\n\n[RFC2616] Fielding.\n");
    expect(flagsOf(tree)).toEqual([]);
  });

  it("Cite.Verify reports an orphan [7] as a broken reference", () => {
    const tree = parseDocument("## A\n\nClaim here [7].\n");
    const flags = [...citeVerifyFlags(tree).values()].flat();
    expect(flags.filter((flag) => flag.message.includes("[7]")).map((flag) => flag.type)).toEqual(["BROKEN_REF"]);
  });
});
