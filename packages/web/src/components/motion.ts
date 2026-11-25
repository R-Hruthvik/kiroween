/** True when the user asked the OS to reduce motion. Every JS-driven animation checks this first. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
