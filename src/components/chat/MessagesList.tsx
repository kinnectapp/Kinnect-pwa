import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { Channel } from "stream-chat";
import { toast } from "sonner";

import { handleApiError } from "@/api/serviceUtils";
import { ensureStreamConnected } from "@/services/stream-chat.service";
import { CachedChannelPreview, useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";

const formatDate = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const toPreview = (
  channel: Channel,
  currentUserId: string,
): CachedChannelPreview => {
  const resolvedChannelId = channel.id || channel.cid.split(":")[1];
  const members = Object.values(channel.state.members || {});
  const otherMember = members.find(
    (member) => member.user_id !== currentUserId,
  );
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];

  return {
    id: resolvedChannelId,
    cid: channel.cid,
    name: otherMember?.user?.name || "Direct Message",
    image: otherMember?.user?.image || "/pwa-192x192.png",
    lastMessageText: lastMessage?.text || "No messages yet",
    lastMessageAt: lastMessage?.created_at
      ? String(lastMessage.created_at)
      : undefined,
    unreadCount: channel.countUnread(),
  };
};

const MessagesList: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cachedChannels = useChatStore((state) => state.personalChannels);
  const setPersonalChannels = useChatStore(
    (state) => state.setPersonalChannels,
  );

  const [channels, setChannels] = useState<Channel[]>([]);
  // const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadChannels = async () => {
    if (!user?.id) return;

    // setIsRefreshing(true);
    setHasError(false);

    try {
      const client = await ensureStreamConnected(user);
      const userId = String(user.id);
      const queried = await client.queryChannels(
        { type: "messaging", members: { $in: [userId] } },
        { last_message_at: -1 },
        { state: true, watch: true, limit: 30, message_limit: 30 },
      );

      setChannels(queried);
      setPersonalChannels(queried.map((channel) => toPreview(channel, userId)));
      setHasLoadedOnce(true);
      setHasError(false);
      setErrorMessage("");
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    } finally {
      // setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const setupChannelListener = async () => {
      if (!user?.id) {
        setChannels([]);
        setHasLoadedOnce(true);
        return;
      }

      try {
        await loadChannels();

        const client = await ensureStreamConnected(user);
        const subscription = client.on((event) => {
          if (
            event.type === "message.new" ||
            event.type === "notification.message_new" ||
            event.type === "notification.added_to_channel"
          ) {
            if (isMounted) {
              void loadChannels();
            }
          }
        });

        unsubscribe = () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.warn("Failed to setup listener:", error);
      }
    };

    void setupChannelListener();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [user?.id]);

  const shouldShowSkeleton =
    !hasLoadedOnce && channels.length === 0 && cachedChannels.length === 0;

  if (shouldShowSkeleton) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-md bg-[#F3F3F6]"
          />
        ))}
      </div>
    );
  }

  // Extract online users from loaded channels
  const onlineUsers = React.useMemo(() => {
    if (!user?.id) return [];
    
    const uniqueUsers = new Map<string, any>();
    
    channels.forEach(channel => {
      const members = Object.values(channel.state.members || {});
      const otherMember = members.find(m => m.user_id !== String(user.id));
      
      // If the partner is marked as online
      if (otherMember?.user?.online) {
        uniqueUsers.set(otherMember.user.id, {
          ...otherMember.user,
          cid: channel.cid
        });
      }
    });
    
    return Array.from(uniqueUsers.values());
  }, [channels, user?.id]);

  const list: CachedChannelPreview[] =
    channels.length > 0 && user?.id
      ? channels.map((channel) => toPreview(channel, String(user.id)))
      : cachedChannels;

  if (!list.length && !hasError) {
    return <p className="p-4 text-sm text-[#77707F]">No personal chats yet.</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {hasError && (
        <div className="m-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-red-700">{errorMessage}</p>
            <button
              onClick={() => void loadChannels()}
              className="mt-1 flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* {isRefreshing && cachedChannels.length > 0 && (
        <p className="px-4 py-2 text-xs text-[#77707F]">Refreshing chats...</p>
      )} */}

      {/* Online Users Horizontal List */}
      {onlineUsers.length > 0 && !hasError && (
        <div className="flex gap-4 overflow-x-auto px-4 py-4 border-b border-gray-100 [&::-webkit-scrollbar]:hidden">
          {onlineUsers.map(u => (
            <button 
              key={u.id} 
              onClick={() => navigate(`/app/chats/${encodeURIComponent(u.cid)}`)}
              className="flex flex-col items-center gap-1 w-[56px] shrink-0 transition-opacity hover:opacity-80"
            >
              <div className="relative">
                <img 
                  src={u.image || '/pwa-192x192.png'} 
                  alt={u.name || 'User'} 
                  className="w-14 h-14 rounded-full object-cover border-[2.5px] border-[#55288D] p-[1.5px]" 
                />
                <span className="absolute bottom-[2px] right-[2px] w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <span className="text-[11px] text-center truncate w-full text-gray-700 font-medium">
                {u.name?.split(' ')[0] || 'User'}
              </span>
            </button>
          ))}
        </div>
      )}

      {list.length === 0 && hasError ? (
        <p className="p-4 text-sm text-[#77707F]">
          Unable to load chats. Try refreshing.
        </p>
      ) : (
        list.map((item) => (
          <button
            key={item.cid}
            onClick={() => navigate(`/app/chats/${encodeURIComponent(item.cid)}`)}
            className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-100"
          >
            <img
              src={item.image || "/pwa-192x192.png"}
              alt={item.name || "User"}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-gray-900">
                {item.name || "Direct Message"}
              </h3>
              <p className="truncate text-sm text-gray-500">
                {item.lastMessageText || "No messages yet"}
              </p>
            </div>
            <div className="text-right">
              <p className="whitespace-nowrap text-xs text-gray-400">
                {formatDate(item.lastMessageAt)}
              </p>
              {item.unreadCount > 0 && (
                <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#55288D] px-1 text-xs text-white">
                  {item.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default MessagesList;
