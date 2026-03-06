import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { isPaidUser, ensureStreamConnected } from "@/services/stream-chat.service";
import { chatService } from "@/services/chat.service";
import { handleApiError } from "@/api/serviceUtils";
import MessageInput from "./MessageInput";
import AudioMessage from "./messagges/AudioMessage";
import type { Channel, Event } from "stream-chat";

type Props = {
  channelId: string;
};

const QUICK_REPLIES = ["Hi", "How are you?", "Can we talk later?"];

const formatMessageTime = (messageTime?: string | null) => {
  if (!messageTime) return "";
  const date = new Date(messageTime);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatPage: React.FC<Props> = ({ channelId }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cachedPersonalChannels = useChatStore(
    (state) => state.personalChannels,
  );
  const cachedCommunityChannels = useChatStore(
    (state) => state.communityChannels,
  );

  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isPaid = useMemo(() => isPaidUser(user), [user]);
  const currentUserId = useMemo(() => String(user?.id || ""), [user?.id]);

  // Load and watch channel - simplified to match mobile app pattern
  useEffect(() => {
    let unsubscribers: Array<() => void> = [];
    let isMounted = true;

    const loadChannel = async () => {
      if (!channelId || !currentUserId) return;
      setIsLoading(true);
      setHasError(false);

      try {
        // Ensure user is connected to Stream Chat before querying channels
        const client = await ensureStreamConnected(user);
        const channels = await client.queryChannels(
          {
            id: { $eq: channelId },
            members: { $in: [currentUserId] },
          },
          { last_message_at: -1 },
          { watch: true, state: true, message_limit: 30 },
        );

        const selected = channels[0];
        if (!selected) {
          setErrorMessage("Chat not found.");
          setHasError(true);
          setTimeout(() => navigate("/app/chats", { replace: true }), 2000);
          return;
        }

        if (!isMounted) return;

        // Watch channel for updates (like mobile app does)
        await selected.watch();

        const members = Object.values(selected.state.members || {});
        const otherMember = members.find(
          (member) => member.user_id !== currentUserId,
        );
        setPartnerId(otherMember?.user_id || "");
        setChannel(selected);
        
        // Load initial messages
        const loadedMessages = [...(selected.state.messages || [])];
        setMessages(loadedMessages);

        // Setup message event listeners (like mobile app)
        const onNewMessage = selected.on("message.new", (event: Event) => {
          if (!event.message) return;
          setMessages((prev) => {
            const next = [...prev];
            if (next.some((m) => m.id === event.message?.id)) return next;
            next.push(event.message);
            return next;
          });
        });

        const onUpdate = selected.on("message.updated", () => {
          const next = [...(selected.state.messages || [])];
          setMessages(next);
        });

        const onDelete = selected.on("message.deleted", () => {
          const next = [...(selected.state.messages || [])];
          setMessages(next);
        });

        unsubscribers = [
          onNewMessage.unsubscribe,
          onUpdate.unsubscribe,
          onDelete.unsubscribe,
        ];
      } catch (error) {
        const errorMsg = handleApiError(error);
        setErrorMessage(errorMsg);
        setHasError(true);
        toast.error(errorMsg);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadChannel();

    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [channelId, currentUserId, navigate, user]);

  // Simplified send message handler - match mobile app pattern
  const handleSend = useCallback(
    async (text: string) => {
      if (!channel || !text.trim()) return;
      try {
        await channel.sendMessage({ text: text.trim() });
        setHasError(false);
      } catch (error) {
        const errorMsg = handleApiError(error);
        setErrorMessage(errorMsg);
        setHasError(true);
        toast.error(errorMsg);
      }
    },
    [channel],
  );

  // Audio message handler
  const handleSendAudio = useCallback(
    async (audioUrl: string, duration: number) => {
      if (!channel) return;
      try {
        await channel.sendMessage({
          text: `🎵 Audio message`,
          attachments: [
            {
              type: "audio",
              asset_url: audioUrl,
              duration: Math.round(duration),
            },
          ],
        });
        setHasError(false);
      } catch (error) {
        const errorMsg = handleApiError(error);
        setErrorMessage(errorMsg);
        setHasError(true);
        toast.error(errorMsg);
      }
    },
    [channel],
  );

  // Quick reply helper
  const handleQuickReply = useCallback(
    async (reply: string) => {
      await handleSend(reply);
    },
    [handleSend],
  );

  // Generic action handler for user actions
  const runAction = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      try {
        await action();
        toast.success(successMessage);
        setShowActions(false);
        setHasError(false);
      } catch (error) {
        const errorMsg = handleApiError(error);
        setErrorMessage(errorMsg);
        setHasError(true);
        toast.error(errorMsg);
      }
    },
    [],
  );

  // Memoized title like mobile app
  const title = useMemo(() => {
    const cachedTitle =
      cachedPersonalChannels.find((item) => item.id === channelId)?.name ||
      cachedCommunityChannels.find((item) => item.id === channelId)?.name;
    if (!channel && cachedTitle) return cachedTitle;
    if (!channel) return "Chat";
    const members = Object.values(channel.state.members || {});
    const otherMember = members.find(
      (member) => member.user_id !== currentUserId,
    );
    return otherMember?.user?.name || "Chat";
  }, [
    cachedCommunityChannels,
    cachedPersonalChannels,
    channel,
    channelId,
    currentUserId,
  ]);

  // Loading state - match mobile skeleton style
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <span className="loader" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAF8FB]">
      {/* Header - match mobile */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
          <button
            onClick={() => setShowActions((prev) => !prev)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{errorMessage}</p>
            <button
              onClick={() => setHasError(false)}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Action menu - like mobile options */}
      {showActions && partnerId && (
        <div className="mx-4 mt-3 rounded-lg border bg-white p-3 grid grid-cols-2 gap-2 text-sm">
          <button
            onClick={() =>
              void runAction(
                () => chatService.proceedToDate(partnerId),
                "Date request sent.",
              )
            }
            className="rounded-md bg-[#55288D] text-white py-2"
          >
            Proceed To Date
          </button>
          <button
            onClick={() =>
              void runAction(
                () =>
                  chatService.reportUser({
                    reportedUserId: partnerId,
                    reason: "Reported from chat",
                  }),
                "User reported.",
              )
            }
            className="rounded-md bg-[#f4f4f5] py-2"
          >
            Report
          </button>
          <button
            onClick={() =>
              void runAction(() => chatService.blockUser(partnerId), "User blocked.")
            }
            className="rounded-md bg-[#f4f4f5] py-2"
          >
            Block
          </button>
          <button
            onClick={() =>
              void runAction(
                () => chatService.sponsorUser(partnerId),
                "Sponsor request sent.",
              )
            }
            className="rounded-md bg-[#f4f4f5] py-2"
          >
            Sponsor
          </button>
          <button
            onClick={() =>
              void runAction(() => chatService.jiltUser(partnerId), "Match removed.")
            }
            className="rounded-md bg-[#f4f4f5] py-2 col-span-2"
          >
            Jilt / Dislike
          </button>
        </div>
      )}

      {/* Messages container - match mobile message layout */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((message) => {
          const own = message.user?.id === currentUserId;

          // Handle audio attachments
          const audioAttachment = message.attachments?.find(
            (att: any) => att.type === "audio",
          );
          if (audioAttachment) {
            return (
              <div
                key={message.id}
                className={`flex ${own ? "justify-end" : "justify-start"}`}
              >
                <AudioMessage
                  audioUrl={audioAttachment.asset_url}
                  duration={audioAttachment.duration || 0}
                  isUser={own}
                  timestamp={formatMessageTime(message.created_at)}
                />
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${own ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  own ? "bg-[#55288D] text-white" : "bg-white text-[#1C1C1C]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text || "[Unsupported message type]"}
                </p>
                <p className="text-[10px] opacity-70 mt-1">
                  {formatMessageTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick replies for freemium users - match mobile */}
      {!isPaid && (
        <div className="px-4 pb-2 pt-3 bg-white border-t border-gray-200 flex gap-2 flex-wrap">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => void handleQuickReply(reply)}
              className="px-3 py-2 rounded-full bg-[#EEEAF4] text-[#55288D] text-xs"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Message input - match mobile */}
      <MessageInput
        onSendMessage={handleSend}
        onSendAudioUrl={handleSendAudio}
      />
    </div>
  );
};

export default ChatPage;
