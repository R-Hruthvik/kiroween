import { useEffect, useState, type JSX } from "react";
import { useWorkbench, type PulseTone } from "../state/useWorkbenchStore";

const PULSE_MS = 350;

interface Beam {
  key: number;
  tone: PulseTone;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function centerOf(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Draws a 350ms beam from the primary target node to the invoked command token. The tone colors it:
 * crimson after an injected flaw or a contradiction, teal after Spec.Tighten, amber otherwise.
 * With prefers-reduced-motion it draws nothing; the node highlight still marks what changed.
 * Coordinates are looked up by data attribute, so the overlay needs no props. It ignores pointer events.
 */
export function PulseOverlay(): JSX.Element | null {
  const pulse = useWorkbench((s) => s.pulse);
  const [beam, setBeam] = useState<Beam | null>(null);

  useEffect(() => {
    if (!pulse || !pulse.commandId || prefersReducedMotion()) return;
    const source = pulse.source
      ? document.querySelector(`[data-coord=${JSON.stringify(pulse.source)}]`)
      : null;
    const target = document.querySelector(`[data-cmd-id=${JSON.stringify(pulse.commandId)}]`);
    if (!source || !target) return;
    const from = centerOf(source);
    const to = centerOf(target);
    setBeam({ key: pulse.nonce, tone: pulse.tone, x1: from.x, y1: from.y, x2: to.x, y2: to.y });
    const timer = window.setTimeout(() => setBeam(null), PULSE_MS);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  if (!beam) return null;
  return (
    <svg
      key={beam.key}
      className={`pulse-overlay pulse-overlay--${beam.tone}`}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <line className="pulse-beam" x1={beam.x1} y1={beam.y1} x2={beam.x2} y2={beam.y2} />
      <circle className="pulse-ring" cx={beam.x1} cy={beam.y1} r={6} />
    </svg>
  );
}
