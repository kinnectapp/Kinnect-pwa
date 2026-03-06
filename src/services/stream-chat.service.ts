import { STREAM_API_KEY } from "@/env";
import type { User } from "@/lib/types/auth";
import { StreamChat } from "stream-chat";
import { useAuthStore } from "@/store/auth.store";

let streamClient: StreamChat | null = null;
let connectPromise: Promise<StreamChat> | null = null;
let connectionMonitorInterval: NodeJS.Timeout | null = null;

const safeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

export const getStreamToken = (user: User | null): string => {
  if (!user) return "";
  return safeString(user.streamToken || user.stream_token);
};

export const isPaidUser = (user: User | null): boolean => {
  if (!user) return false;
  if (typeof user.isPaid === "boolean") return user.isPaid;
  if (typeof user.isPremium === "boolean") return user.isPremium;
  if (typeof user.hasActiveSubscription === "boolean") {
    return user.hasActiveSubscription;
  }

  const normalizedPlan = safeString(
    user.plan || user.subscriptionPlan || user.subscriptionType,
  )
    .toLowerCase()
    .trim();

  if (!normalizedPlan) return false;
  if (normalizedPlan.includes("free")) return false;

  return ["paid", "premium", "plus", "pro", "gold"].some((plan) =>
    normalizedPlan.includes(plan),
  );
};

export const getStreamClient = (): StreamChat => {
  if (!STREAM_API_KEY) {
    throw new Error("Missing Stream API key (VITE_STREAM_API_KEY).");
  }
  if (!streamClient) {
    streamClient = StreamChat.getInstance(STREAM_API_KEY, { timeout: 0 });
  }
  return streamClient;
};

export const connectStreamUser = async (user: User): Promise<StreamChat> => {
  const client = getStreamClient();
  const userId = safeString(user.id);
  const token = getStreamToken(user);

  if (!userId || !token) {
    throw new Error("Missing Stream user id or token.");
  }

  if (client.userID === userId) {
    return client;
  }

  if (client.userID && client.userID !== userId) {
    await client.disconnectUser();
  }

  await client.connectUser(
    {
      id: userId,
      name:
        safeString(user.username) ||
        [safeString(user.firstname), safeString(user.lastname)]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        user.email,
      image: user.incognito
        ? undefined
        : safeString(user.profilePhoto || user.image || user.avatar) ||
          undefined,
    },
    token,
  );

  // Setup connection monitoring
  setupConnectionMonitoring(user);

  return client;
};

const setupConnectionMonitoring = (user: User) => {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
  }

  connectionMonitorInterval = setInterval(async () => {
    try {
      const client = getStreamClient();
      if (!client.userID) {
        // Connection lost, attempt reconnect
        await connectStreamUser(user);
      }
    } catch (error) {
      console.warn("Connection monitor error:", error);
    }
  }, 30000); // Check every 30 seconds
};

export const ensureStreamConnected = async (
  userOverride?: User | null,
): Promise<StreamChat> => {
  const resolvedUser = userOverride ?? useAuthStore.getState().user;
  if (!resolvedUser) {
    throw new Error("User not available for Stream connection.");
  }

  const client = getStreamClient();
  const userId = safeString(resolvedUser.id);
  const token = getStreamToken(resolvedUser);
  if (!userId || !token) {
    throw new Error("Missing Stream user id or token.");
  }

  if (client.userID === userId && client.user) {
    return client;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = connectStreamUser(resolvedUser).finally(() => {
    connectPromise = null;
  });

  return connectPromise;
};

export const disconnectStreamUser = async () => {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
    connectionMonitorInterval = null;
  }
  if (!streamClient) return;
  connectPromise = null;
  await streamClient.disconnectUser();
};
