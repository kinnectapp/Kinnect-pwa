import React, { useEffect, useMemo, useState } from "react";
import { Bot, Loader2, MessageCircle, SendHorizontal, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  kinnectAiService,
  KinnectAiMessage,
  KinnectAiProvider,
} from "@/services/kinnect-ai.service";

type KinnectAiWidgetProps = {
  provider?: KinnectAiProvider;
  visibleRoutes?: string[];
};

const STORAGE_KEY = "kinnect-ai-chat-history";

const starterMessages: KinnectAiMessage[] = [
  {
    role: "assistant",
    content:
      "Hi, I am Kinnect AI. Ask me for dating advice, message ideas, profile help, or community guidance.",
  },
];

const routeMatches = (pathname: string, visibleRoutes: string[]) =>
  visibleRoutes.some((route) =>
    route === "/app" ? pathname === route : pathname.startsWith(route),
  );

export const KinnectAiWidget: React.FC<KinnectAiWidgetProps> = ({
  provider = "openai",
  visibleRoutes = ["/app", "/app/community", "/app/chats"],
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<KinnectAiMessage[]>(starterMessages);

  const isVisible = useMemo(
    () => routeMatches(location.pathname, visibleRoutes),
    [location.pathname, visibleRoutes],
  );

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(STORAGE_KEY);
    if (!savedHistory) {
      return;
    }

    try {
      const parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed) && parsed.length) {
        setMessages(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  if (!isVisible) {
    return null;
  }

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const nextMessages: KinnectAiMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const reply = await kinnectAiService.sendMessage(provider, nextMessages);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kinnect AI could not respond right now.";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: message },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 right-4 z-[1000] flex h-[70vh] max-h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-[24px] border border-[#E6DDF0] bg-white shadow-[0_20px_60px_rgba(43,16,77,0.18)]">
          <div className="flex items-start justify-between bg-gradient-to-r from-[#55288D] via-[#7A1FA2] to-[#C2188B] px-4 py-4 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                Kinnect AI
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Your relationship copilot
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
              aria-label="Close Kinnect AI"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#FCFAFE] px-4 py-4">
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    isAssistant
                      ? "bg-white text-[#332143] shadow-sm"
                      : "ml-auto bg-[#55288D] text-white"
                  }`}
                >
                  {message.content}
                </div>
              );
            })}

            {isSending ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-[#5E4C72] shadow-sm">
                <Loader2 size={16} className="animate-spin" />
                Thinking...
              </div>
            ) : null}
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
                placeholder="Ask Kinnect AI anything..."
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
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-24 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#55288D] to-[#C2188B] text-white shadow-[0_14px_30px_rgba(85,40,141,0.35)]"
        aria-label="Open Kinnect AI"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {!isOpen ? (
        <div className="fixed bottom-40 right-4 z-[999] rounded-full border border-[#EADCF5] bg-white px-3 py-2 text-xs font-medium text-[#5B2C8C] shadow-sm">
          <span className="inline-flex items-center gap-2">
            <Bot size={14} />
            Chat with Kinnect AI
          </span>
        </div>
      ) : null}
    </>
  );
};
