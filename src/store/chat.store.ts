import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MessageStatus } from "@/lib/utils/message-status";

export interface CachedChannelPreview {
  id: string;
  cid: string;
  name: string;
  image?: string;
  lastMessageText: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface CachedChatMessage {
  id: string;
  userId: string;
  text: string;
  createdAt?: string;
  status?: MessageStatus;
  isRead?: boolean;
}

interface ChatStore {
  unreadCount: number;
  activeChannelId: string | null;
  personalChannels: CachedChannelPreview[];
  communityChannels: CachedChannelPreview[];
  channelMessages: Record<string, CachedChatMessage[]>;
  typingUsers: Record<string, string[]>; // channelId -> [userId, userId]
  messageStatuses: Record<string, MessageStatus>; // messageId -> status
  setUnreadCount: (count: number) => void;
  setActiveChannelId: (channelId: string | null) => void;
  setPersonalChannels: (channels: CachedChannelPreview[]) => void;
  setCommunityChannels: (channels: CachedChannelPreview[]) => void;
  setChannelMessages: (
    channelId: string,
    messages: CachedChatMessage[],
  ) => void;
  setTypingUsers: (channelId: string, userIds: string[]) => void;
  setMessageStatus: (messageId: string, status: MessageStatus) => void;
  markChannelAsRead: (channelId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      unreadCount: 0,
      activeChannelId: null,
      personalChannels: [],
      communityChannels: [],
      channelMessages: {},
      typingUsers: {},
      messageStatuses: {},
      setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
      setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
      setPersonalChannels: (channels) => set({ personalChannels: channels }),
      setCommunityChannels: (channels) => set({ communityChannels: channels }),
      setChannelMessages: (channelId, messages) =>
        set((state) => ({
          channelMessages: {
            ...state.channelMessages,
            [channelId]: messages,
          },
        })),
      setTypingUsers: (channelId, userIds) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [channelId]: userIds,
          },
        })),
      setMessageStatus: (messageId, status) =>
        set((state) => ({
          messageStatuses: {
            ...state.messageStatuses,
            [messageId]: status,
          },
        })),
      markChannelAsRead: (channelId) =>
        set((state) => {
          const messages = state.channelMessages[channelId] || [];
          return {
            channelMessages: {
              ...state.channelMessages,
              [channelId]: messages.map((msg) => ({ ...msg, isRead: true })),
            },
          };
        }),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        unreadCount: state.unreadCount,
        personalChannels: state.personalChannels,
        communityChannels: state.communityChannels,
        channelMessages: state.channelMessages,
      }),
    },
  ),
);
