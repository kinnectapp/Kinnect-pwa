import React from "react";
import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
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
    staleTime: 5 * 60 * 1000,
  });

  const communities: Community[] = data?.data?.data || data?.data?.resp || [];

  return (
    <div className="min-h-[100dvh] bg-white pb-24">
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
            <div
              key={index}
              className="h-36 rounded-lg bg-[#F3F3F6] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="p-4 grid gap-3">
          {communities.map((community) => (
            <button
              key={community.id}
              onClick={() => navigate(`/app/community/${community.id}`)}
              className="rounded-lg border border-[#E8E3EE] p-4 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <img
                  src={community.image || "/pwa-192x192.png"}
                  alt={community.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[#1C1C1C]">
                    {community.name}
                  </h2>
                  <p className="text-xs text-[#77707F] line-clamp-2">
                    {community.description || "View this community"}
                  </p>
                </div>
                <span className="text-xs text-[#55288D] font-medium shrink-0">
                  View →
                </span>
              </div>
            </button>
          ))}
          {!communities.length && (
            <p className="text-sm text-[#77707F]">
              No communities available right now.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
