"use client";

import React from "react";
import { useSearchParams } from "react-router-dom";
import CommunityView from "./CommunityView";
import MessagesList from "./MessagesList";
import { useChatStore } from "@/store/chat.store";

const ChatContainer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "community" ? "community" : "messages";

  const personalChannels = useChatStore((state) => state.personalChannels);
  const communityChannels = useChatStore((state) => state.communityChannels);

  const personalUnread = personalChannels.reduce((sum, ch) => sum + ch.unreadCount, 0);
  const communityUnread = communityChannels.reduce((sum, ch) => sum + ch.unreadCount, 0);

  const switchTab = (tab: "messages" | "community") => {
    if (tab === "messages") {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams({ tab }, { replace: false });
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* Tab Navigation */}
      <div className="bg-white mt-6 ">
        <div className=" mx-3 flex rounded-[4px] bg-[#e6e3ea] p-1.5  ">
          <button
            onClick={() => switchTab("messages")}
            className={`flex-1 py-2 px-4 text-center rounded-[4px] text-[14px] transition-colors ${
              activeTab === "messages"
                ? "text-white bg-[#55288D]"
                : "text-[#1C1C1C] hover:text-gray-700"
            }`}
          >
            Messages {personalUnread > 0 ? `(${personalUnread})` : ""}
          </button>
          <button
            onClick={() => switchTab("community")}
            className={`flex-1 py-2 px-4 text-center rounded-[4px] text-[14px] transition-colors ${
              activeTab === "community"
                ? "text-white bg-[#55288D]"
                : "text-[#1C1C1C] hover:text-gray-700"
            }`}
          >
            Community {communityUnread > 0 ? `(${communityUnread})` : ""}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6 flex-1  overflow-hidden">
        {activeTab === "messages" && <MessagesList />}
        {activeTab === "community" && <CommunityView />}
      </div>
    </div>
  );
};

export default ChatContainer;
