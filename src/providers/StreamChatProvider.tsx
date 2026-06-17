import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import React, { useEffect, useRef, useState } from "react";
import { setUser } from "@/api/storage";
import {
  connectStreamUser,
  disconnectStreamUser,
  getStreamClient,
} from "@/services/stream-chat.service";
import { CHAT_MEDIA_UNLOCK_DAYS } from "@/hooks/usePersonalChatAccess";
import type { User } from "@/lib/types/auth";
import { Chat } from "stream-chat-react";
import type { Channel, StreamChat } from "stream-chat";

const CHAT_MEDIA_UNLOCK_MS = CHAT_MEDIA_UNLOCK_DAYS * 24 * 60 * 60 * 1000;

type Props = {
  children: React.ReactNode;
};

const showNotification = async (
  title: string,
  body: string,
  channelId: string,
) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      data: {
        channelId,
        targetUrl: `/app/chats/${encodeURIComponent(channelId)}`,
        type: "chat",
      },
      tag: `chat-${channelId}`,
    });
    return;
  }

  const notification = new Notification(title, { body });
  notification.onclick = () => {
    window.focus();
    window.location.href = `/app/chats/${encodeURIComponent(channelId)}`;
  };
};

const getChannelId = (channel: Channel) => channel.id || channel.cid.split(":")[1];

const toPersonalPreview = (channel: Channel, currentUserId: string) => {
  const members = Object.values(channel.state.members || {});
  const otherMember = members.find(
    (member) => member.user_id !== currentUserId,
  );
  const messages = channel.state.messages;
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  const spanMs =
    firstMessage && lastMessage
      ? Math.max(
          0,
          new Date(String(lastMessage.created_at)).getTime() -
            new Date(String(firstMessage.created_at)).getTime(),
        )
      : 0;

  return {
    id: getChannelId(channel),
    cid: channel.cid,
    name: otherMember?.user?.name || "Direct Message",
    image: otherMember?.user?.image || undefined,
    userId: otherMember?.user_id,
    lastMessageText: lastMessage?.text || "No messages yet",
    lastMessageAt: lastMessage?.created_at
      ? String(lastMessage.created_at)
      : undefined,
    unreadCount: channel.countUnread(),
    canShareMedia: spanMs >= CHAT_MEDIA_UNLOCK_MS,
  };
};

const toCommunityPreview = (channel: Channel) => {
  const channelData = (channel.data as Record<string, unknown>) || {};
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];

  return {
    id: getChannelId(channel),
    cid: channel.cid,
    name:
      typeof channelData.name === "string"
        ? channelData.name
        : "Community Channel",
    image:
      typeof channelData.image === "string"
        ? channelData.image
        : "/pwa-192x192.png",
    lastMessageText: lastMessage?.text || "No messages yet",
    lastMessageAt: lastMessage?.created_at
      ? String(lastMessage.created_at)
      : undefined,
    unreadCount: channel.countUnread(),
  };
};

export const StreamChatProvider: React.FC<Props> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const setUnreadCount = useChatStore((state) => state.setUnreadCount);
  const setPersonalChannels = useChatStore((state) => state.setPersonalChannels);
  const setCommunityChannels = useChatStore(
    (state) => state.setCommunityChannels,
  );
  const prevUserIdRef = useRef<string | number | null | undefined>(user?.id);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Bootstrap and connect on mount
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const bootstrap = async () => {
      if (!user) return;
      try {
        const profileResponse = await chatService.getProfile();
        const profileUser =
          profileResponse?.data?.resp ?? profileResponse?.data?.data;
        if (profileUser && typeof profileUser === "object") {
          await setUser(profileUser as Record<string, unknown>);
          if (isMounted) {
            await connectStreamUser(profileUser as User);
          }
        } else {
          await connectStreamUser(user);
        }

        const streamClient = getStreamClient();
        const currentUserId = String(user.id);

        const refreshUnreadState = async () => {
          const [unread, personalChannels, communityChannels] =
            await Promise.all([
              streamClient.getUnreadCount(),
              streamClient.queryChannels(
                { type: "messaging", members: { $in: [currentUserId] } },
                { last_message_at: -1 },
                { state: true, watch: true, limit: 30, message_limit: 30 },
              ),
              streamClient.queryChannels(
                { type: "groupmessaging", members: { $in: [currentUserId] } },
                { last_message_at: -1 },
                { state: true, watch: true, limit: 30, message_limit: 30 },
              ),
            ]);

          if (!isMounted) return;

          setUnreadCount(unread.total_unread_count || 0);
          setPersonalChannels(
            personalChannels.map((channel) =>
              toPersonalPreview(channel, currentUserId),
            ),
          );
          setCommunityChannels(communityChannels.map(toCommunityPreview));
        };

        if (isMounted) {
          setClient(streamClient);
        }

        await refreshUnreadState();

        unsubscribe = streamClient.on((event) => {
          if (!isMounted) return;
          if (event.total_unread_count !== undefined) {
            setUnreadCount(event.total_unread_count || 0);
          }

          if (
            event.type === "message.new" ||
            event.type === "notification.message_new" ||
            event.type === "notification.added_to_channel" ||
            event.type === "notification.mark_read"
          ) {
            void refreshUnreadState();
          }

          if (event.type === "message.new" && event.channel_id) {
            const eventCid =
              event.cid ||
              `${event.channel_type || "messaging"}:${event.channel_id}`;
            const sameChannel =
              useChatStore.getState().activeChannelId === eventCid;
            if (sameChannel) return;

            if (document.visibilityState !== "visible") {
              const senderName =
                event.user?.name || event.user?.id || "New message";
              const content = event.message?.text || "You have a new message.";
              void showNotification(senderName, content, eventCid);
            }
          }
        }).unsubscribe;
      } catch (error) {
        console.error("Failed to initialize Stream chat", error);
        if (isMounted) {
          setConnectError("Chat is unavailable. Please refresh to try again.");
        }
      }
    };

    if (user?.id) {
      setConnectError(null);
      void bootstrap();
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      // Don't disconnect here - let logout handler do it
    };
  }, [setCommunityChannels, setPersonalChannels, setUnreadCount, user?.id]);

  // Handle logout - detect transition from logged in to logged out
  useEffect(() => {
    if (prevUserIdRef.current && !user?.id) {
      // User was logged in and now is logged out
      console.log("User logged out, disconnecting Stream...");
      setClient(null);
      void disconnectStreamUser();
    }
    prevUserIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  // Wrap with Stream's <Chat> when client is ready
  if (client) {
    return <Chat client={client}>{children}</Chat>;
  }

  if (connectError) {
    return (
      <>
        {children}
        <div className="fixed bottom-20 left-0 right-0 mx-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 shadow-sm">
          {connectError}
        </div>
      </>
    );
  }

  return <>{children}</>;
};
