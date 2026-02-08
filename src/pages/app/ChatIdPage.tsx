import ChatPage from "@/components/chat/ChatPage";
import React from "react";
 import { useNavigate } from "react-router-dom";

const ChatidPage: React.FC = () => {
    const navigate = useNavigate();
    const id = "123"; // This would come from route params in a real app
  return (
    <ChatPage
      conversationId={id}
      onBack={() => navigate(-1)}
    />
  );
};

export default ChatidPage;
