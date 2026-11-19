/**
 * Showcase brief: AI Safety and Evaluation Literature. Cited benchmarks sit beside uncited marketing claims.
 * Coordinates and flags, checked by hand:
 * - §1.1a and §1.1b cite [1] and [2], so they classify as Evidence and get no flag.
 * - §1.2a ("99 %") and §1.2b ("10x") are numeric claims with no citation: UNVERIFIED_CLAIM.
 * - §1.2a also says "fast": AMBIGUOUS_TERM.
 * - §1.3b references §4.2a, which does not exist: BROKEN_REF.
 * - §1.3a states an assumption, so the Assumption role applies.
 */
export const AI_SAFETY_BRIEF = `# AI Safety and Evaluation Literature Brief

This brief summarizes published evaluation work on frontier model safety. It separates measured results from vendor claims, and it keeps the two in separate sections.

## Measured benchmarks

Refusal rates on the HarmBench standard set fell from 0.38 to 0.12 after adversarial fine-tuning [1].

Jailbreak success on the held-out split was 14 % for the tested models [2].

The evaluation harness SHALL report confidence intervals for every benchmark score.

## Vendor claims

Our safety layer is fast and scalable, and it reduces harmful outputs by 99 %.

Customers see 10x fewer incidents within 30 days of deployment.

Independent teams have validated the approach at scale.

## Methodology

Assuming the held-out split matches production traffic, the measured rates carry over to live deployments.

Sampling and scoring follow the procedure in §4.2a, which covers the public test set.

## Sources

[1] Mazeika et al., HarmBench: A Standardized Evaluation Framework for Automated Red Teaming, 2024.

[2] Internal evaluation EV-2025-11, held-out jailbreak split.
`;
