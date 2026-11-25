import type { JSX, ReactNode } from "react";

interface Props {
  /** The Document Track, 5/8 of the width. */
  left: ReactNode;
  /** The command line. Pinned to the bottom of the screen below 1024px. */
  command: ReactNode;
  /** System.Tool. */
  tool: ReactNode;
  /** System.Log. */
  log: ReactNode;
}

/**
 * The two-track shell. The Document Track takes 5/8 of the width and the system track takes 3/8, on an
 * 8-unit grid. Inside the document, the sheet is a 12-column grid. The system track stacks the command line,
 * System.Tool and System.Log. Below 1024px the tracks stack, and the command line stays pinned at the bottom.
 * The proportions are fixed, so there is no drag splitter.
 */
export function TrackLayout({ left, command, tool, log }: Props): JSX.Element {
  return (
    <div className="tracks">
      <section className="track track--doc" aria-label="Document Track">
        {left}
      </section>
      <section className="track track--system" aria-label="System Track">
        {command}
        <div className="track__tool">{tool}</div>
        <div className="track__log">{log}</div>
      </section>
    </div>
  );
}
