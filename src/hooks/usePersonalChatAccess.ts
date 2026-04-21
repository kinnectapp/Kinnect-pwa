import { useEffect, useState } from "react";
import type { Channel as StreamChannel } from "stream-chat";

import { ensureStreamConnected } from "@/services/stream-chat.service";
import { useAuthStore } from "@/store/auth.store";

const DAY_MS = 24 * 60 * 60 * 1000;
const MESSAGE_PAGE_SIZE = 30;

export const CHAT_MEDIA_UNLOCK_DAYS = 7;
const CHAT_MEDIA_UNLOCK_MS = CHAT_MEDIA_UNLOCK_DAYS * DAY_MS;

type ChatMessageSummary = {
  created_at?: string | Date | null;
  id?: string;
};

export type PersonalChatAccessState = {
  isLoading: boolean;
  hasChatHistory: boolean;
  canShareMedia: boolean;
  conversationAgeMs: number;
  daysUntilUnlock: number;
  earliestMessageAt?: string;
  latestMessageAt?: string;
};

const EMPTY_ACCESS_STATE: PersonalChatAccessState = {
  isLoading: false,
  hasChatHistory: false,
  canShareMedia: false,
  conversationAgeMs: 0,
  daysUntilUnlock: CHAT_MEDIA_UNLOCK_DAYS,
};

const toId = (value: string | number | null | undefined) =>
  value == null ? "" : String(value);

const buildDmChannelId = (currentUserId: string, otherUserId: string) =>
  `dm-${[currentUserId, otherUserId].sort().join("-")}`;

const toMessageTimestamp = (message?: ChatMessageSummary) => {
  if (!message?.created_at) return null;

  const timestamp = new Date(message.created_at).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const toMessageDateString = (message?: ChatMessageSummary) => {
  if (!message?.created_at) return undefined;

  if (typeof message.created_at === "string") {
    return message.created_at;
  }

  return message.created_at instanceof Date
    ? message.created_at.toISOString()
    : undefined;
};

const summarizeMessages = (messages: ChatMessageSummary[]) => {
  let earliestMessage: ChatMessageSummary | undefined;
  let latestMessage: ChatMessageSummary | undefined;
  let earliestTimestamp = Number.POSITIVE_INFINITY;
  let latestTimestamp = Number.NEGATIVE_INFINITY;

  for (const message of messages) {
    const timestamp = toMessageTimestamp(message);
    if (timestamp == null) continue;

    if (timestamp < earliestTimestamp) {
      earliestTimestamp = timestamp;
      earliestMessage = message;
    }

    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestMessage = message;
    }
  }

  if (!earliestMessage || !latestMessage) return null;

  return {
    earliestMessage,
    earliestTimestamp,
    latestMessage,
    latestTimestamp,
  };
};

const buildAccessState = (
  earliestMessage?: ChatMessageSummary,
  latestMessage?: ChatMessageSummary,
): PersonalChatAccessState => {
  const earliestTimestamp = toMessageTimestamp(earliestMessage);
  const latestTimestamp = toMessageTimestamp(latestMessage);

  if (earliestTimestamp == null || latestTimestamp == null) {
    return { ...EMPTY_ACCESS_STATE };
  }

  const conversationAgeMs = Math.max(0, latestTimestamp - earliestTimestamp);
  const canShareMedia = conversationAgeMs >= CHAT_MEDIA_UNLOCK_MS;
  const remainingMs = Math.max(0, CHAT_MEDIA_UNLOCK_MS - conversationAgeMs);

  return {
    isLoading: false,
    hasChatHistory: true,
    canShareMedia,
    conversationAgeMs,
    daysUntilUnlock: canShareMedia ? 0 : Math.ceil(remainingMs / DAY_MS),
    earliestMessageAt: toMessageDateString(earliestMessage),
    latestMessageAt: toMessageDateString(latestMessage),
  };
};

const loadExistingPersonalChannel = async (
  otherUserId: string,
  channelCid?: string,
): Promise<StreamChannel | null> => {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return null;

  const currentUserId = toId(currentUser.id);
  const targetUserId = toId(otherUserId);
  if (!currentUserId || !targetUserId) return null;

  const client = await ensureStreamConnected(currentUser);
  const resolvedCid =
    channelCid || `messaging:${buildDmChannelId(currentUserId, targetUserId)}`;

  const channels = await client.queryChannels(
    {
      cid: { $eq: resolvedCid },
      members: { $in: [currentUserId] },
    },
    { last_message_at: -1 },
    {
      state: true,
      watch: false,
      limit: 1,
      message_limit: MESSAGE_PAGE_SIZE,
    },
  );

  return channels[0] ?? null;
};

export const getPersonalChatAccessState = async (
  otherUserId: string,
  channelCid?: string,
): Promise<PersonalChatAccessState> => {
  const channel = await loadExistingPersonalChannel(otherUserId, channelCid);
  if (!channel) return { ...EMPTY_ACCESS_STATE };

  const initialSummary = summarizeMessages(
    (channel.state.messages || []) as unknown as ChatMessageSummary[],
  );

  if (!initialSummary) {
    return { ...EMPTY_ACCESS_STATE };
  }

  let earliestMessage = initialSummary.earliestMessage;
  const latestMessage = initialSummary.latestMessage;
  let oldestLoadedMessageId = earliestMessage.id;

  while (
    oldestLoadedMessageId &&
    initialSummary.latestTimestamp - toMessageTimestamp(earliestMessage)! <
      CHAT_MEDIA_UNLOCK_MS
  ) {
    const response = await channel.query({
      state: true,
      watch: false,
      members: { limit: 2 },
      watchers: { limit: 0 },
      messages: {
        limit: MESSAGE_PAGE_SIZE,
        id_lt: oldestLoadedMessageId,
      },
    });

    const olderMessages = (response.messages || []) as ChatMessageSummary[];
    const olderSummary = summarizeMessages(olderMessages);

    if (!olderSummary) break;

    earliestMessage = olderSummary.earliestMessage;
    oldestLoadedMessageId = olderSummary.earliestMessage.id;

    const shouldStop =
      olderMessages.length < MESSAGE_PAGE_SIZE ||
      olderSummary.latestTimestamp - olderSummary.earliestTimestamp >=
        CHAT_MEDIA_UNLOCK_MS ||
      toMessageTimestamp(latestMessage)! - toMessageTimestamp(earliestMessage)! >=
        CHAT_MEDIA_UNLOCK_MS;

    if (shouldStop) break;
  }

  return buildAccessState(earliestMessage, latestMessage);
};

export const usePersonalChatAccess = (
  otherUserId?: string,
  channelCid?: string,
) => {
  const [state, setState] = useState<PersonalChatAccessState>({
    ...EMPTY_ACCESS_STATE,
    isLoading: Boolean(otherUserId),
  });

  useEffect(() => {
    let isActive = true;

    if (!otherUserId) {
      setState({ ...EMPTY_ACCESS_STATE });
      return () => {
        isActive = false;
      };
    }

    setState((current) => ({ ...current, isLoading: true }));

    const loadAccessState = async () => {
      try {
        const nextState = await getPersonalChatAccessState(otherUserId, channelCid);
        if (isActive) {
          setState(nextState);
        }
      } catch (error) {
        console.warn("Failed to resolve personal chat access:", error);
        if (isActive) {
          setState({ ...EMPTY_ACCESS_STATE });
        }
      }
    };

    void loadAccessState();

    return () => {
      isActive = false;
    };
  }, [channelCid, otherUserId]);

  return state;
};
