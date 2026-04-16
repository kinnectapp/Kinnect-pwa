"use client";

import React, { useState } from "react";
import CommunityView from "./CommunityView";
import MessagesList from "./MessagesList";
import { useChatStore } from "@/store/chat.store";
import { useUnreadBadgeCount } from "@/hooks/useUnreadBadge";

type Tab = "messages" | "community";

const ChatContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("messages");
  const unreadCount = useChatStore((state) => state.unreadCount);

  // Setup unread badge count management
  useUnreadBadgeCount();

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      {/* Tab Navigation */}
      <div className="bg-white ">
        <div className="flex p-1.5 p m-3 rounded-[4px] bg-[#e6e3ea]   fixed top-[56px] left-0 right-0   z-10">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-2 px-4 text-center rounded-[4px] text-[14px] transition-colors ${
              activeTab === "messages"
                ? "text-white bg-[#55288D]"
                : "text-[#1C1C1C] hover:text-gray-700"
            }`}
          >
            Messages {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`flex-1 py-2 px-4 text-center rounded-[4px] text-[14px] transition-colors ${
              activeTab === "community"
                ? "text-white bg-[#55288D]"
                : "text-[#1C1C1C] hover:text-gray-700"
            }`}
          >
            Community
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 mt-16 overflow-hidden">
        {activeTab === "messages" && <MessagesList />}
        {activeTab === "community" && <CommunityView />}
      </div>
    </div>
  );
};

export default ChatContainer;
