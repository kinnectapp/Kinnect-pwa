import TestChatPage from "@/components/chat/TestChatPage";
import React from "react";
import { useParams } from "react-router-dom";

const ChatidPage: React.FC = () => {
  const { channelId = "" } = useParams();

  // return <ChatPage channelId={channelId} />;
   return <TestChatPage channelId={channelId} />;
};

export default ChatidPage;
