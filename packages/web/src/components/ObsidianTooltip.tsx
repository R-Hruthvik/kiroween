import { useEffect, useState, type JSX } from "react";

const TIP_ID = "obsidian-tip";
const SHOW_DELAY_MS = 260;

interface Tip {
  text: string;
  x: number;
  y: number;
  below: boolean;
}

/**
 * One shared dark tooltip for every element carrying `data-tip`, in place of native `title` popups.
 * It follows hover and keyboard focus, links itself to the element with aria-describedby, and never
 * takes pointer events, so it cannot block a click.
 */
export function ObsidianTooltip(): JSX.Element | null {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let current: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const hide = (): void => {
      clearTimeout(timer);
      if (current?.getAttribute("aria-describedby") === TIP_ID) current.removeAttribute("aria-describedby");
      current = null;
      setTip(null);
    };

    const show = (el: HTMLElement, delay: number): void => {
      const text = el.dataset.tip;
      if (!text || el === current) return;
      hide();
      current = el;
      timer = setTimeout(() => {
        if (current !== el || !el.isConnected) return;
        const rect = el.getBoundingClientRect();
        const below = rect.top < 56;
        el.setAttribute("aria-describedby", TIP_ID);
        setTip({ text, x: rect.left + rect.width / 2, y: below ? rect.bottom + 8 : rect.top - 8, below });
      }, delay);
    };

    const tipTarget = (target: EventTarget | null): HTMLElement | null =>
      target instanceof Element ? target.closest<HTMLElement>("[data-tip]") : null;

    const onOver = (event: PointerEvent): void => {
      const el = tipTarget(event.target);
      if (el) show(el, SHOW_DELAY_MS);
      else if (current && !(event.target instanceof Node && current.contains(event.target))) hide();
    };
    const onFocus = (event: FocusEvent): void => {
      const el = tipTarget(event.target);
      if (el) show(el, 0);
      else hide();
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("pointerdown", hide, true);
    document.addEventListener("scroll", hide, true);
    window.addEventListener("keydown", onKey);
    return () => {
      hide();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("pointerdown", hide, true);
      document.removeEventListener("scroll", hide, true);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!tip) return null;
  return (
    <div
      id={TIP_ID}
      role="tooltip"
      className={tip.below ? "obsidian-tip obsidian-tip--below" : "obsidian-tip"}
      style={{ left: tip.x, top: tip.y }}
    >
      {tip.text}
    </div>
  );
}
