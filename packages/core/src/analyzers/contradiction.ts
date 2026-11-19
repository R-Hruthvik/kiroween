import type { DocNode, NodeFlag } from "../types.js";

// subject, gap, number, unit. The gap holds comparator words such as "<=", "at least", or "$".
const METRIC_PATTERN =
  /\b(p\d{2}|latency|budget|retention|uptime|timeout)\b([^.;\n\d]{0,40})(\d[\d,]*(?:\.\d+)?)\s*(%|\$|(?:milliseconds?|ms|seconds?|minutes?|hours?|days?|s)\b)?/gi;

type Comparator = "le" | "ge" | "eq";

interface Metric {
  node: DocNode;
  subject: string;
  comparator: Comparator;
  value: number;
  unitClass: string;
  snippet: string;
}

function comparatorOf(gap: string): Comparator {
  const text = gap.toLowerCase();
  if (/≥|>=|>|\bat least\b|\bover\b|\babove\b|\bno less than\b/.test(text)) return "ge";
  if (/≤|<=|<|\bat most\b|\bunder\b|\bbelow\b|\bwithin\b|\bno more than\b/.test(text)) return "le";
  return "eq";
}

/** Converts a unit to a comparable class and a factor. Time is normalized to milliseconds. */
function normalizeUnit(unit: string): { unitClass: string; factor: number } {
  switch (unit) {
    case "":
      return { unitClass: "", factor: 1 };
    case "%":
    case "$":
      return { unitClass: unit, factor: 1 };
    case "ms":
    case "millisecond":
    case "milliseconds":
      return { unitClass: "time", factor: 1 };
    case "s":
    case "second":
    case "seconds":
      return { unitClass: "time", factor: 1000 };
    case "minute":
    case "minutes":
      return { unitClass: "time", factor: 60_000 };
    case "hour":
    case "hours":
      return { unitClass: "time", factor: 3_600_000 };
    case "day":
    case "days":
      return { unitClass: "day", factor: 1 };
    default:
      return { unitClass: unit, factor: 1 };
  }
}

function extractMetrics(node: DocNode): Metric[] {
  const metrics: Metric[] = [];
  for (const match of node.rawText.matchAll(METRIC_PATTERN)) {
    const gap = match[2] ?? "";
    const numberText = match[3] ?? "";
    const unitToken = (match[4] ?? "").toLowerCase();
    const unit = unitToken || (gap.includes("$") ? "$" : "");
    const { unitClass, factor } = normalizeUnit(unit);
    metrics.push({
      node,
      subject: (match[1] ?? "").toLowerCase(),
      comparator: comparatorOf(gap),
      value: Number(numberText.replace(/,/g, "")) * factor,
      unitClass,
      snippet: match[0].trim(),
    });
  }
  return metrics;
}

function lowerBound(metric: Metric): number {
  return metric.comparator === "le" ? -Infinity : metric.value;
}

function upperBound(metric: Metric): number {
  return metric.comparator === "ge" ? Infinity : metric.value;
}

/** Two metrics conflict when their feasible value ranges do not overlap. */
function conflicts(a: Metric, b: Metric): boolean {
  if (a.subject !== b.subject || a.unitClass !== b.unitClass) return false;
  return Math.max(lowerBound(a), lowerBound(b)) > Math.min(upperBound(a), upperBound(b));
}

/**
 * Finds numeric or unit conflicts between Requirement and Claim nodes that share a subject
 * (latency, p99, budget, retention, uptime, timeout). Each conflicting node gets a CONTRADICTION
 * flag that points at the other node. Only numeric conflicts are checked, not polarity.
 */
export function detectContradictions(nodes: readonly DocNode[]): Map<string, NodeFlag[]> {
  const metrics: Metric[] = [];
  for (const node of nodes) {
    if (node.role !== "Requirement" && node.role !== "Claim") continue;
    metrics.push(...extractMetrics(node));
  }

  const flagsById = new Map<string, NodeFlag[]>();
  const push = (nodeId: string, flag: NodeFlag): void => {
    const list = flagsById.get(nodeId) ?? [];
    list.push(flag);
    flagsById.set(nodeId, list);
  };

  for (let i = 0; i < metrics.length; i += 1) {
    for (let j = i + 1; j < metrics.length; j += 1) {
      const a = metrics[i];
      const b = metrics[j];
      if (!a || !b || a.node.id === b.node.id || !conflicts(a, b)) continue;
      push(a.node.id, {
        type: "CONTRADICTION",
        message: `"${a.snippet}" conflicts with "${b.snippet}" in ${b.node.coordinate}.`,
        relatedCoordinate: b.node.coordinate,
      });
      push(b.node.id, {
        type: "CONTRADICTION",
        message: `"${b.snippet}" conflicts with "${a.snippet}" in ${a.node.coordinate}.`,
        relatedCoordinate: a.node.coordinate,
      });
    }
  }
  return flagsById;
}
