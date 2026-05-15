import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { Channel } from "stream-chat";
import { toast } from "sonner";

import { handleApiError } from "@/api/serviceUtils";
import { ensureStreamConnected } from "@/services/stream-chat.service";
import { CachedChannelPreview, useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";

import { chatService } from "@/services/chat.service";
import KinnectChatBtn from "../ai/KinnectChatBtn";

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

  let previewText = "No messages yet";
  if (lastMessage) {
    const hasText = lastMessage.text && lastMessage.text.trim().length > 0;
    const hasAttachment =
      lastMessage.attachments && lastMessage.attachments.length > 0;
    if (hasText) {
      previewText = lastMessage.text!;
    } else if (hasAttachment) {
      const attachment = lastMessage.attachments![0];
      if (attachment.type === "image") previewText = "📷 Photo";
      else if (attachment.type === "video") previewText = "🎥 Video";
      else if (
        attachment.type === "voiceRecording" ||
        attachment.type === "audio"
      )
        previewText = "🎤 Voice Note";
      else previewText = "📎 Attachment";
    }
  }

  return {
    id: resolvedChannelId,
    cid: channel.cid,
    name: otherMember?.user?.name || "Direct Message",
    image: otherMember?.user?.image || undefined,
    userId: otherMember?.user_id,
    lastMessageText: previewText,
    lastMessageAt: lastMessage?.created_at
      ? String(lastMessage.created_at)
      : undefined,
    unreadCount: channel.countUnread(),
  };
};

