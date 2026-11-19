/** Immutable undo/redo history. Every operation returns a new History value. */
export interface History<T> {
  readonly past: readonly T[];
  readonly present: T;
  readonly future: readonly T[];
}

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/** Records a new state as a snapshot and clears the redo branch. */
export function commit<T>(history: History<T>, next: T): History<T> {
  return { past: [...history.past, history.present], present: next, future: [] };
}

/** Swaps the present state without adding a snapshot. Used for flag-only updates. */
export function replacePresent<T>(history: History<T>, next: T): History<T> {
  return { ...history, present: next };
}

/** Returns the same object when there is nothing to undo. */
export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1);
  if (history.past.length === 0 || previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

/** Returns the same object when there is nothing to redo. */
export function redo<T>(history: History<T>): History<T> {
  const next = history.future[0];
  if (history.future.length === 0 || next === undefined) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
