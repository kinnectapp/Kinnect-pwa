import React from "react";
 import { Check, CheckCheck } from "lucide-react";
import { Message } from "@/lib/types/chat";

interface TextMessageProps {
  message: Message;
}

const TextMessage: React.FC<TextMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const timeString = message.timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl ${
          isUser
            ? "bg-purple-500 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
      </div>
      <div
        className={`flex flex-col justify-end text-xs text-gray-400 gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span>{timeString}</span>
        {isUser && (
          <>
            {message.status === "read" ? (
              <CheckCheck className="w-3 h-3 text-blue-500" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TextMessage;
