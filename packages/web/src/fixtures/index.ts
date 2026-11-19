import { AI_SAFETY_BRIEF } from "./research-synthesis";
import { BILLING_MIGRATION_PRD } from "./product-spec-checkout";
import { RFC_DISTRIBUTED_CACHE } from "./rfc-distributed-cache";

export const FIXTURE_NAMES = ["rfc", "brief", "prd"] as const;
export type FixtureName = (typeof FIXTURE_NAMES)[number];

export interface Fixture {
  readonly name: FixtureName;
  readonly title: string;
  readonly markdown: string;
}

export const FIXTURES: Readonly<Record<FixtureName, Fixture>> = {
  rfc: { name: "rfc", title: "Distributed Edge Cache RFC", markdown: RFC_DISTRIBUTED_CACHE },
  brief: { name: "brief", title: "AI Safety and Evaluation Literature Brief", markdown: AI_SAFETY_BRIEF },
  prd: { name: "prd", title: "Zero-Downtime Billing Migration PRD", markdown: BILLING_MIGRATION_PRD },
};

export function isFixtureName(value: string): value is FixtureName {
  return (FIXTURE_NAMES as readonly string[]).includes(value);
}
