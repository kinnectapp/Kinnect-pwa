"use client";

import React, { useState } from "react";
import ChatPage from "./ChatPage";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  isOnline?: boolean;
}

const MessagesList: React.FC = () => {
  const navigate = useNavigate();

  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Kiki",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      lastMessage: "Need help! Let's chat",
      timestamp: "5 mins ago",
      unread: true,
    },
    {
      id: "2",
      name: "Relationship Advice",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      lastMessage: "Thanks, Don't msg me 😂",
      timestamp: "5 mins ago",
    },
    {
      id: "3",
      name: "Personal Development",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      lastMessage: "Thanks, I'm fine 👍",
      timestamp: "5 mins ago",
    },
    {
      id: "4",
      name: "For Her",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      lastMessage: "Okay, See you then! 🎉",
      timestamp: "11:45 AM",
    },
    {
      id: "5",
      name: "For Him",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      lastMessage: "Great, looking forward!",
      timestamp: "10:20 AM",
    },
    {
      id: "6",
      name: "Darlene Robertson",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      lastMessage: "Take care! 😊",
      timestamp: "Yesterday",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Online Section */}
      <div className="  p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Online</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          ].map((avatar, idx) => (
            <div key={idx} className="flex-shrink-0 relative">
              <img
                src={avatar || "/placeholder.svg"}
                alt={`User ${idx + 1}`}
                className="w-[56px] h-[56px] rounded-full object-cover border-2 border-green-500"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 p-4 pt-4 sticky top-0 ">
          All Messages
        </h3>

        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => navigate(`/app/chat/${conversation.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 text-left"
          >
            <div className="relative flex-shrink-0">
              <img
                src={conversation.avatar || "/placeholder.svg"}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.name}
                </h3>
                {conversation.unread && (
                  <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conversation.lastMessage}
              </p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
              {conversation.timestamp}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessagesList;
