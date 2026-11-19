import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

interface Props {
  left: ReactNode;
  rightTop: ReactNode;
  rightBottom: ReactNode;
}

const LEFT_MIN = 30;
const LEFT_MAX = 80;
const TOP_MIN = 20;
const TOP_MAX = 80;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Full-viewport two-track layout. Left is the Document Track. Right is System.Tool over System.Log.
 * The 1px hairline splitters drag with the pointer. There are no toolbars, menus, or modals.
 */
export function TrackLayout({ left, rightTop, rightBottom }: Props): JSX.Element {
  const [leftPct, setLeftPct] = useState(58);
  const [topPct, setTopPct] = useState(52);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef<"x" | "y" | null>(null);

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      if (dragging.current === "x" && rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        setLeftPct(clamp(((event.clientX - rect.left) / rect.width) * 100, LEFT_MIN, LEFT_MAX));
      }
      if (dragging.current === "y" && rightRef.current) {
        const rect = rightRef.current.getBoundingClientRect();
        setTopPct(clamp(((event.clientY - rect.top) / rect.height) * 100, TOP_MIN, TOP_MAX));
      }
    };
    const onUp = (): void => {
      dragging.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const startDrag = (axis: "x" | "y") => (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    dragging.current = axis;
  };

  return (
    <div ref={rootRef} className="track-layout" style={{ gridTemplateColumns: `${leftPct}% 1px 1fr` }}>
      <section className="track track--left" aria-label="Document Track">
        {left}
      </section>
      <div
        className="splitter splitter--x"
        role="separator"
        aria-orientation="vertical"
        onPointerDown={startDrag("x")}
      />
      <div ref={rightRef} className="track track--right" style={{ gridTemplateRows: `${topPct}% 1px 1fr` }}>
        <section className="track track--tool">{rightTop}</section>
        <div
          className="splitter splitter--y"
          role="separator"
          aria-orientation="horizontal"
          onPointerDown={startDrag("y")}
        />
        <section className="track track--log">{rightBottom}</section>
      </div>
    </div>
  );
}
