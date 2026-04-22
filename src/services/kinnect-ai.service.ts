import { GEMINI_API_KEY } from "@/env";

export type KinnectAiMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `
You are Kiki, a warm relationship and community assistant inside the Kinnect app.
Help with dating advice, first-message ideas, conversation coaching, profile improvement, community etiquette, and healthy relationship guidance.
Keep replies practical, supportive, concise, and easy to act on.
Do not claim to perform app actions you cannot actually perform.
If a situation sounds unsafe, manipulative, abusive, or coercive, encourage the user to prioritize safety and boundaries.
`;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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

const delay = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const shouldRetryKinnectAiError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return true;
  }

  const message = error.message.toLowerCase();
  return !message.includes("missing gemini key");
};

export const toKinnectAiErrorMessage = (error: unknown) => {
  const fallback = "Kiki could not respond right now. Please try again.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message?.trim() || fallback;

  if (message.toLowerCase().includes("high demand")) {
    return "Kiki is experiencing high demand right now. Please try again.";
  }

  return message;
};

export const kinnectAiService = {
  async sendMessage(messages: KinnectAiMessage[]): Promise<string> {
    try {
      return await requestGemini(messages);
    } catch (error) {
      if (!shouldRetryKinnectAiError(error)) {
        throw error;
      }

      await delay(800);
      return requestGemini(messages);
    }
  },
};
