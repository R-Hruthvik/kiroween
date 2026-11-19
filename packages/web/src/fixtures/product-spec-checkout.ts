/**
 * Showcase PRD: Zero-Downtime Billing Migration. The prose is deliberately verbose so that Spec.Tighten
 * has real work to do, and the SHALL requirements give Outline.ExtractTasks a checklist.
 * Coordinates and flags, checked by hand:
 * - Spec.Tighten rewrites §1.1a (filler), §1.1b ("in order to"), §1.2b ("should try to"),
 *   §1.2c ("is required to"), §1.3d ("very"), and §1.4a ("in order to", "the system will").
 * - §1.3d uses "fast path": AMBIGUOUS_TERM.
 * - §1.2b holds an unmeasured numeric target with no citation: UNVERIFIED_CLAIM.
 * - §1.1b and §1.5b state numbers with no citation: UNVERIFIED_CLAIM.
 * - SHALL and MUST paragraphs (§1.2a, §1.3b, §1.3c, §1.4b) feed Outline.ExtractTasks as P1 tasks.
 */
export const BILLING_MIGRATION_PRD = `# Zero-Downtime Billing Migration PRD

This document describes how checkout moves from the legacy billing ledger to the new subscription ledger. It is written for engineering, finance operations, and support, and it is meant to be reviewed before the migration window opens.

## Background

It is important to note that the legacy ledger is basically a single shared table that very many services write to. Charges, refunds, and proration adjustments all land in that table.

The new ledger is an append-only event store. In order to reduce write contention, it separates invoices from payment attempts, and the team expects it to be the source of truth after cutover.

## Goals

The migration SHALL move 100 % of active subscriptions to the new ledger without a customer-visible outage.

The system should try to keep checkout p95 latency at or below 400 ms during the migration window.

The team is required to produce a daily reconciliation report that compares ledger totals against the payment processor.

## Rollout plan

Assuming the dual-write layer is idempotent, the migration runs in three waves, each covering roughly a third of accounts.

Each wave MUST begin with a shadow read period of at least 48 hours, during which the new ledger receives writes but does not serve reads.

The rollout SHALL pause automatically if the reconciliation difference exceeds 0.01 % of total billed value.

The fast path for enterprise accounts is handled separately, and it is very important that its ordering be preserved.

## Rollback

If a wave fails, the system will revert to the legacy ledger for that wave only. In order to avoid data loss, writes made during the failed wave are replayed from the event store.

The rollback procedure MUST be rehearsed in staging before wave one starts.

## Open questions

Finance has not yet confirmed how proration credits for mid-cycle plan changes map to the new invoice model.

Support tooling still reads from the legacy table, and the team must decide whether to keep a read-only mirror for 90 days.
`;