// Used only for the online-users strip (image only)
const ChannelAvatar = ({
  userId,
  initialImage,
  alt,
  className,
}: {
  userId: string;
  initialImage?: string;
  alt: string;
  className: string;
}) => {
  const [image, setImage] = useState<string | undefined>(initialImage);

  useEffect(() => {
    let isMounted = true;
    if (!initialImage || initialImage === "/pwa-192x192.png") {
      chatService
        .getUserById(userId)
        .then((data) => {
          const photos = data?.data?.resp?.profilePhotos;
          if (photos?.[photos.length - 1] && isMounted)
            setImage(photos[photos.length - 1]);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [userId, initialImage]);

  return (
    <img src={image || "/pwa-192x192.png"} alt={alt} className={className} />
  );
};

// Full row for the main list — fetches name + image together if Stream is missing either
const ChannelListItem: React.FC<{
  item: CachedChannelPreview;
  onClick: (name: string, image: string) => void;
}> = ({ item, onClick }) => {
  const userId = item.userId || item.id;
  const needsEnrich =
    !item.name || item.name === "Direct Message" || !item.image;

  const [displayImage, setDisplayImage] = useState(
    item.image && item.image !== "/pwa-192x192.png" ? item.image : "",
  );
  const [isLoading, setIsLoading] = useState(needsEnrich);

  useEffect(() => {
    if (!needsEnrich || !userId) return;
    let isMounted = true;

    setIsLoading(true);
    chatService
      .getUserById(userId)
      .then((data) => {
        const resp = data?.data?.resp;
        if (!isMounted) return;
        if (resp) {
          if (resp.profilePhotos?.[resp.profilePhotos.length - 1])
            setDisplayImage(resp.profilePhotos[resp.profilePhotos.length - 1]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId, needsEnrich]);

  const name = item.name || "Direct Message";
  const image = displayImage || item.image || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => onClick(name, image)}
      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-100"
    >
      {isLoading ? (
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-[#F3F3F6] animate-pulse" />
      ) : image ? (
        <img
          src={image}
          alt={name}
          className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-[#E8E0F0] flex items-center justify-center">
          <span className="text-[#55288D] font-semibold text-lg leading-none">
            {initial}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">{name}</h3>
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
  );
};

const MessagesList: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cachedChannels = useChatStore((state) => state.personalChannels);
  const setPersonalChannels = useChatStore(
    (state) => state.setPersonalChannels,
  );

  const [channels, setChannels] = useState<Channel[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Ref so loadChannels (defined outside useEffect) can check mount status
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadChannels = async () => {
    if (!user?.id) return;
    setHasError(false);
    try {
      const client = await ensureStreamConnected(user);
      const userId = String(user.id);
      const filter = { type: "messaging", members: { $in: [userId] } };
      const sort = { last_message_at: -1 } as const;
      const queryOpts = {
        state: true,
        watch: true,
        limit: 30,
        message_limit: 30,
      };

      const [visible, hiddenChannels] = await Promise.all([
        client.queryChannels(filter, sort, queryOpts),
        client.queryChannels({ ...filter, hidden: true }, sort, queryOpts),
      ]);

      if (!isMountedRef.current) return;

      const seen = new Set(visible.map((c) => c.cid));
      const queried = [
        ...visible,
        ...hiddenChannels.filter((c) => !seen.has(c.cid)),
      ];

      setChannels(queried);
      setPersonalChannels(queried.map((channel) => toPreview(channel, userId)));
      setHasLoadedOnce(true);
      setHasError(false);
      setErrorMessage("");
    } catch (error) {
      if (!isMountedRef.current) return;
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      if (!user?.id) {
        setChannels([]);
        setHasLoadedOnce(true);
        return;
      }

      if (cachedChannels.length > 0) {
        // Show cached data immediately, then refresh in background
        setHasLoadedOnce(true);
        void loadChannels();
      } else {
        // First ever load — wait so we don't flash an empty state
        await loadChannels();
      }

      try {
        const client = await ensureStreamConnected(user);
        const subscription = client.on((event) => {
          // Only refetch when there is genuinely new data
          if (
            event.type === "message.new" ||
            event.type === "notification.message_new" ||
            event.type === "notification.added_to_channel"
          ) {
            if (isMounted) void loadChannels();
          }
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (error) {
        console.warn("Failed to setup listener:", error);
      }
    };

    void setup();
    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [user?.id, cachedChannels.length === 0]);

  const onlineUsers = React.useMemo(() => {
    if (!user?.id) return [];
    const uniqueUsers = new Map<string, any>();
    channels.forEach((channel) => {
      const members = Object.values(channel.state.members || {});
      const otherMember = members.find((m) => m.user_id !== String(user.id));
      if (otherMember?.user?.online) {
        uniqueUsers.set(otherMember.user.id, {
          ...otherMember.user,
          cid: channel.cid,
        });
      }
    });
    return Array.from(uniqueUsers.values());
  }, [channels, user?.id]);

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

      {/* Online users strip */}
      {onlineUsers.length > 0 && !hasError && (
        <div className="flex gap-4 overflow-x-auto px-4 py-4 border-b border-gray-100 [&::-webkit-scrollbar]:hidden">
          {onlineUsers.map((u) => (
            <button
              key={u.id}
              onClick={() =>
                navigate(`/app/chats/${encodeURIComponent(u.cid)}`)
              }
              className="flex flex-col items-center gap-1 w-[56px] shrink-0 transition-opacity hover:opacity-80"
            >
              <div className="relative">
                <ChannelAvatar
                  userId={u.id}
                  initialImage={u.image}
                  alt={u.name || "User"}
                  className="w-14 h-14 rounded-full object-cover border-[2.5px] border-[#55288D] p-[1.5px]"
                />
                <span className="absolute bottom-[2px] right-[2px] w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <span className="text-[11px] text-center truncate w-full text-gray-700 font-medium">
                {u.name?.split(" ")[0] || "User"}
              </span>
            </button>
          ))}
        </div>
      )}

      <KinnectChatBtn />

      {list.length === 0 && hasError ? (
        <p className="p-4 text-sm text-[#77707F]">
          Unable to load chats. Try refreshing.
        </p>
      ) : (
        (() => {
          const normalChats = list.filter(
            (item) =>
              !(user?.blockedUsers as number[] | undefined)?.includes(
                Number(item.userId),
              ),
          );
          const blockedChats = list.filter((item) =>
            (user?.blockedUsers as number[] | undefined)?.includes(
              Number(item.userId),
            ),
          );

          return (
            <>
              {/* Normal Chats */}
              {normalChats.map((item) => (
                <ChannelListItem
                  key={item.cid}
                  item={item}
                  onClick={(name, image) =>
                    navigate(`/app/chats/${encodeURIComponent(item.cid)}`, {
                      state: { channelName: name, channelImage: image },
                    })
                  }
                />
              ))}

              {/* Separator and Blocked Chats Header */}
              {blockedChats.length > 0 && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 my-2">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-[10px]  text-[#98939e] ">
                      Blocked Matches
                    </span>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>

                  {/* Blocked Chats */}
                  {blockedChats.map((item) => (
                    <ChannelListItem
                      key={item.cid}
                      item={item}
                      onClick={(name, image) =>
                        navigate(`/app/chats/${encodeURIComponent(item.cid)}`, {
                          state: { channelName: name, channelImage: image },
                        })
                      }
                    />
                  ))}
                </>
              )}
            </>
          );
        })()
      )}
    </div>
  );
};

export default MessagesList;
