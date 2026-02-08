'use client';

import React, { useState, useEffect } from "react";
 import { Play, Pause } from "lucide-react";
 import { Message } from "@/lib/types/chat";
import AudioWaveform from "../AudioWaveform";

interface AudioMessageProps {
  message: Message;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
}

const AudioMessage: React.FC<AudioMessageProps> = ({
  message,
  isPlaying = false,
  onPlayToggle = () => {},
}) => {
  const isUser = message.sender === "user";
  const timeString = message.timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-purple-500 rounded-br-none"
            : "bg-purple-100 rounded-bl-none"
        }`}
      >
        <button
          onClick={onPlayToggle}
          className={`flex-shrink-0 p-2 rounded-full transition-colors ${
            isUser
              ? "bg-white/20 hover:bg-white/30 text-white"
              : "bg-purple-200 hover:bg-purple-300 text-purple-600"
          }`}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <AudioWaveform
          waveform={message.waveform || []}
          isPlaying={isPlaying}
          duration={message.duration || 0}
          isDark={isUser}
        />
      </div>
      <div
        className={`flex flex-col justify-end text-xs text-gray-400 gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span>{timeString}</span>
      </div>
    </div>
  );
};

export default AudioMessage;
