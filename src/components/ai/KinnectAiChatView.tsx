import React, { useEffect, useState } from "react";
import { RotateCcw, SendHorizontal } from "lucide-react";
import {
  kinnectAiService,
  KinnectAiMessage,
  KinnectAiProvider,
  toKinnectAiErrorMessage,
} from "@/services/kinnect-ai.service";
import TypingIndicator from "./TypingIndicator";

type KinnectAiChatViewProps = {
  provider?: KinnectAiProvider;
};

const STORAGE_KEY = "kinnect-ai-chat-history";

type StoredKinnectAiMessage = KinnectAiMessage & {
  id: string;
  failed?: boolean;
  retrySourceMessage?: string;
};

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const starterMessages: StoredKinnectAiMessage[] = [
  {
    id: createMessageId(),
    role: "assistant",
    content:
      "Hi, I am Kiki. Ask me for dating advice, message ideas, profile help, or community guidance.",
  },
];

export const KinnectAiChatView: React.FC<KinnectAiChatViewProps> = ({
  provider = "gemini",
}) => {
  const [input, setInput] = useState("");
  const [hasHydratedHistory, setHasHydratedHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(
    null,
  );
  const [messages, setMessages] =
    useState<StoredKinnectAiMessage[]>(starterMessages);

  function parseBold(text: string) {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  function formatText(text: string) {
    return text.split("\n").map((line, index) => {
      if (line.trim().startsWith("*")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {parseBold(line.replace("*", "").trim())}
          </li>
        );
      }

      if (line.trim() === "") return <br key={index} />;

      return <p key={index}>{parseBold(line)}</p>;
    });
  }

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(STORAGE_KEY);
    if (!savedHistory) {
      setHasHydratedHistory(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed) && parsed.length) {
        setMessages(
          parsed.map(
            (message: KinnectAiMessage & Partial<StoredKinnectAiMessage>) => ({
              id:
                typeof message.id === "string" ? message.id : createMessageId(),
              role: message.role,
              content: message.content,
              failed: Boolean(message.failed),
              retrySourceMessage:
                typeof message.retrySourceMessage === "string"
                  ? message.retrySourceMessage
                  : undefined,
            }),
          ),
        );
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasHydratedHistory(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedHistory) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [hasHydratedHistory, messages]);

  const buildConversationPayload = (chatMessages: StoredKinnectAiMessage[]) =>
    chatMessages
      .filter((message) => !message.failed)
      .map<KinnectAiMessage>(({ role, content }) => ({ role, content }));

  const requestReply = async (
    baseMessages: StoredKinnectAiMessage[],
    prompt: string,
    failedMessageId?: string,
  ) => {
    const nextMessages: StoredKinnectAiMessage[] =
      failedMessageId && prompt
        ? baseMessages
        : [
            ...baseMessages,
            { id: createMessageId(), role: "user", content: prompt },
          ];

    if (!failedMessageId) {
      setMessages(nextMessages);
      setInput("");
    }

    setIsSending(true);
    if (failedMessageId) {
      setRetryingMessageId(failedMessageId);
    }

    try {
      const reply = await kinnectAiService.sendMessage(
        provider,
        buildConversationPayload(nextMessages),
      );
      setMessages((current) => {
        if (failedMessageId) {
          const failedIndex = current.findIndex(
            (message) => message.id === failedMessageId,
          );

          if (failedIndex === -1) {
            return [
              ...current,
              { id: createMessageId(), role: "assistant", content: reply },
            ];
          }

          const updated = [...current];
          updated.splice(failedIndex, 1, {
            id: createMessageId(),
            role: "assistant",
            content: reply,
          });
          return updated;
        }

        return [
          ...current,
          { id: createMessageId(), role: "assistant", content: reply },
        ];
      });
    } catch (error) {
      const message = toKinnectAiErrorMessage(provider, error);

      setMessages((current) => {
        if (failedMessageId) {
          return current.map((item) =>
            item.id === failedMessageId
              ? {
                  ...item,
                  content: message,
                  failed: true,
                }
              : item,
          );
        }

        return [
          ...current,
          {
            id: createMessageId(),
            role: "assistant",
            content: message,
            failed: true,
            retrySourceMessage: prompt,
          },
        ];
      });
    } finally {
      setIsSending(false);
      setRetryingMessageId(null);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    await requestReply(messages, trimmed);
  };

  const handleRetry = async (messageId: string) => {
    if (isSending) {
      return;
    }

    const failedMessageIndex = messages.findIndex(
      (message) => message.id === messageId,
    );
    if (failedMessageIndex === -1) {
      return;
    }

    const failedMessage = messages[failedMessageIndex];
    const retryPrompt = failedMessage.retrySourceMessage;
    if (!retryPrompt) {
      return;
    }

    const contextMessages = messages.slice(0, failedMessageIndex);
    await requestReply(contextMessages, retryPrompt, messageId);
  };

  return (
    <div className="flex min-h-[calc(100dvh-60px)] flex-col overflow-hidden rounded-t-[24px] border border-[#E6DDF0] bg-white shadow-[0_20px_60px_rgba(43,16,77,0.08)]">
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#FCFAFE] px-4 py-4">
        {messages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          const isRetrying = retryingMessageId === message.id;

          return (
            <div
              key={message.id || `${message.role}-${index}`}
              className={`w-fit max-w-[75%]  ${isAssistant ? "" : "ml-auto"}`}
            >
              <div
                className={`rounded-md px-4 py-2 text-sm leading-6 ${
                  isAssistant
                    ? message.failed
                      ? "border border-[#F1C8D3] bg-[#FFF7FA] text-[#7A2340] shadow-sm"
                      : "bg-[#F5F5F5] text-[#1C1C1C]  "
                    : "bg-[#55288D] text-white"
                }`}
              >
                {formatText(message.content)}
              </div>

              {message.failed && message.retrySourceMessage ? (
                <button
                  type="button"
                  onClick={() => void handleRetry(message.id)}
                  disabled={isRetrying || isSending}
                  className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#E6D3F3] bg-white px-3 py-1 text-xs font-medium text-[#55288D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCcw
                    size={12}
                    className={isRetrying ? "animate-spin" : ""}
                  />
                  {isRetrying ? "Retrying..." : "Retry"}
                </button>
              ) : null}
            </div>
          );
        })}

        {isSending ? <TypingIndicator /> : null}
      </div>

      <div className="border-t border-[#EFE8F5] bg-white p-3">
        <div className="flex items-end gap-2 rounded-[20px] border border-[#DED2EB] px-3 py-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            rows={1}
            placeholder="Ask Kiki anything..."
            className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent text-sm text-[#1C1C1C] outline-none placeholder:text-[#8C8298]"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#55288D] text-white disabled:cursor-not-allowed disabled:bg-[#CDBFDD]"
            aria-label="Send message"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
