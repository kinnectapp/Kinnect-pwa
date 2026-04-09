import React from "react";
import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { getSubscriptionPermissions } from "@/lib/subscription";

type Community = {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
  externalId?: string;
  externalID?: string;
};

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const permissions = getSubscriptionPermissions(user);
  const { data, isLoading } = useQuery({
    queryKey: ["community-list"],
    queryFn: async () => chatService.getCommunities(),
  });

  const communities: Community[] = data?.data?.data || data?.data?.resp || [];

  const handleJoinConversation = async (community: Community) => {
    if (!permissions.canJoinCommunityConversation) {
      toast.error(
        "Freemium users can view communities only. Upgrade to Standard or above to join the conversation.",
      );
      return;
    }

    try {
      const channelId = await chatService.ensureCommunityChannel(community);
      navigate(`/app/chats/${channelId}`);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-semibold text-[#1C1C1C]">Communities</h1>
        <p className="text-sm text-[#77707F] mt-1">
          {permissions.canJoinCommunityConversation
            ? "Join the conversation in any Kinnect community."
            : "Browse communities on Freemium. Upgrade to join conversations, host, and participate fully."}
        </p>
      </div>

      {isLoading ? (
        <div className="p-4 grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-lg bg-[#F3F3F6] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="p-4 grid gap-3">
          {communities.map((community) => (
            <div key={community.id} className="rounded-lg border border-[#E8E3EE] p-4">
              <div className="flex items-center gap-3">
                <img
                  src={community.image || "/pwa-192x192.png"}
                  alt={community.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-[#1C1C1C]">{community.name}</h2>
                  <p className="text-xs text-[#77707F] line-clamp-2">
                    {community.description || "Join this community channel"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleJoinConversation(community)}
                className={`mt-4 w-full rounded-md py-2 text-sm text-white ${
                  permissions.canJoinCommunityConversation
                    ? "bg-[#55288D]"
                    : "bg-[#C8BCD8]"
                }`}
              >
                {permissions.canJoinCommunityConversation
                  ? "Join the Conversation"
                  : "Upgrade to Join"}
              </button>
            </div>
          ))}
          {!communities.length && (
            <p className="text-sm text-[#77707F]">No communities available right now.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
