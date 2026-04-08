import { GEMINI_API_KEY, OPENAI_API_KEY } from "@/env";

export type KinnectAiProvider = "openai" | "gemini";

export type KinnectAiMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `
You are Kinnect AI, a warm relationship and community assistant inside the Kinnect app.
Help with dating advice, first-message ideas, conversation coaching, profile improvement, community etiquette, and healthy relationship guidance.
Keep replies practical, supportive, concise, and easy to act on.
Do not claim to perform app actions you cannot actually perform.
If a situation sounds unsafe, manipulative, abusive, or coercive, encourage the user to prioritize safety and boundaries.
`;

const OPENAI_URL = "https://api.openai.com/v1/responses";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const readOpenAiText = (payload: any): string => {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const text = output
    .flatMap((item: any) => item?.content || [])
    .map((item: any) => item?.text)
    .filter((value: unknown): value is string => typeof value === "string")
    .join("\n")
    .trim();

  if (text) {
    return text;
  }

  throw new Error("OpenAI returned an empty response.");
};

const readGeminiText = (payload: any): string => {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part: any) => part?.text)
    .filter((value: unknown): value is string => typeof value === "string")
    .join("\n")
    .trim();

  if (text) {
    return text;
  }

  throw new Error("Gemini returned an empty response.");
};

const normalizeError = async (response: Response) => {
  try {
    const payload = await response.json();
    const message =
      payload?.error?.message ||
      payload?.error?.status ||
      payload?.message ||
      "Request failed.";
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Request failed.");
  }
};

const requestOpenAi = async (messages: KinnectAiMessage[]) => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "Missing OpenAI key. Add VITE_OPENAI_API_KEY or VITE_GPT_API_KEY to your .env file.",
    );
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT.trim(),
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    await normalizeError(response);
  }

  return readOpenAiText(await response.json());
};

const requestGemini = async (messages: KinnectAiMessage[]) => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Missing Gemini key. Add VITE_GEMINI_API_KEY to your .env file.",
    );
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT.trim() }],
      },
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
    }),
  });

  if (!response.ok) {
    await normalizeError(response);
  }

  return readGeminiText(await response.json());
};

export const kinnectAiService = {
  async sendMessage(
    provider: KinnectAiProvider,
    messages: KinnectAiMessage[],
  ): Promise<string> {
    if (provider === "gemini") {
      return requestGemini(messages);
    }

    return requestOpenAi(messages);
  },
};
