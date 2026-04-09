'use client';

import React, { useState, useEffect } from "react";

interface AudioWaveformProps {
  waveform: number[];
  isPlaying?: boolean;
  duration?: number;
  isDark?: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  waveform,
  isPlaying = false,
  duration = 0,
  isDark = false,
}) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 0.1;
        if (newTime >= duration) {
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentTime(0);
    }
  }, [isPlaying]);

  const barColor = isDark ? "#ffffff" : "#8b5cf6";
  const unplayedColor = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(139, 92, 246, 0.2)";
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 flex-1">
      <svg
        className="w-20 h-5"
        viewBox="0 0 80 32"
        preserveAspectRatio="none"
      >
        {waveform.map((height, index) => {
          const x = (index / waveform.length) * 80;
          const barProgress = progress > (index / waveform.length) * 100;
          const color = barProgress ? barColor : unplayedColor;

          return (
            <rect
              key={index}
              x={x}
              y={16 - height / 2}
              width={60 / waveform.length - 1}
              height={height}
              fill={color}
              rx="1"
            />
          );
        })}
      </svg>
      <span className={`text-xs font-medium ${isDark ? "text-white" : "text-[#55288D]"}`}>
        {Math.floor(duration)}s
      </span>
    </div>
  );
};

export default AudioWaveform;
