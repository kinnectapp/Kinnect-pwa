import React, { useMemo } from "react";

interface TypingIndicatorProps {
  typingUsernames?: string[];
  isSimple?: boolean; // Simple mode shows just dots
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsernames = [],
  isSimple = false,
}) => {
  const displayText = useMemo(() => {
    if (!typingUsernames || typingUsernames.length === 0) {
      return "Someone is typing";
    }
    if (typingUsernames.length === 1) {
      return `${typingUsernames[0]} is typing`;
    }
    if (typingUsernames.length === 2) {
      return `${typingUsernames[0]} and ${typingUsernames[1]} are typing`;
    }
    return `${typingUsernames.length} people are typing`;
  }, [typingUsernames]);

  if (isSimple) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
      <span className="text-xs text-gray-600 font-medium">{displayText}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;
