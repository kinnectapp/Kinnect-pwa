'use client';

import React, { useState } from "react";
import { Message as MessageType } from "@/lib/types/chat";
 import TextMessage from "./messagges/TextMessage";
import AudioMessage from "./messagges/AudioMessage";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const handlePlayAudio = (messageId: string) => {
    setPlayingMessageId(playingMessageId === messageId ? null : messageId);
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Time separator */}
      <div className="flex items-center justify-center py-2">
        <span className="text-xs text-gray-400 font-medium">Yesterday</span>
      </div>

      {/* Messages */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.type === "text" ? (
            <TextMessage message={message} />
          ) : (
            <AudioMessage
              message={message}
              isPlaying={playingMessageId === message.id}
              onPlayToggle={() => handlePlayAudio(message.id)}
            />
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 py-2">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
};

export default MessageList;
