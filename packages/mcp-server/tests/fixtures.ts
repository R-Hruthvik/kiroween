/**
 * Small NLS document with one contradiction (§1.2a vs §1.3a), three broken references
 * (§1.1b, §1.3b, §1.3c), and one filler sentence for Spec.Tighten (§1.3b).
 */
export const SPEC_FIXTURE = `# Edge Cache Spec

## Read path

The edge tier SHALL keep p99 read latency under 50 ms for cached objects.

Measured latency for this path is reported in §9.9z.

## Retention

Personal data retention MUST stay under 30 days.

## Compliance

The team MUST keep personal data retention at 90 days.

In order to reduce origin load, cache warming runs before each deploy [7].

Cache warming was tested [RFC9999].
`;
