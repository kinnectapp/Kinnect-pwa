import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { useAuthStore } from "@/store/auth.store";
import { getSubscriptionPermissions } from "@/lib/subscription";
import { ChevronLeft } from "lucide-react";
import { ensureStreamConnected } from "@/services/stream-chat.service";

type Community = {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
  externalId?: string;
  externalID?: string;
  createdBy?: string | number;
};

const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const permissions = getSubscriptionPermissions(user);

  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["community-list"],
    queryFn: async () => chatService.getCommunities(),
  });

  const communities: Community[] = data?.data?.data || data?.data?.resp || [];
  const community = communities.find(
    (c) => String(c.id) === String(id),
  );

  // Check if the current user is already a member of this community's channel
  useEffect(() => {
    if (!community || !user?.id) return;

    const channelId = String(
      community.externalId || community.externalID || community.id || "",
    );
    if (!channelId) return;

    const checkMembership = async () => {
      try {
        const client = await ensureStreamConnected(user);
        const channels = await client.queryChannels(
          { type: "groupmessaging", id: { $eq: channelId }, members: { $in: [String(user.id)] } },
          {},
          { limit: 1 },
        );
        setIsAlreadyJoined(channels.length > 0);
      } catch {
        // default to showing "Join" if check fails
      }
    };

    void checkMembership();
  }, [community?.id, user?.id]);

  const handleAction = async () => {
    if (!community) return;

    // Already joined — navigate directly without re-joining
    if (isAlreadyJoined) {
      const channelId = String(
        community.externalId || community.externalID || community.id || "",
      );
      navigate(`/app/chats/${encodeURIComponent(`groupmessaging:${channelId}`)}`, {
        state: { channelName: community.name, channelImage: community.image },
      });
      return;
    }

    // if (!permissions.canJoinCommunityConversation) {
    //   toast.error(
    //     "Freemium users can view communities only. Upgrade to Standard or above to join the conversation.",
    //   );
    //   navigate("/app/subscriptions");
    //   return;
    // }

    try {
      setIsJoining(true);
      const channelId = await chatService.ensureCommunityChannel(community);
      setIsAlreadyJoined(true);
      navigate(`/app/chats/${encodeURIComponent(channelId)}`, {
        state: { channelName: community.name, channelImage: community.image },
      });
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-white pb-24">
        <div className="h-64 bg-[#F3F3F6] animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-2/3 rounded bg-[#F3F3F6] animate-pulse" />
          <div className="h-4 w-full rounded bg-[#F3F3F6] animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-[#F3F3F6] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-[100dvh] bg-white pb-24 flex flex-col items-center justify-center gap-4">
        <p className="text-[#77707F] text-sm">Community not found.</p>
        <button
          onClick={() => navigate("/app/community")}
          className="text-[#55288D] text-sm font-medium"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  const buttonLabel = isAlreadyJoined
    ? "Open Conversation"
    : permissions.canJoinCommunityConversation
      ? "Join the Conversation"
      : "Upgrade to Join";

  const buttonColor = isAlreadyJoined || permissions.canJoinCommunityConversation
    ? "bg-[#55288D]"
    : "bg-[#C8BCD8]";

  return (
    <div className="min-h-[100dvh] bg-white pb-32">
      {/* Hero image */}
      <div className="relative h-64 w-full">
        <img
          src={community.image || "/pwa-192x192.png"}
          alt={community.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-semibold text-[#1C1C1C]">
          {community.name}
        </h1>

        {community.description && (
          <p className="text-sm text-[#77707F] leading-relaxed">
            {community.description}
          </p>
        )}

        {!permissions.canJoinCommunityConversation && !isAlreadyJoined && (
          <div className="rounded-lg bg-[#F5F0FB] border border-[#E0D3F0] p-3">
            <p className="text-xs text-[#55288D]">
              You're on a Freemium plan. Upgrade to Standard or above to join
              community conversations.
            </p>
          </div>
        )}
      </div>

      {/* Action button — fixed at bottom */}
      <div
        className="fixed left-0 right-0 px-4 pb-2 bg-white border-t border-[#F0EBF8]"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 56px)" }}
      >
        <button
          onClick={handleAction}
          disabled={isJoining}
          className={`mt-3 w-full rounded-md py-3 text-sm font-medium text-white ${buttonColor} disabled:opacity-60`}
        >
          {isJoining ? "Joining..." : buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
