import { useEffect } from "react";
import { useChatStore } from "@/store/chat.store";

/**
 * Hook to manage unread message counts
 * Updates the global unread count based on all channels
 */
export const useUnreadBadgeCount = () => {
  const personalChannels = useChatStore((state) => state.personalChannels);
  const communityChannels = useChatStore((state) => state.communityChannels);
  const setUnreadCount = useChatStore((state) => state.setUnreadCount);

  useEffect(() => {
    const totalUnread =
      personalChannels.reduce((sum, channel) => sum + channel.unreadCount, 0) +
      communityChannels.reduce((sum, channel) => sum + channel.unreadCount, 0);

    setUnreadCount(totalUnread);
  }, [personalChannels, communityChannels, setUnreadCount]);
};

/**
 * Mark a specific channel as read
 */
export const markChannelAsRead = (channelId: string) => {
  useChatStore.getState().markChannelAsRead(channelId);
};
