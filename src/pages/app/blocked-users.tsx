import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { Channel } from "stream-chat";
import { toast } from "sonner";

import { ensureStreamConnected } from "@/services/stream-chat.service";
import { useAuthStore } from "@/store/auth.store";
import { chatService } from "@/services/chat.service";
import { handleApiError } from "@/api/serviceUtils";

type ChannelPreview = {
  cid: string;
  name: string;
  image: string;
  userId: string;
  lastMessageText: string;
};

const imageCache = new Map<string, string>();

const BlockedUserItem: React.FC<{
  item: ChannelPreview;
  onClick: () => void;
}> = ({ item }) => {
  const navigate = useNavigate();
  const cached = imageCache.get(item.userId);
  const [displayImage, setDisplayImage] = useState(cached || item.image || "");

  useEffect(() => {
    if (imageCache.has(item.userId) || displayImage) return;
    let alive = true;
    chatService.getUserById(item.userId).then((data) => {
      const photos = data?.data?.resp?.profilePhotos;
      const url = photos?.[photos.length - 1];
      if (url && alive) {
        imageCache.set(item.userId, url);
        setDisplayImage(url);
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, [item.userId, displayImage]);

  const initial = item.name.charAt(0).toUpperCase();

  return (
    <button
      onClick={() =>
        navigate(`/app/chats/${encodeURIComponent(item.cid)}`, {
          state: { channelName: item.name, channelImage: displayImage },
        })
      }
      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
    >
      {displayImage ? (
        <img
          src={displayImage}
          alt={item.name}
          className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-[#E8E0F0] flex items-center justify-center">
          <span className="text-[#55288D] font-semibold text-lg">{initial}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">{item.name}</h3>
        <p className="truncate text-sm text-gray-400">{item.lastMessageText}</p>
      </div>
    </button>
  );
};

const BlockedUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const client = await ensureStreamConnected(user);
        const userId = String(user.id);
        const queried = await client.queryChannels(
          { type: "messaging", members: { $in: [userId] }, hidden: true },
          { last_message_at: -1 } as const,
          { state: true, watch: false, limit: 50, message_limit: 1 },
        );

        const blockedIds = new Set(
          ((user.blockedUsers as number[] | undefined) ?? []).map(String),
        );

        const blocked = queried.filter((ch) => {
          const members = Object.values(ch.state.members || {});
          const other = members.find((m) => m.user_id !== userId);
          return other?.user_id && blockedIds.has(other.user_id);
        });

        if (isMountedRef.current) setChannels(blocked);
      } catch (error) {
        if (isMountedRef.current) toast.error(handleApiError(error));
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    void load();
  }, [user]);

  const userId = String(user?.id ?? "");

  const previews: ChannelPreview[] = channels.map((ch) => {
    const members = Object.values(ch.state.members || {});
    const other = members.find((m) => m.user_id !== userId);
    const lastMsg = ch.state.messages[ch.state.messages.length - 1];
    return {
      cid: ch.cid,
      name: other?.user?.name || "Blocked User",
      image: (other?.user as any)?.image || "",
      userId: other?.user_id || "",
      lastMessageText: lastMsg?.text || "No messages",
    };
  });

  return (
    <div className="min-h-[100dvh] bg-[#FAF8FB]">
      <div className="sticky top-0 z-10 bg-white px-4 pb-4 pt-[calc(env(safe-area-inset-top)+12px)] flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="font-semibold text-[#55288D] text-[18px]">Blocked Matches</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-[#F3F3F6]" />
          ))}
        </div>
      ) : previews.length === 0 ? (
        <p className="p-6 text-sm text-[#77707F] text-center">No blocked users.</p>
      ) : (
        <div className="bg-white mt-2 rounded-xl overflow-hidden mx-4">
          {previews.map((item) => (
            <BlockedUserItem key={item.cid} item={item} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsersPage;
