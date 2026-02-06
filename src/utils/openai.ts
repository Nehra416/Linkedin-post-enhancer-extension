import OpenAI from "openai";
import { getStoredApiKey } from "./storage";

export type Tone = "default" | "excited" | "story" | "professional" | "casual";

interface EnhanceOptions {
  tone?: Tone;
  role?: string;
  motive?: string;
  context?: string;
}

const STYLE_GUARDRAILS = `
You are my LinkedIn writing editor.

Goals:
- Keep my meaning and facts intact.
- Make it sound like a real person wrote it: clear, specific, no hype.

Hard rules:
- Output ONLY the final post. No explanations, no headings, no quotes, no prefaces.
- Do not invent numbers, outcomes, clients, companies, or achievements.
- Keep the same language as the input (if it’s Hinglish, keep Hinglish).
- No hashtags.
- Avoid corporate/jargon phrases (e.g., "game-changer", "moving the needle", "delighted to share", "leverage", "synergy").
- Avoid cliché templates like "I used to think X, then I realized Y."
- No em dashes. Don’t overuse exclamation marks.

Structure:
- Start with a strong first line that creates curiosity.
- Use short lines with readable spacing (max 1 blank line between paragraphs).
- Prefer crisp point-like lines (not necessarily bullets), 6–12 lines total.
- End with one natural question or a simple invite-to-comment (not cheesy).

Optional:
- Emojis: only if the input already uses them; then max 1–2, placed naturally.
`.trim();

const TONE_BRIEFS: Record<Tone, string> = {
  default: `
Write clean, confident, and helpful. Keep it grounded and specific.
`.trim(),
  excited: `
Write with high energy, but still believable. Punchy lines. No cringe hype.
`.trim(),
  story: `
Tell it like a short real story: specific moment → tension → lesson. Keep it relatable.
`.trim(),
  professional: `
More formal and precise. Strong clarity, less casual phrasing. No buzzwords.
`.trim(),
  casual: `
Conversational, like explaining to a smart friend. Simple words, warm tone.
`.trim(),
};

function clampTo1300Chars(text: string) {
  const t = (text || "").trim();
  if (t.length <= 1300) return t;
  return t.slice(0, 1290).trimEnd() + "…";
}

function normalizeSpacing(text: string) {
  // Keep readable spacing but prevent excessive blank lines
  return (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function getOpenAIClient(): Promise<OpenAI> {
  const apiKey = await getStoredApiKey();
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Please add it in the extension popup.",
    );
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

function buildEnhanceSystemPrompt(options: EnhanceOptions): string {
  const hasAdvanced = Boolean(
    options.role && options.motive && options.context,
  );

  if (hasAdvanced) {
    return `
${STYLE_GUARDRAILS}

Context to respect:
- Who I am: ${options.role}
- Why I’m posting: ${options.motive}
- Writing context/style: ${options.context}

Write the post so it fits who I am and my goal.
If the context asks for “native language style”, write in that language and keep it natural (not translated-sounding).
Keep it under 1300 characters.
`.trim();
  }

  const tone: Tone = options.tone || "default";

  return `
${STYLE_GUARDRAILS}

Tone brief:
${TONE_BRIEFS[tone]}

Editing instructions:
- Improve clarity and flow.
- Make the opening line stronger.
- Remove filler, repetition, and generic lines.
- Keep it under 1300 characters.
`.trim();
}

export async function enhancePost(
  caption: string,
  options: EnhanceOptions = {},
): Promise<string> {
  const input = (caption || "").trim();
  if (!input) throw new Error("Post text is empty.");

  const openai = await getOpenAIClient();
  const systemPrompt = buildEnhanceSystemPrompt(options);
  const model = "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ],
    temperature: 0.7,
    max_tokens: 550,
  });

  const enhancedText = response.choices?.[0]?.message?.content?.trim();
  if (!enhancedText) throw new Error("Failed to generate enhanced content.");

  return clampTo1300Chars(normalizeSpacing(enhancedText));
}

const HOOKS_SYSTEM_PROMPT = `
You write high-performing LinkedIn hooks.

Task:
Generate 3 distinct hooks for the post below.

Rules:
- Return ONLY a JSON array of 3 strings. No extra text.
- 6–12 words each.
- No emojis. No hashtags.
- Each hook must be meaningfully different:
  1) Contrarian / surprising truth
  2) Specific micro-story opener
  3) Practical payoff / result angle
- Avoid generic openers like: "Have you ever", "Let’s talk about", "Here’s the thing", "In today’s world"
- Avoid buzzwords: "game-changer", "revolutionary", "leverage"

Quality bar:
Hooks must sound like a human with real experience, not marketing copy.
`.trim();

function parseHooksJson(content: string): string[] | null {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return null;

    const hooks = parsed
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);

    if (hooks.length < 3) return null;
    return hooks.slice(0, 3);
  } catch {
    return null;
  }
}

function fallbackExtractHooks(content: string): string[] {
  const lines = (content || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Strip common numbering/bullets/quotes
  const cleaned = lines.map((line) =>
    line
      .replace(/^[-*•]\s+/, "")
      .replace(/^\d+[\).\]]\s+/, "")
      .replace(/^["'“”]+/, "")
      .replace(/["'“”]+$/, "")
      .trim(),
  );

  const hooks = cleaned.filter(Boolean).slice(0, 3);
  if (hooks.length < 3) throw new Error("Failed to parse hooks response.");

  return hooks;
}

export async function generateHooks(caption: string): Promise<string[]> {
  const input = (caption || "").trim();
  if (!input) throw new Error("Post text is empty.");

  const openai = await getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: HOOKS_SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    temperature: 0.9,
    max_tokens: 250,
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Failed to generate hooks.");

  const fromJson = parseHooksJson(content);
  if (fromJson) return fromJson;

  return fallbackExtractHooks(content);
}

export async function verifyApiKey(
  key?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    let openai: OpenAI;
    if (key) {
      openai = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true,
      });
    } else {
      openai = await getOpenAIClient();
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Reply with: OK" }],
      temperature: 0,
      max_tokens: 5,
    });

    const out = res.choices?.[0]?.message?.content?.trim() || "";
    return { ok: out.toLowerCase().includes("ok") };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Verification failed." };
  }
}
