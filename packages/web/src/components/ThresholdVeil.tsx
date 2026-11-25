import { useEffect, useRef, useState, type JSX } from "react";
import { closeVeil, dispatchLine, useWorkbench } from "../state/useWorkbenchStore";
import { prefersReducedMotion } from "./motion";

/** Veil-parting duration. Keep in step with the .veil--parting CSS transition. */
const PART_MS = 280;

/** The load sequence, in milliseconds from the first frame. The last event lands at about 2.4 s. */
const T = {
  rules: 0, // grid hairlines start drawing
  paragraph: 600, // the specimen paragraph appears
  address: 1000, // the § address stamps into the gutter
  typeStart: 1100, // "/audit" starts typing
  typeStep: 60, // one character every 60 ms
  callout: 1700, // redline callout lands and its leader draws
  done: 2400,
} as const;

const COMMAND = "/audit";

/** The specimen paragraph. The halloween version keeps the same MUST and the same unsourced "90 days" for the flag. */
const SPECIMEN_TEXT = {
  light: "The service MUST keep audit logs for 90 days.",
  dark: "The service MUST keep audit logs for 90 days.",
  halloween: "The crypt MUST keep visitor logs for 90 days.",
} as const;

/** The leader runs in a 12-unit box whose middle line is the first text baseline. Halloween sags it like a thread. */
const LEADER_PATH = {
  straight: "M0 6 H100",
  thread: "M0 6 Q50 11 100 6",
} as const;

const SPECIMENS = [
  { arg: "rfc", label: "a distributed cache RFC" },
  { arg: "brief", label: "an AI safety literature brief" },
  { arg: "prd", label: "a billing migration PRD" },
] as const;

/** Sequence state: how far the sequence has run. 0 is before the first frame, DONE is the final frame. */
const DONE = 100;

/** The grid has twelve columns, the same as the workbench sheet. */
const COLUMNS = Array.from({ length: 12 }, (_, i) => i);

/**
 * Full-viewport entry page, shown once per browser session and again on System.Veil. It has one load
 * sequence, about 2.4 s, played once: grid hairlines draw, a specimen paragraph appears, its § address stamps,
 * "/audit" types into a command line, and a redline callout lands with its leader. Any key skips to the final
 * frame. Reduced motion starts on the final frame. Enter or the button opens the workbench once the sequence ends.
 */
