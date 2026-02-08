"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageList from "./MessageList";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { Message } from "@/lib/types/chat";
import QuickReplies from "./QuickReplies";

interface ChatPageProps {
  conversationId?: string;
  onBack?: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "other",
      type: "text",
      content: "Morning! How are you today?",
      timestamp: new Date(Date.now() - 7200000),
      status: "read",
    },
    {
      id: "2",
      sender: "user",
      type: "text",
      content:
        "I'm fine, just getting your message, was quite busy yesterday. How are you?",
      timestamp: new Date(Date.now() - 6900000),
      status: "read",
    },
    {
      id: "3",
      sender: "other",
      type: "audio",
      duration: 3,
      waveform: Array(20)
        .fill(0)
        .map(() => Math.random() * 80 + 20),
      timestamp: new Date(Date.now() - 6000000),
      status: "read",
    },
    {
      id: "4",
      sender: "user",
      type: "audio",
      duration: 4,
      waveform: Array(20)
        .fill(0)
        .map(() => Math.random() * 80 + 20),
      timestamp: new Date(Date.now() - 5400000),
      status: "read",
    },
    {
      id: "5",
      sender: "other",
      type: "audio",
      duration: 2,
      waveform: Array(20)
        .fill(0)
        .map(() => Math.random() * 80 + 20),
      timestamp: new Date(Date.now() - 4800000),
      status: "read",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (
    content: string,
    type: "text" | "audio" = "text",
  ) => {
    const newMessage: Message = {
      id: String(messages.length + 1),
      sender: "user",
      type,
      content: type === "text" ? content : undefined,
      duration:
        type === "audio" ? Math.floor(Math.random() * 5) + 2 : undefined,
      waveform:
        type === "audio"
          ? Array(20)
              .fill(0)
              .map(() => Math.random() * 80 + 20)
          : undefined,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages([...messages, newMessage]);

    // Simulate other person typing and responding
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That sounds great! Thanks for your message.",
        "I completely agree with you!",
        "That's awesome, let me know more!",
        "Absolutely! When do you want to meet?",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: Message = {
        id: String(messages.length + 2),
        sender: "other",
        type: Math.random() > 0.5 ? "text" : "audio",
        content: Math.random() > 0.5 ? randomResponse : undefined,
        duration:
          Math.random() > 0.5 ? undefined : Math.floor(Math.random() * 5) + 2,
        waveform:
          Math.random() > 0.5
            ? undefined
            : Array(20)
                .fill(0)
                .map(() => Math.random() * 80 + 20),
        timestamp: new Date(),
        status: "read",
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 2000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply, "text");
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      <ChatHeader
        userName="Theressa Webb"
        userAge={24}
        lastSeen="Wed June 22, 2024"
        avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
      />
      <div className="flex-1 mt-16 mb-[200px] overflow-y-auto">
        <MessageList messages={messages} isTyping={isTyping} />
        <div ref={messagesEndRef} />
      </div>
      <div className="  fixed w-full bottom-0  ">
        <QuickReplies onReplyClick={handleQuickReply} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
