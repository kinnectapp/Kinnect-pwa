import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ensureStreamConnected } from "@/services/stream-chat.service";
import { useAuthStore } from "@/store/auth.store";
import type { Channel } from "stream-chat";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { CachedChannelPreview, useChatStore } from "@/store/chat.store";

const toPreview = (channel: Channel): CachedChannelPreview => {
  const resolvedChannelId = channel.id || channel.cid.split(":")[1];
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  return {
    id: resolvedChannelId,
    cid: channel.cid,
    name: String(channel.data?.name || "Community Channel"),
    image: String(channel.data?.image || "/pwa-192x192.png"),
    lastMessageText: lastMessage?.text || "No messages yet",
    lastMessageAt: lastMessage?.created_at
      ? String(lastMessage.created_at)
      : undefined,
    unreadCount: channel.countUnread(),
  };
};

const CommunityView: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cachedChannels = useChatStore((state) => state.communityChannels);
  const setCommunityChannels = useChatStore(
    (state) => state.setCommunityChannels,
  );
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadChannels = async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    setHasError(false);
    try {
      const client = await ensureStreamConnected(user);
      const queried = await client.queryChannels(
        { type: "groupmessaging", members: { $in: [String(user.id)] } },
        { last_message_at: -1 },
        { state: true, watch: true, limit: 30 },
      );

      setChannels(queried);
      setCommunityChannels(queried.map((channel) => toPreview(channel)));
      setHasLoadedOnce(true);
      setHasError(false);
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupChannelListener = async () => {
      try {
        await loadChannels();

        const client = await ensureStreamConnected(user);
        // Listen for message events and refresh channels
        const subscription = client.on((event) => {
          if (
            event.type === "message.new" ||
            event.type === "notification.added_to_channel"
          ) {
            if (isMounted) {
              void loadChannels();
            }
          }
        });
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.warn("Failed to setup listener:", error);
      }
    };

    if (isMounted) {
      void setupChannelListener();
    }

    return () => {
      isMounted = false;
    };
  }, [setCommunityChannels, user?.id]);

  const shouldShowSkeleton =
    !hasLoadedOnce && !channels.length && cachedChannels.length === 0;

  if (shouldShowSkeleton) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-md bg-[#F3F3F6] animate-pulse"
          />
        ))}
      </div>
    );
  }

  const list: CachedChannelPreview[] = channels.length
    ? channels.map((channel) => toPreview(channel))
    : cachedChannels;

  if (!list.length && !hasError) {
    return (
      <p className="p-4 text-sm text-[#77707F]">
        You have not joined any community channels yet.
      </p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {hasError && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-700">{errorMessage}</p>
            <button
              onClick={() => void loadChannels()}
              className="text-xs text-red-600 hover:text-red-700 mt-1 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      )}

      {isRefreshing && cachedChannels.length > 0 && (
        <p className="px-4 py-2 text-xs text-[#77707F]">
          Refreshing communities...
        </p>
      )}

      {list.length === 0 && hasError ? (
        <p className="p-4 text-sm text-[#77707F]">
          Unable to load communities. Try refreshing.
        </p>
      ) : (
        list.map((item) => {
          return (
            <button
              key={item.cid}
              onClick={() => navigate(`/app/chats/${item.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 text-left"
            >
              <img
                src={String(item.image || "/pwa-192x192.png")}
                alt={String(item.name || "Community")}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {String(item.name || "Community Channel")}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {item.lastMessageText || "No messages yet"}
                </p>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};

export default CommunityView;
