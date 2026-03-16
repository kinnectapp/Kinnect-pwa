import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import React, { useEffect, useRef } from "react";
import { setUser } from "@/api/storage";
import {
  connectStreamUser,
  disconnectStreamUser,
  getStreamClient,
} from "@/services/stream-chat.service";
import type { User } from "@/lib/types/auth";

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
      data: { channelId },
      tag: `chat-${channelId}`,
    });
    return;
  }

  new Notification(title, { body });
};

export const StreamChatProvider: React.FC<Props> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const setUnreadCount = useChatStore((state) => state.setUnreadCount);
  const prevUserIdRef = useRef<string | null | undefined>(user?.id);

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

        const client = getStreamClient();
        const unread = await client.getUnreadCount();
        if (isMounted) {
          setUnreadCount(unread.total_unread_count || 0);
        }

        unsubscribe = client.on((event) => {
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

  return <>{children}</>;
};