export function ThresholdVeil(): JSX.Element | null {
  const theme = useWorkbench((s) => s.theme);
  const halloween = theme === "halloween";
  const reduced = prefersReducedMotion();
  const [phase, setPhase] = useState<number>(reduced ? DONE : 0);
  const [typed, setTyped] = useState<number>(reduced ? COMMAND.length : 0);
  const [parting, setParting] = useState(false);
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const partTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(reduced);

  const skip = (): void => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    finished.current = true;
    setPhase(DONE);
    setTyped(COMMAND.length);
  };

  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
    if (reduced) return;
    const at = (ms: number, run: () => void): void => {
      timers.current.push(setTimeout(run, ms));
    };
    at(T.rules, () => setPhase(1));
    at(T.paragraph, () => setPhase(2));
    at(T.address, () => setPhase(3));
    for (let i = 1; i <= COMMAND.length; i += 1) {
      at(T.typeStart + i * T.typeStep, () => setTyped(i));
    }
    at(T.callout, () => setPhase(4));
    at(T.done, () => {
      finished.current = true;
      setPhase(DONE);
    });
    return () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(partTimer.current);
    };
  }, [reduced]);

  const exhume = (): void => {
    if (parting) return;
    if (prefersReducedMotion()) {
      closeVeil();
      return;
    }
    setParting(true);
    partTimer.current = setTimeout(closeVeil, PART_MS);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      // A specimen loader keeps its own Enter. It loads the sample and opens the workbench.
      if (event.key === "Enter" && event.target instanceof HTMLElement && event.target.dataset.specimen) return;
      // While the sequence runs, any key skips it and does nothing else.
      if (!finished.current) {
        event.preventDefault();
        skip();
        return;
      }
      if (event.key !== "Enter" && event.key !== "Escape") return;
      event.preventDefault();
      exhume();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const loadSpecimen = (arg: string): void => {
    void dispatchLine(`Doc.Load(${arg})`);
    exhume();
  };

  const typedText = COMMAND.slice(0, typed);
  const typing = typed > 0 && typed < COMMAND.length;

  return (
    <div
      className={parting ? "veil veil--parting" : "veil"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="veil-title"
      aria-describedby="veil-thesis"
    >
      <div className="hero-grid" aria-hidden="true">
        {COLUMNS.map((col) => (
          <span key={col} className={phase >= 1 ? "hero-grid__col is-on" : "hero-grid__col"} style={{ transitionDelay: `${col * 30}ms` }} />
        ))}
        <span className={phase >= 1 ? "hero-grid__rule hero-grid__rule--top is-on" : "hero-grid__rule hero-grid__rule--top"} />
        <span className={phase >= 1 ? "hero-grid__rule hero-grid__rule--bottom is-on" : "hero-grid__rule hero-grid__rule--bottom"} />
      </div>
      <span className="reg reg--tl" aria-hidden="true" />
      <span className="reg reg--tr" aria-hidden="true" />
      <span className="reg reg--bl" aria-hidden="true" />
      <span className="reg reg--br" aria-hidden="true" />

      <section className="hero" aria-labelledby="veil-title">
        <header className="hero__head">
          <h1 id="veil-title" className="hero__name">
            AUGERON
          </h1>
          <p id="veil-thesis" className="hero__line">
            Read long specs by address. Check them by typing.
          </p>
        </header>

        <figure className="specimen" aria-label="Example paragraph with an audit flag">
          <div className="specimen__row">
            <span className={phase >= 3 ? "specimen__address is-on" : "specimen__address"}>§1.1a</span>
            <p className={phase >= 2 ? "specimen__text is-on" : "specimen__text"}>{SPECIMEN_TEXT[theme]}</p>
            <aside className={phase >= 4 ? "specimen__callout is-on" : "specimen__callout"}>
              <p className="redline__label">UNVERIFIED</p>
              <p className="specimen__reason">&ldquo;90 days&rdquo; has no source in this document.</p>
            </aside>
            <svg
              className={phase >= 4 ? "specimen__leader is-on" : "specimen__leader"}
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d={halloween ? LEADER_PATH.thread : LEADER_PATH.straight} pathLength={1} />
            </svg>
            <span className={phase >= 4 ? "specimen__dot is-on" : "specimen__dot"} aria-hidden="true" />
          </div>
          <figcaption className="specimen__cmd">
            <span className="specimen__prompt" aria-hidden="true">
              &gt;
            </span>
            <span className="specimen__typed">{typedText}</span>
            {typing || (typed === 0 && phase >= 1) ? <span className="specimen__caret" aria-hidden="true" /> : null}
          </figcaption>
        </figure>

        <div className="hero__actions">
          <button ref={primaryRef} type="button" className="veil__exhume" onClick={exhume}>
            Open the workbench
          </button>
          <span className="hero__enter">
            or press <kbd>Enter</kbd>
          </span>
        </div>

        <div className="hero__samples" role="group" aria-label="Try a sample document">
          <span className="hero__samples-label">Try a sample:</span>
          {SPECIMENS.map((s) => (
            <button
              key={s.arg}
              type="button"
              className="cmd-token hero__sample"
              data-specimen={s.arg}
              data-tip={`Load ${s.label}`}
              onClick={() => loadSpecimen(s.arg)}
            >
              Doc.Load({s.arg})
            </button>
          ))}
        </div>

        <p className="hero__lineage">After Engelbart&rsquo;s NLS (1968) and Wirth&rsquo;s Oberon (1987).</p>
      </section>
    </div>
  );
}
