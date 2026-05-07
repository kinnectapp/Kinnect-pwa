import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Logo } from "../layout/logo";

const STORAGE_KEY = "kinnect-ai-chat-history";

type StoredKinnectAiMessage = {
  role: "user" | "assistant";
  content: string;
  failed?: boolean;
};

const truncate = (value: string, maxLength = 48) => {
  if (!value.trim()) {
    return "";
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength).trim()}...`
    : value;
};

const getPreviewText = (messages: StoredKinnectAiMessage[]) => {
  const meaningfulMessages = messages.filter(
    (message) =>
      message.content &&
      message.content !==
        "Hi, I am Kinnect AI. Ask me for dating advice, message ideas, profile help, or community guidance.",
  );

  const lastMessage = meaningfulMessages[meaningfulMessages.length - 1];
  if (!lastMessage) {
    return "Ask Kiki for dating advice, message ideas, or profile help.";
  }

  if (lastMessage.failed) {
    return truncate(`Failed: ${lastMessage.content}`);
  }

  return truncate(lastMessage.content);
};

const KinnectChatBtn: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const [previewText, setPreviewText] = useState(
    "Ask Kiki for dating advice, message ideas, or profile help.",
  );

  useEffect(() => {
    if (!userId) return;
    const userKey = String(userId);

    try {
      const savedHistory = window.localStorage.getItem(STORAGE_KEY);
      if (!savedHistory) return;

      const parsed = JSON.parse(savedHistory);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;

      const userHistory = (parsed as Record<string, StoredKinnectAiMessage[]>)[userKey];
      if (!Array.isArray(userHistory)) return;

      setPreviewText(getPreviewText(userHistory));
    } catch {
      // Ignore malformed local history and keep the default preview.
    }
  }, [userId]);

  return (
    <button
      type="button"
      onClick={() => navigate("/app/kinnect-ai")}
      className="mx-3 flex w-[calc(100%-24px)] items-center gap-4 border-b px-1 py-3 text-left transition-colors hover:bg-[#FAF8FB]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7DFF0] bg-white">
        <Logo />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-[#1C1C1C]">Kiki</div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF1FE] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8F2BB3]">
            <Bot size={10} />
            AI
          </span>
        </div>

        <div className="truncate text-sm text-[#77707F]">{previewText}</div>
      </div>
    </button>
  );
};

export default KinnectChatBtn;
