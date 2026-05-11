import { STREAM_API_KEY } from "@/env";
import type { User } from "@/lib/types/auth";
import { getSubscriptionPermissions } from "@/lib/subscription";
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
  return getSubscriptionPermissions(user).isPaid;
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

  // Already connected to this user
  if (client.userID === userId && client.user?.id) {
    return client;
  }

  // Switch user - disconnect from old user first
  if (client.userID && client.userID !== userId) {
    try {
      await client.disconnectUser();
    } catch (error) {
      console.warn("Error disconnecting previous user:", error);
      // Continue anyway - create new client instance
      streamClient = null;
    }
  }

  try {
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
          : safeString(
              user.profilePhoto || 
              user.image || 
              user.avatar || 
              (Array.isArray(user.profilePhotos) ? user.profilePhotos[0] : undefined)
            ) || undefined,
      },
      token,
    );
  } catch (error) {
    console.error("Failed to connect user to Stream:", error);
    streamClient = null;
    throw error;
  }

  // Setup connection monitoring
  setupConnectionMonitoring(user);

  return client;
};

const MAX_RECONNECT_FAILURES = 5;

const setupConnectionMonitoring = (user: User) => {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
  }

  let failureCount = 0;

  connectionMonitorInterval = setInterval(async () => {
    try {
      const client = getStreamClient();
      if (!client.userID || !client.user?.id) {
        if (failureCount >= MAX_RECONNECT_FAILURES) {
          clearInterval(connectionMonitorInterval!);
          connectionMonitorInterval = null;
          console.warn("Stream reconnect gave up after max failures.");
          return;
        }
        try {
          await connectStreamUser(user);
          failureCount = 0;
        } catch (error) {
          failureCount += 1;
          console.error(`Stream reconnect failed (${failureCount}/${MAX_RECONNECT_FAILURES}):`, error);
        }
      } else {
        failureCount = 0;
      }
    } catch (error) {
      console.warn("Connection monitor error:", error);
    }
  }, 30000);
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

  // Check if already connected to the correct user
  if (client.userID === userId && client.user?.id) {
    return client;
  }

  // If there's already a connection in progress, wait for it
  if (connectPromise) {
    return connectPromise;
  }

  // Start new connection
  connectPromise = connectStreamUser(resolvedUser)
    .catch((error) => {
      connectPromise = null;
      throw error;
    })
    .then((result) => {
      connectPromise = null;
      return result;
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
  try {
    await streamClient.disconnectUser();
  } catch (error) {
    console.warn("Error disconnecting from Stream:", error);
  } finally {
    streamClient = null;
  }
};
