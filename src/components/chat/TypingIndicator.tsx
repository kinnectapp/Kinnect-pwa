import React from "react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
      <span className="text-xs text-gray-500 mr-1">Admin is typing</span>
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
};

export default TypingIndicator;
