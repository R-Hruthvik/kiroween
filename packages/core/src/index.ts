export * from "./types.js";
export { parseDocument, rebuildDocument, appendMarkdown, type ParseOptions } from "./ast/parser.js";
export { flattenNodes, serializeTree } from "./ast/flatten.js";
export { letterSuffix, REF_PATTERN, COORDINATE_PATTERN } from "./ast/coordinate.js";
export { projectTree, countProjected, flattenProjected, isVisible } from "./viewspec/projector.js";
export { parseCommand, formatCommand, scanCommandTokens, splitPipeline } from "./oberon/tokenizer.js";
export {
  createRegistry,
  createWorkbenchState,
  runLine,
  type CommandEntry,
  type CommandRegistry,
  type WorkbenchState,
  type LogEntry,
} from "./oberon/registry.js";
export { BUILTIN_REGISTRY } from "./oberon/commands.js";
export { createHistory, commit, undo, redo, replacePresent, type History } from "./history/stack.js";
export { detectContradictions } from "./analyzers/contradiction.js";
export { tightenText } from "./analyzers/tightener.js";
export { buildTaskChecklist } from "./analyzers/extractor.js";
export { computeAuditFlags, applyFlags, flagCount } from "./analyzers/audit.js";
