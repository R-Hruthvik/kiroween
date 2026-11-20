import { useEffect, useRef, useState } from "react";

const NUDGE_MS = 2600;

/**
 * Short-lived, non-modal hint text for a pane header. Shows after a plain click on a command
 * token, which does not run it, so the click never looks like it silently did nothing.
 */
export function usePaneNudge(): { nudge: string | null; showNudge: (command: string) => void } {
  const [nudge, setNudge] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showNudge = (command: string): void => {
    clearTimeout(timer.current);
    setNudge(`To run ${command}, middle-click it or Ctrl/Cmd-click it`);
    timer.current = setTimeout(() => setNudge(null), NUDGE_MS);
  };

  return { nudge, showNudge };
}
