'use client';

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";
import { audioService } from "@/services/audio.service";

interface AudioMessageProps {
  audioUrl: string;
  duration?: number;
  isUser?: boolean;
  timestamp?: string;
}

const AudioMessage: React.FC<AudioMessageProps> = ({
  audioUrl,
  duration = 0,
  isUser = false,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handlePlayToggle = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `audio-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeString = timestamp || new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${
          isUser
            ? "bg-[#55288D] text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        <button
          onClick={handlePlayToggle}
          className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
            isUser
              ? "hover:bg-white/20 active:bg-white/30"
              : "hover:bg-gray-200 active:bg-gray-300"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-1">
          <div className="w-24 h-1 bg-opacity-30 rounded-full" style={{ backgroundColor: isUser ? "white" : "currentColor" }}>
            <div
              className={isUser ? "h-full bg-white rounded-full" : "h-full bg-gray-600 rounded-full"}
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="text-xs whitespace-nowrap w-10 text-right">
            {audioService.formatDuration(duration)}
          </span>
        </div>

        <button
          onClick={handleDownload}
          className={`flex-shrink-0 p-1 rounded-full transition-colors ${
            isUser
              ? "hover:bg-white/20 active:bg-white/30"
              : "hover:bg-gray-200 active:bg-gray-300"
          }`}
          aria-label="Download audio"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>

      <div
        className={`flex flex-col justify-end text-xs text-gray-500 gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span>{timeString}</span>
      </div>
    </div>
  );
};

export default AudioMessage;
