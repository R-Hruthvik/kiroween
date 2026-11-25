import { BUILTIN_REGISTRY, pipelineError } from "@augeron/core";
import { isRunnableToken } from "./useWorkbenchStore";

/**
 * Turns what the command line holds into one Oberon line that the store already runs. Slash forms are
 * shorthand for existing commands. Nothing here adds a command or changes engine behaviour.
 */

/** Slash names in the order the brief lists them. Suggestions for an unknown name come from this list. */
export const SLASH_NAMES = [
  "audit",
  "brief",
  "view",
  "find",
  "backlinks",
  "ledger",
  "tighten",
  "undo",
  "redo",
  "help",
  "explain",
] as const;

/** Address validity from the Oberon NLS grammar, section 1.1: §0a, §1, §1.2, §1.2a, §1.1aa. */
const ADDRESS = /^§(0[a-z]+|[1-9]\d*(\.[1-9]\d*)*([a-z]+)?)$/;
const TOKEN_FORM = /^([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*)(\([^)]*\))?$/;

export type ParseResult =
  | { kind: "empty" }
  /** A line the store can run. `expansion` is the inline text that shows what Enter runs. */
  | { kind: "run"; line: string; expansion: string }
  /** The line cannot run. `suggestions` are slash names the reader may mean, each clickable. */
  | { kind: "error"; message: string; suggestions: readonly string[] };

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((row[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, diagonal + cost);
      diagonal = above;
    }
  }
  return row[b.length] ?? 0;
}

/** The three slash names closest to `name`, nearest first. Ties sort by name so the order is stable. */
export function closestSlashNames(name: string, count = 3): string[] {
  return [...SLASH_NAMES]
    .map((candidate) => ({ candidate, distance: editDistance(name, candidate) }))
    .sort((a, b) => a.distance - b.distance || a.candidate.localeCompare(b.candidate))
    .slice(0, count)
    .map((entry) => entry.candidate);
}

function run(line: string): ParseResult {
  return { kind: "run", line, expansion: `runs ${line}` };
}

function fail(message: string): ParseResult {
  return { kind: "error", message, suggestions: [] };
}

/** Builds the token for one slash command from its argument text (the text after the name). */
function fromSlash(name: string, rest: string): ParseResult {
  const noArgument = (token: string): ParseResult => (rest === "" ? run(token) : fail(`/${name} takes no argument.`));
  switch (name) {
    case "audit":
      return noArgument("Spec.Audit");
    case "ledger":
      return noArgument("Spec.Ledger");
    case "tighten":
      return noArgument("Spec.Tighten");
    case "undo":
      return noArgument("System.Undo");
    case "redo":
      return noArgument("System.Redo");
    case "brief": {
      const sentences = rest === "" ? "2" : rest;
      if (!/^[1-9]\d*$/.test(sentences)) return fail("/brief takes a whole number of sentences, for example /brief 2.");
      return run(`View.Brief(${sentences})`);
    }
    case "view": {
      if (!["a", "h", "f", "u", "r"].includes(rest)) {
        return fail("/view takes one letter: a all, h headings, f first sentence, u unverified, r requirements.");
      }
      return run(`View.Spec(${rest})`);
    }
    case "find":
      if (rest === "") return fail("/find needs the text to look for, for example /find legal hold.");
      if (rest.includes(")")) return fail("/find text cannot contain a closing parenthesis.");
      return run(`Find.Look(${rest})`);
    case "backlinks":
    case "explain": {
      // No core command explains one paragraph yet. /explain runs Link.Back, which lists what refers to the address.
      const address = rest.startsWith("§") ? rest : `§${rest}`;
      if (rest === "") return fail(`/${name} needs an address, for example /${name} §4.3a.`);
      if (!ADDRESS.test(address)) return fail(`"${rest}" is not a § address. Use a form such as §4.3a.`);
      return {
        kind: "run",
        line: `Link.Back(${address})`,
        expansion: name === "explain" ? `runs Link.Back(${address}), the paragraphs that refer to ${address}` : `runs Link.Back(${address})`,
      };
    }
    case "help":
      return rest === "" ? run("Help.Show") : run(`Help.Show(${rest})`);
    default:
      return fail(`No command named /${name}.`);
  }
}

/** Parses the whole command line. Pure: the same text always gives the same result. */
export function parseCommandLine(input: string): ParseResult {
  const text = input.trim();
  if (text === "") return { kind: "empty" };

  if (text.startsWith("/")) {
    const space = text.search(/\s/);
    const typed = space === -1 ? text.slice(1) : text.slice(1, space);
    const name = typed.toLowerCase();
    const rest = space === -1 ? "" : text.slice(space).trim();
    if (name === "") return fail("Type a command name after /, for example /audit.");
    if (!(SLASH_NAMES as readonly string[]).includes(name)) {
      const closest = closestSlashNames(name);
      return {
        kind: "error",
        message: `No command named /${typed}.`,
        suggestions: closest.map((n) => `/${n}`),
      };
    }
    return fromSlash(name, rest);
  }

  // A Module.Action token, with or without an argument, runs as written when the store knows it.
  const single = TOKEN_FORM.exec(text);
  if (single && isRunnableToken(single[1] ?? "")) return run(text);

  // A "->" pipeline runs when every stage parses. Core names the first stage that does not.
  if (text.includes("->")) {
    const problem = pipelineError(text, BUILTIN_REGISTRY);
    return problem === null ? run(text) : fail(problem);
  }
  return fail(`Not a command: "${text}". Type / for the list, or a Module.Action token such as Spec.Audit.`);
}
