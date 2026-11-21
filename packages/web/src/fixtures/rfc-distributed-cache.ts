/**
 * Default demo document. Its coordinates and flags are checked by hand:
 * - §2.1b (p99 under 50 ms) conflicts with §4.3a (p99 is 200 ms): CONTRADICTION.
 * - §2.1c links to §4.3a, so the split pane can be opened before any audit runs.
 * - §4.2a (personal data retention under 30 days) conflicts with §4.3b (personal data retention is 90 days): CONTRADICTION.
 * - §4.3c references §2.2c, which does not exist: BROKEN_REF.
 * - §3.1a and §3.1b hold filler and passive phrasing for Spec.Tighten.
 * - §1.1b and §3.2b use "fast" or "scalable" for Spec.Audit's AMBIGUOUS_TERM.
 */
export const RFC_DISTRIBUTED_CACHE = `# Distributed Edge Cache RFC

This RFC describes an edge cache tier for read-heavy catalog traffic. It is written for review before the Q3 rollout.

## Goals

The cache SHALL absorb at least 90 % of catalog reads at the edge.

It is worth noting that the design is basically simple and very scalable.

# Read and Write Paths

## Read path

Reads are served from the nearest healthy replica, and misses fall through to origin.

The edge tier SHALL keep p99 read latency under 50 ms for cached objects.

Measured load-test latency for this path is reported in §4.3a.

## Write path

Writes invalidate by key and SHALL propagate within 2 seconds.

# Operations

## Capacity planning

The system should try to keep the edge hit ratio high during peak traffic.

In order to reduce origin load, cache warming runs before each deploy [1].

## Rollout

The team SHALL run a canary on 5 % of edge nodes before global rollout.

The design is fast and scalable under load, as the benchmark shows.

# Data Governance

## Scope

This section covers cached request data only.

## Compliance

Personal data retention MUST stay under 30 days.

Access to cached records is limited to on-call staff.

## Retention

P99 cache read latency is 200 ms under load.

Personal data retention is 90 days for all cached requests.

Latency figures are summarized in §2.2c.

# References

## Sources

[1] Internal benchmark BM-2025-07, edge tier load test.
`;
