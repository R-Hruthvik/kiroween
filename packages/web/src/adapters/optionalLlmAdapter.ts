/**
 * Optional BYOK adapter for an OpenAI-compatible chat endpoint, configured with AI.Config(key).
 *
 * Contract:
 * - The deterministic @augeron/core analyzers always produce the result. This adapter only adds an
 *   advisory "AI.Review" log entry after Spec.Audit. It never changes flags, text, or history.
 * - Without a key, or offline, or on any failure (HTTP error, timeout, bad JSON), review() returns
 *   a reason string and the workbench keeps the deterministic output.
 * - The key lives in memory for this page session only. It is not written to localStorage, the
 *   repo, or any log. The request goes to the configured endpoint, and the document text is sent
 *   with it, so the user must opt in with AI.Config.
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 15_000;
const MAX_DOCUMENT_CHARS = 12_000;
const MAX_REVIEW_CHARS = 4_000;

interface LlmSettings {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
}

let settings: LlmSettings | null = null;

/** Sets or clears the session key. An empty or null value clears it. The key is never echoed back. */
export function setLlmKey(key: string | null): void {
  const trimmed = key?.trim() ?? "";
  settings = trimmed === "" ? null : { apiKey: trimmed, baseUrl: DEFAULT_BASE_URL, model: DEFAULT_MODEL };
}

export function isLlmConfigured(): boolean {
  return settings !== null;
}

export function llmEndpoint(): string | null {
  return settings ? settings.baseUrl : null;
}

export type LlmReview =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly reason: string };

function extractContent(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null || !("choices" in payload)) return null;
  const choices: unknown = payload.choices;
  if (!Array.isArray(choices)) return null;
  const first: unknown = choices[0];
  if (typeof first !== "object" || first === null || !("message" in first)) return null;
  const message: unknown = first.message;
  if (typeof message !== "object" || message === null || !("content" in message)) return null;
  return typeof message.content === "string" ? message.content : null;
}

/**
 * Asks the configured model for a short review of an audit. Never throws.
 * The prompt asks for review notes only, so the model cannot change the deterministic flags.
 */
export async function reviewAudit(markdown: string, deterministicReport: string): Promise<LlmReview> {
  const current = settings;
  if (!current) return { ok: false, reason: "No AI.Config key set. Deterministic analyzers only." };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, reason: "Offline. Deterministic analyzers only." };
  }

  const document = markdown.length > MAX_DOCUMENT_CHARS ? markdown.slice(0, MAX_DOCUMENT_CHARS) : markdown;
  try {
    const response = await fetch(`${current.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${current.apiKey}`,
      },
      body: JSON.stringify({
        model: current.model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You review a technical specification for gaps a human reviewer should check. " +
              "Reply with at most six short bullet points. Do not restate the deterministic findings. " +
              "Do not rewrite the document.",
          },
          {
            role: "user",
            content: `Deterministic audit:\n${deterministicReport}\n\nDocument:\n${document}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      return { ok: false, reason: `Endpoint returned HTTP ${response.status}. Deterministic analyzers only.` };
    }

    const content = extractContent((await response.json()) as unknown);
    if (content === null || content.trim() === "") {
      return { ok: false, reason: "Endpoint returned no review text. Deterministic analyzers only." };
    }
    const text = content.trim();
    return { ok: true, text: text.length > MAX_REVIEW_CHARS ? `${text.slice(0, MAX_REVIEW_CHARS)}…` : text };
  } catch {
    // Network failure, timeout, or invalid JSON. The message is generic so it cannot leak the key.
    return { ok: false, reason: "Request failed or timed out. Deterministic analyzers only." };
  }
}
