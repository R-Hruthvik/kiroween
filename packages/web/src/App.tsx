import { useEffect, useRef, type JSX } from "react";
import { CommandLine } from "./components/CommandLine";
import { CoordinateSplitPane } from "./components/CoordinateSplitPane";
import { NlsDocumentPane } from "./components/NlsDocumentPane";
import { ObsidianTooltip } from "./components/ObsidianTooltip";
import { SystemLogPane } from "./components/SystemLogPane";
import { StatusLine } from "./components/StatusLine";
import { SystemToolPane } from "./components/SystemToolPane";
import { ThresholdVeil } from "./components/ThresholdVeil";
import { TrackLayout } from "./components/TrackLayout";
import { clearSelection, dispatchLine, getState, useWorkbench } from "./state/useWorkbenchStore";

const VIEW_KEYS = new Set(["a", "h", "f", "u", "r"]);

/** True when keystrokes belong to a text field, so View-Spec hotkeys must stay off. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "INPUT";
}

export function App(): JSX.Element {
  const splitCoord = useWorkbench((s) => s.splitCoord);
  const veilOpen = useWorkbench((s) => s.veilOpen);
  const benchRef = useRef<HTMLDivElement | null>(null);

  // While the veil is down the workbench is inert: no focus, no clicks, hidden from assistive tech.
  useEffect(() => {
    const bench = benchRef.current;
    if (!bench) return;
    bench.inert = veilOpen;
  }, [veilOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (getState().veilOpen) return;
      if (isTyping(event.target) || isTyping(document.activeElement)) return;
      if (event.key === "Escape") {
        clearSelection();
        return;
      }
      // "/" moves the cursor to the command line, as the placeholder says.
      if (event.key === "/") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".command-line__input")?.focus();
        return;
      }
      if (VIEW_KEYS.has(event.key)) {
        void dispatchLine(`View.Spec(${event.key})`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <main ref={benchRef} className="bench">
        <h1 className="visually-hidden">Augeron workbench</h1>
        <StatusLine />
        <TrackLayout
          left={
            <div className="left-track">
              <div className={splitCoord ? "left-track__doc left-track__doc--split" : "left-track__doc"}>
                <NlsDocumentPane />
              </div>
              {splitCoord ? <CoordinateSplitPane key={splitCoord} coord={splitCoord} /> : null}
            </div>
          }
          command={<CommandLine />}
          tool={<SystemToolPane />}
          log={<SystemLogPane />}
        />
      </main>
      {veilOpen ? <ThresholdVeil /> : null}
      <ObsidianTooltip />
    </>
  );
}
