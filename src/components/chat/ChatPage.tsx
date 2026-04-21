import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import UserImg from "../../assets/images/user-profile.png";
import { useChatStore } from "@/store/chat.store";
import {
  CHAT_MEDIA_UNLOCK_DAYS,
  usePersonalChatAccess,
} from "@/hooks/usePersonalChatAccess";
import {
  ensureStreamConnected,
} from "@/services/stream-chat.service";
import { chatService } from "@/services/chat.service";
import { handleApiError } from "@/api/serviceUtils";
import ChatOptionsModal from "./ChatOptionsModal";
import ReportModal from "./ReportModal";
import ConfirmationModal from "./ConfirmationModal";
import SponsorModal from "./SponsorModal";
import CustomDateSeparator from "./CustomDateSeparator";
import CustomMessageStatus from "./CustomMessageStatus";
import { CustomQuotedMessage } from "./CustomQuotedMessage";
import type {
  Channel as ChannelType,
  LocalMessage,
  Message as StreamMessage,
  SendMessageOptions,
} from "stream-chat";
import {
  Channel,
  Window,
  MessageList,
  MessageInput,
  TypingIndicator,
} from "stream-chat-react";

type Props = {
  channelId: string;
};

const DisabledAttachmentSelector = () => null;

const ChatPage: React.FC<Props> = ({ channelId: rawChannelId }) => {
  const channelId = decodeURIComponent(rawChannelId);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setActiveChannelId = useChatStore(
    (state) => state.setActiveChannelId,
  );
  const cachedPersonalChannels = useChatStore(
    (state) => state.personalChannels,
  );
  const cachedCommunityChannels = useChatStore(
    (state) => state.communityChannels,
  );

  const [channel, setChannel] = useState<ChannelType | null>(null);
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

  const currentUserId = useMemo(() => String(user?.id || ""), [user?.id]);
  const personalChatAccess = usePersonalChatAccess(partnerId, channel?.cid);

  // Load and watch channel
  useEffect(() => {
    let isMounted = true;

    const loadChannel = async () => {
      if (!channelId || !currentUserId) return;
      setIsLoading(true);
      setHasError(false);

      try {
        const currentUser = useAuthStore.getState().user;
        const client = await ensureStreamConnected(currentUser);
        
        // Better way to grab cached channels:
        const [type, id] = channelId.split(":");
        let selected = client.channel(type, id);

        if (!selected.initialized) {
          const channels = await client.queryChannels(
            {
              cid: { $eq: channelId },
              members: { $in: [currentUserId] },
            },
            { last_message_at: -1 },
            { watch: true, state: true, message_limit: 30 },
          );
          selected = channels[0];
        }

        if (!selected) {
          setErrorMessage("Chat not found.");
          setHasError(true);
          setTimeout(() => navigate("/app/chats", { replace: true }), 2000);
          return;
        }

        if (!isMounted) return;

        const members = Object.values(selected.state.members || {});
        const otherMember = members.find(
          (member) => member.user_id !== currentUserId,
        );

        setPartnerId(otherMember?.user_id || "");
        setPartnerLocation(
          `${(otherMember?.user as any)?.state || ""}, ${(otherMember?.user as any)?.country || ""}`.trim(),
        );
        setChannel(selected);
        setActiveChannelId(selected.cid);
        selected.markRead();
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
      setActiveChannelId(null);
    };
  }, [channelId, currentUserId, navigate, setActiveChannelId]);

  // Fetch full user data when partner ID is set
  useEffect(() => {
    if (!partnerId) return;

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const fullUserData = await chatService.getUserById(partnerId);
        if (fullUserData && isMounted) {
          setPartnerFullName(fullUserData?.data?.resp?.firstname + " " + fullUserData?.data?.resp?.lastname || "");
          setPartnerAge(fullUserData?.data?.resp?.dob || "");
          setPartnerImage(fullUserData?.data?.resp?.profilePhotos[0] || "");
          const location =
            `${fullUserData?.data?.resp?.state || ""}, ${fullUserData?.data?.resp?.country || ""}`.trim();
          setPartnerLocation(location);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    void fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [partnerId]);

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

  // Memoized title
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

  // Compute partner age
  const partnerAgeDisplay = partnerAge
    ? Math.floor(
      (Date.now() - new Date(partnerAge).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    )
    : null;

  const isPersonalChat = channel?.type === "messaging";
  const shouldRestrictMediaSharing =
    isPersonalChat &&
    (!partnerId || personalChatAccess.isLoading || !personalChatAccess.canShareMedia);
  const lockedMediaMessage = personalChatAccess.hasChatHistory
    ? `Keep chatting for ${personalChatAccess.daysUntilUnlock} more day${
        personalChatAccess.daysUntilUnlock === 1 ? "" : "s"
      } to unlock images, voice notes, and files.`
    : `Images, voice notes, and files unlock after ${CHAT_MEDIA_UNLOCK_DAYS} days of chatting.`;

  const handleMessageSubmit = useCallback(
    async ({
      message,
      sendOptions,
    }: {
      cid: string;
      localMessage: LocalMessage;
      message: StreamMessage;
      sendOptions: SendMessageOptions;
    }) => {
      if (!channel) return;

      const hasAttachments = (message.attachments?.length || 0) > 0;
      if (shouldRestrictMediaSharing && hasAttachments) {
        toast.error(lockedMediaMessage);
        return;
      }

      await channel.sendMessage(message, sendOptions);
    },
    [channel, lockedMediaMessage, shouldRestrictMediaSharing],
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAF8FB]">
      {/* Custom Header */}
      <div className="bg-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 onClick={() => navigate(`/app/match-profile/${partnerId}`)} className="font-semibold text-[#55288D] capitalize flex items-center gap-1 text-[18px]">
            {title} <span className="w-1.5 h-1.5 rounded-full bg-[#F416C4]"></span>
          </h2>
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

      {/* Action menu */}
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

      {/* Stream Chat UI */}
      {channel ? (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <Channel
              channel={channel}
              AttachmentSelector={
                shouldRestrictMediaSharing ? DisabledAttachmentSelector : undefined
              }
              DateSeparator={CustomDateSeparator}
              MessageStatus={CustomMessageStatus as any}
              QuotedMessage={CustomQuotedMessage as any}
            >
              <Window>
                <MessageList
                  messageActions={['react', 'quote', 'delete']}
                  head={
                    <div className="flex justify-center gap-2 flex-col items-center pt-3 pb-4">
                      <img
                        src={partnerImage || UserImg}
                        alt=""
                        className="w-[60px] object-cover h-[60px] rounded-full border"
                      />
                      {partnerFullName && (
                        <p className="text-[#1C1C1C] font-medium text-[14px]">
                          {partnerFullName}{partnerAgeDisplay ? `, ${partnerAgeDisplay}` : ''}
                        </p>
                      )}
                    </div>
                  }
                />
                <TypingIndicator />
                {!personalChatAccess.isLoading && isPersonalChat && !personalChatAccess.canShareMedia && (
                  <div className="border-t border-[#F1ECF5] bg-white px-4 py-3 text-xs text-[#77707F]">
                    <div className="flex items-start gap-2">
                      <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D400B3]" />
                      <p>{lockedMediaMessage}</p>
                    </div>
                  </div>
                )}
                <MessageInput
                  audioRecordingEnabled={!shouldRestrictMediaSharing}
                  overrideSubmitHandler={handleMessageSubmit}
                />
              </Window>
            </Channel>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-[#FAF8FB]">
          <span className="loader" />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Unable to load this chat.</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
