import { useEffect } from "react";
import type { Channel } from "stream-chat";
import { useChatStore } from "@/store/chat.store";

/**
 * Hook to manage typing indicators in a channel
 * Listens for typing.start and typing.stop events from Stream Chat
 * Note: This must be called AFTER the channel is loaded
 */
export const useTypingIndicators = (channel: Channel | null, channelId: string) => {
  const setTypingUsers = useChatStore((state) => state.setTypingUsers);

  useEffect(() => {
    if (!channel) return;

    const unsubscribers: Array<() => void> = [];

    try {
      const onTypingStart = channel.on("typing.start", (event: any) => {
        const userId = event.user?.id;
        if (!userId) return;
        const currentTyping = useChatStore.getState().typingUsers[channelId] || [];
        if (!currentTyping.includes(userId)) {
          setTypingUsers(channelId, [...currentTyping, userId]);
        }
      });

      const onTypingStop = channel.on("typing.stop", (event: any) => {
        const userId = event.user?.id;
        if (!userId) return;
        const currentTyping = useChatStore.getState().typingUsers[channelId] || [];
        setTypingUsers(channelId, currentTyping.filter((id: string) => id !== userId));
      });

      unsubscribers.push(onTypingStart.unsubscribe, onTypingStop.unsubscribe);
    } catch (error) {
      console.warn("Failed to setup typing indicators:", error);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      setTypingUsers(channelId, []);
    };
  }, [channel, channelId, setTypingUsers]);
};
