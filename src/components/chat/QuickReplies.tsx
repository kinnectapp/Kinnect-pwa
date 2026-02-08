'use client';

import React from "react";

interface QuickRepliesProps {
  onReplyClick?: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({
  onReplyClick = () => {},
}) => {
  const replies = [
    "During good?",
    "Good day",
    "Would love to brunch!",
  ];

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex gap-2 flex-wrap">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onReplyClick(reply)}
            className="text-xs font-medium px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
