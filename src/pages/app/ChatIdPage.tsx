import ChatPage from "@/components/chat/ChatPage";
import React from "react";
import { useParams } from "react-router-dom";

const ChatidPage: React.FC = () => {
  const { channelId = "" } = useParams();

  return <ChatPage channelId={channelId} />;
};

export default ChatidPage;
