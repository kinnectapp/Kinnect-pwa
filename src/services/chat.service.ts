import { endpoints } from "@/api/endpoints";
import { http } from "@/api/http";
import { useAuthStore } from "@/store/auth.store";
import { connectStreamUser } from "./stream-chat.service";

type Community = {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
  externalId?: string;
  externalID?: string;
};

const toId = (value: string | number): string => String(value);

const getCurrentUser = () => {
  return useAuthStore.getState().user;
};

const ensureStreamClient = async () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not available for chat.");
  }
  return connectStreamUser(user);
};

const buildDmChannelId = (currentUserId: string, otherUserId: string) => {
  return `dm-${[currentUserId, otherUserId].sort().join("-")}`;
};

export const chatService = {
  getProfile: async () => {
    const { data } = await http.get(endpoints.users.profile);
    return data;
  },

  getMatches: async () => {
    const { data } = await http.get(endpoints.users.matches);
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await http.get(endpoints.users.single(id));
    return data;
  },

  getKiki: async () => {
    const { data } = await http.get(endpoints.admin.kiki);
    return data;
  },

  getCommunities: async () => {
    const { data } = await http.get(endpoints.community.list);
    return data;
  },

  proceedToDate: async (id: string) => {
    const { data } = await http.put(endpoints.users.proceedToDate(id), {});
    return data;
  },

  blockUser: async (id: string) => {
    const { data } = await http.put(endpoints.users.block(id), {});
    return data;
  },

  jiltUser: async (id: string) => {
    const { data } = await http.put(endpoints.users.jilt(id), {});
    return data;
  },

  reportUser: async (payload: Record<string, unknown>) => {
    const { data } = await http.post(endpoints.report.add, payload);
    return data;
  },

  sponsorUser: async (reportedUserId: string) => {
    const { data } = await http.put(
      endpoints.subscription.sponsor(reportedUserId),
      {},
    );
    return data;
  },

  ensurePersonalChannel: async (otherUserId: string) => {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("User not found.");
    }

    const currentUserId = toId(user.id);
    const targetUserId = toId(otherUserId);
    const client = await ensureStreamClient();
    const channelId = buildDmChannelId(currentUserId, targetUserId);

    const channel = client.channel("messaging", channelId, {
      members: [currentUserId, targetUserId],
      created_by_id: currentUserId,
    });

    try {
      await channel.watch();
       console.log("channelIdchannelId", channelId);
      
      
      return channel.cid || channelId;
    } catch (error: any) {
       const errorMsg =
        error?.message ||
        (typeof error === "string" ? error : JSON.stringify(error));
      if (typeof errorMsg === "string" && errorMsg.includes("deleted user")) {
        throw new Error("This user profile is no longer available.");
      }
      throw error;
    }
  },

  ensureCommunityChannel: async (community: Community) => {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("User not found.");
    }

    const currentUserId = toId(user.id);
    const externalId = community.externalId || community.externalID || "";
    const channelId = externalId || `community-${toId(community.id)}`;
    const client = await ensureStreamClient();

    const channel = client.channel("groupmessaging", channelId, {
      name: community.name,
      members: [currentUserId],
      created_by_id: currentUserId,
      image: community.image,
      description: community.description,
    });

    await channel.watch();

    try {
      await channel.addMembers([currentUserId]);
    } catch {
      // Already a member.
    }

    return channel.id || channelId;
  },
};
