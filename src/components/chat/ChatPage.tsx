import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, AlertCircle, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import UserImg from "../../assets/images/user-profile.png";
import { useChatStore } from "@/store/chat.store";
import {
  isPaidUser,
  ensureStreamConnected,
} from "@/services/stream-chat.service";
import { chatService } from "@/services/chat.service";
import { handleApiError } from "@/api/serviceUtils";
import MessageInput from "./MessageInput";
import AudioMessage from "./messagges/AudioMessage";
import ChatOptionsModal from "./ChatOptionsModal";
import ReportModal from "./ReportModal";
import SponsorModal from "./SponsorModal";
import ConfirmationModal from "./ConfirmationModal";
import TypingIndicator from "./TypingIndicator";
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

const ChatPage: React.FC<Props> = ({ channelId: rawChannelId }) => {
  const channelId = decodeURIComponent(rawChannelId);
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
  const [partnerFullName, setPartnerFullName] = useState<string>("");
  const [partnerAge, setPartnerAge] = useState<string>("");
  const [partnerImage, setPartnerImage] = useState<string>("");
  const [partnerLocation, setPartnerLocation] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showJiltModal, setShowJiltModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            cid: { $eq: channelId },
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
        // setPartnerImage((otherMember?.user as any)?.image || "");
        setPartnerLocation(
          `${(otherMember?.user as any)?.state || ""}, ${(otherMember?.user as any)?.country || ""}`.trim(),
        );
        setChannel(selected);

        // Load initial messages
        const loadedMessages = [...(selected.state.messages || [])];
        setMessages(loadedMessages);
        selected.markRead();

        // Setup message event listenegis (like mobile app)
        const onNewMessage = selected.on("message.new", (event: Event) => {
          if (!event.message) return;
          setMessages((prev) => {
            const next = [...prev];
            if (next.some((m) => m.id === event.message?.id)) return next;
            next.push(event.message);
            selected.markRead();
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

        // Typing indicators
        const onTypingStart = selected.on("typing.start", (event: Event) => {
          if (event.user?.id === currentUserId) return;
          const name = event.user?.name || event.user?.id || "Someone";
          setTypingUsers((prev) =>
            prev.includes(name) ? prev : [...prev, name],
          );
        });

        const onTypingStop = selected.on("typing.stop", (event: Event) => {
          const name = event.user?.name || event.user?.id || "Someone";
          setTypingUsers((prev) => prev.filter((u) => u !== name));
        });

        unsubscribers = [
          onNewMessage.unsubscribe,
          onUpdate.unsubscribe,
          onDelete.unsubscribe,
          onTypingStart.unsubscribe,
          onTypingStop.unsubscribe,
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
channel?.markRead();
    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [channelId, currentUserId, navigate, user]);

  // Fetch full user data when partner ID is set
  useEffect(() => {
    if (!partnerId) return;

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const fullUserData = await chatService.getUserById(partnerId);
        if (fullUserData && isMounted) {
          console.log("fullUserData", fullUserData);
          setPartnerFullName(fullUserData?.data?.resp?.firstname + " " + fullUserData?.data?.resp?.lastname || "");
          setPartnerAge(fullUserData?.data?.resp?.dob || "");
          setPartnerImage(fullUserData?.data?.resp?.profilePhotos[0] || "");
          const location =
            `${fullUserData?.data?.resp?.state || ""}, ${fullUserData?.data?.resp?.country || ""}`.trim();
          setPartnerLocation(location);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Fall back to whatever we have
      }
    };

    void fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [partnerId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Simplified send message handler - match mobile app pattern
  const handleSend = useCallback(
    async (text: string) => {
      if (!channel || !text.trim()) return;
      try {
        await channel.sendMessage({ text: text.trim() });
        // Stop typing indicator on send
        void channel.stopTyping();
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

  // Notify Stream when user is typing
  const handleTyping = useCallback(() => {
    void channel?.keystroke();
  }, [channel]);

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

  // Handle Proceed to Date
  const handleProceedToDate = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.proceedToDate(partnerId);
      toast.success("Date request sent.");
      setShowActions(false);
      setHasError(false);
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId]);

  // Handle Sponsor Plan
  const handleSponsorPlan = useCallback(async () => {
    setShowSponsorModal(true);
  }, []);

  const handleConfirmSponsor = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.sponsorUser(partnerId);
      toast.success("Sponsor request sent.");
      setShowSponsorModal(false);
      setShowActions(false);
      setHasError(false);
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId]);

  // Handle Report
  const handleReportUser = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const handleConfirmReport = useCallback(
    async (reason: string) => {
      try {
        setIsPerformingAction(true);
        await chatService.reportUser({
          reportedUserId: partnerId,
          reason,
        });
        toast.success("User reported. Your report will be reviewed.");
        setShowReportModal(false);
        setShowActions(false);
        setHasError(false);
      } catch (error) {
        const errorMsg = handleApiError(error);
        setErrorMessage(errorMsg);
        setHasError(true);
        toast.error(errorMsg);
      } finally {
        setIsPerformingAction(false);
      }
    },
    [partnerId],
  );

  // Handle Block
  const handleBlockUser = useCallback(() => {
    setShowBlockModal(true);
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.blockUser(partnerId);
      toast.success("User blocked.");
      setShowBlockModal(false);
      setShowActions(false);
      setHasError(false);
      // Navigate back after short delay
      setTimeout(() => navigate("/app"), 500);
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId, navigate]);

  // Handle Jilt
  const handleJiltUser = useCallback(() => {
    setShowJiltModal(true);
  }, []);

  const handleConfirmJilt = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.jiltUser(partnerId);
      toast.success("Match removed.");
      setShowJiltModal(false);
      setShowActions(false);
      setHasError(false);
      // Navigate back after short delay
      setTimeout(() => navigate("/app"), 500);
    } catch (error) {
      const errorMsg = handleApiError(error);
      setErrorMessage(errorMsg);
      setHasError(true);
      toast.error(errorMsg);
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId, navigate]);

  // Memoized title like mobile app
  const title = useMemo(() => {
    const cachedTitle =
      cachedPersonalChannels.find((item) => item.cid === channelId)?.name ||
      cachedCommunityChannels.find((item) => item.cid === channelId)?.name;
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
      <div className="bg-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="font-semibold text-[#55288D] capitalize flex items-center gap-1 text-[18px]">{title} <span className="w-1.5 h-1.5 rounded-full bg-[#F416C4]"></span> </h2>
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
      <ChatOptionsModal
        isOpen={showActions}
        partnerName={title}
        onClose={() => setShowActions(false)}
        onProceedToDate={handleProceedToDate}
        onSponsorPlan={handleSponsorPlan}
        onBlock={handleBlockUser}
        onReport={handleReportUser}
        onJilt={handleJiltUser}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        userName={title}
        userImage={partnerImage}
        userLocation={partnerLocation}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleConfirmReport}
        isLoading={isPerformingAction}
      />

      {/* Block Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBlockModal}
        title="Block Match"
        message={`Are you sure you want to block ${title}? They will no longer be able to see or interact with you. And the user will no longer appear on your feed`}
        userImage={partnerImage}
        userLocation={partnerLocation}
        confirmText="Block"
        isDangerous
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleConfirmBlock}
        isLoading={isPerformingAction}
      />

      {/* Jilt Confirmation Modal */}
      <ConfirmationModal
        isOpen={showJiltModal}
        title="Jilt Match"
        message={`Are you sure you want to jilt this match? By jilting this match, it means your are no longer interested and want to put off this conversation.`}
        userImage={partnerImage}
        userLocation={partnerLocation}
        confirmText="Jilt"
        isDangerous
        onClose={() => setShowJiltModal(false)}
        onConfirm={handleConfirmJilt}
        isLoading={isPerformingAction}
      />

      {/* Sponsor Modal */}
      <SponsorModal
        isOpen={showSponsorModal}
        userName={title}
        userImage={partnerImage}
        onClose={() => setShowSponsorModal(false)}
        onConfirm={handleConfirmSponsor}
        isLoading={isPerformingAction}
      />

      {/* Messages container - match mobile message layout */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="  mb-10 flex justify-center gap-2 flex-col items-center ">
          <img src={partnerImage || UserImg} alt="" className="w-[60px] object-cover h-[60px] rounded-full border" />
          <p className="text-[#1C1C1C] font-medium text-[14px]">{partnerFullName}, {Math.floor(
            (Date.now() - new Date(partnerAge).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
          )}</p>
        </div>
        {messages.map((message) => {
          const own = message.user?.id === currentUserId;
          const attachments: any[] = message.attachments || [];

          // Handle audio attachments
          const audioAttachment = attachments.find(
            (att) => att.type === "audio",
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

          // Render image/video/file attachments
          const mediaAttachments = attachments.filter(
            (att) => att.type !== "audio",
          );

          return (
            <div
              key={message.id}
              className={`flex flex-col gap-1 ${own ? "items-end" : "items-start"}`}
            >
              {/* Media attachments */}
              {mediaAttachments.map((att, i) => {
                if (att.type === "image" || att.image_url || att.thumb_url) {
                  return (
                    <a
                      key={i}
                      href={att.image_url || att.asset_url || att.thumb_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[240px] rounded-2xl overflow-hidden block"
                    >
                      <img
                        src={att.thumb_url || att.image_url || att.asset_url}
                        alt={att.title || "image"}
                        className="w-full object-cover"
                      />
                    </a>
                  );
                }
                if (att.type === "video" || att.mime_type?.startsWith("video/")) {
                  return (
                    <video
                      key={i}
                      src={att.asset_url}
                      controls
                      className="max-w-[240px] rounded-2xl overflow-hidden"
                    />
                  );
                }
                // Generic file
                if (att.asset_url || att.type === "file") {
                  return (
                    <a
                      key={i}
                      href={att.asset_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 max-w-[240px] rounded-2xl px-3 py-2 text-sm ${own
                        ? "bg-[#55288D] text-white"
                        : "bg-white text-[#1C1C1C]"
                        }`}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{att.title || "File"}</span>
                      <Download className="w-4 h-4 flex-shrink-0" />
                    </a>
                  );
                }
                return null;
              })}

              {/* Text bubble (render even if empty but we have attachments) */}
              {(message.text || !mediaAttachments.length) && (
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${own ? "bg-[#55288D] text-white" : "bg-white text-[#1C1C1C]"
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text || "[Unsupported message type]"}
                  </p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <TypingIndicator typingUsernames={typingUsers} />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
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
