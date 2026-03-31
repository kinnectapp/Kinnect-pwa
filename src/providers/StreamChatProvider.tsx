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
import type { User } from "@/lib/types/auth";
import { Chat } from "stream-chat-react";
import type { StreamChat } from "stream-chat";

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

export const StreamChatProvider: React.FC<Props> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const setUnreadCount = useChatStore((state) => state.setUnreadCount);
  const prevUserIdRef = useRef<string | number | null | undefined>(user?.id);
  const [client, setClient] = useState<StreamChat | null>(null);

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

        if (isMounted) {
          setClient(streamClient);
        }

        const unread = await streamClient.getUnreadCount();
        if (isMounted) {
          setUnreadCount(unread.total_unread_count || 0);
        }

        unsubscribe = streamClient.on((event) => {
          if (!isMounted) return;
          if (event.total_unread_count !== undefined) {
            setUnreadCount(event.total_unread_count || 0);
          }

          if (event.type === "message.new" && event.channel_id) {
            const sameChannel =
              useChatStore.getState().activeChannelId === event.channel_id;
            if (sameChannel) return;

            if (document.visibilityState !== "visible") {
              const senderName =
                event.user?.name || event.user?.id || "New message";
              const content = event.message?.text || "You have a new message.";
              void showNotification(senderName, content, event.channel_id);
            }
          }
        }).unsubscribe;
      } catch (error) {
        console.error("Failed to initialize Stream chat", error);
      }
    };

    if (user?.id) {
      void bootstrap();
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      // Don't disconnect here - let logout handler do it
    };
  }, [setUnreadCount, user?.id]);

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

  return <>{children}</>;
};
