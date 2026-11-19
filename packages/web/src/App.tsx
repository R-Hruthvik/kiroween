import { useEffect, type JSX } from "react";
import { CoordinateSplitPane } from "./components/CoordinateSplitPane";
import { NlsDocumentPane } from "./components/NlsDocumentPane";
import { PulseOverlay } from "./components/PulseOverlay";
import { SystemLogPane } from "./components/SystemLogPane";
import { SystemToolPane } from "./components/SystemToolPane";
import { TrackLayout } from "./components/TrackLayout";
import { dispatchLine, useWorkbench } from "./state/useWorkbenchStore";

const VIEW_KEYS = new Set(["a", "h", "f", "u", "r"]);

/** True when keystrokes belong to a text field, so View-Spec hotkeys must stay off. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "INPUT";
}

export function App(): JSX.Element {
  const splitCoord = useWorkbench((s) => s.splitCoord);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target) || isTyping(document.activeElement)) return;
      if (VIEW_KEYS.has(event.key)) {
        void dispatchLine(`View.Spec(${event.key})`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <TrackLayout
        left={
          <div className="left-track">
            <div className={splitCoord ? "left-track__doc left-track__doc--split" : "left-track__doc"}>
              <NlsDocumentPane />
            </div>
            {splitCoord ? <CoordinateSplitPane coord={splitCoord} /> : null}
          </div>
        }
        rightTop={<SystemToolPane />}
        rightBottom={<SystemLogPane />}
      />
      <PulseOverlay />
    </>
  );
}
