import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, MoreVertical, AlertCircle, Lock, Ban } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import UserImg from "../../assets/images/user-profile.png";
import { useChatStore } from "@/store/chat.store";
import {
  CHAT_MEDIA_UNLOCK_DAYS,
  usePersonalChatAccess,
} from "@/hooks/usePersonalChatAccess";
import { ensureStreamConnected } from "@/services/stream-chat.service";
import { chatService } from "@/services/chat.service";
import { handleApiError } from "@/api/serviceUtils";
import ChatOptionsModal from "./ChatOptionsModal";
import ReportModal from "./ReportModal";
import JiltModal from "./JiltModal";
import SponsorModal from "./SponsorModal";
import ConfirmDialog from "./ConfirmDialog";
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
  const location = useLocation();
  const locationState = location.state as {
    channelName?: string;
    channelImage?: string;
  } | null;
  const user = useAuthStore((state) => state.user);
  const setActiveChannelId = useChatStore((state) => state.setActiveChannelId);
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
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [pendingReportReason, setPendingReportReason] = useState("");
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showProceedConfirm, setShowProceedConfirm] = useState(false);
  const [showJiltModal, setShowJiltModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const currentUserId = useMemo(() => String(user?.id || ""), [user?.id]);
  const personalChatAccess = usePersonalChatAccess(partnerId, channel?.cid);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jiltAfterBlock = useRef(false);

  useEffect(() => {
    if (!hasError) return;
    const timer = setTimeout(() => setHasError(false), 5000);
    return () => clearTimeout(timer);
  }, [hasError]);

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
          redirectTimerRef.current = setTimeout(
            () => navigate("/app/chats", { replace: true }),
            2000,
          );
          return;
        }

        if (!isMounted) return;

        const members = Object.values(selected.state.members || {});
        const otherMember = members.find(
          (member) => member.user_id !== currentUserId,
        );

        setPartnerId(otherMember?.user_id || "");
        setPartnerLocation(
          `${(otherMember?.user as any)?.state || ""} ${(otherMember?.user as any)?.country || ""}`.trim(),
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
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [channelId, currentUserId, navigate, setActiveChannelId, showActions]);

  // Fetch full user data when partner ID is set (DM only)
  useEffect(() => {
    if (!partnerId || channel?.type !== "messaging") return;

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const fullUserData = await chatService.getUserById(partnerId);
        if (fullUserData && isMounted) {
          const resp = fullUserData?.data?.resp;
          setPartnerFullName(
            resp?.incognito
              ? resp?.username || ""
              : [resp?.firstname, resp?.lastname].filter(Boolean).join(" "),
          );
          setPartnerAge(fullUserData?.data?.resp?.dob || "");
          setPartnerImage(fullUserData?.data?.resp?.profilePhotos[fullUserData?.data?.resp?.profilePhotos.length - 1] || "");
          const location =
            `${fullUserData?.data?.resp?.state || ""} ${fullUserData?.data?.resp?.country || ""}`.trim();
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
  }, [partnerId, showActions]);

  // Handle Proceed to Date
  const handleProceedToDate = useCallback(() => {
    setShowProceedConfirm(true);
  }, []);

  const handleConfirmProceedToDate = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.proceedToDate(partnerId);
      toast.success("Date request sent.");
      setShowProceedConfirm(false);
      setShowActions(false);
    } catch (error) {
      toast.error(handleApiError(error));
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

  const handleReasonSelected = useCallback((reason: string) => {
    setPendingReportReason(reason);
    setShowReportModal(false);
    setShowReportConfirm(true);
  }, []);

  const handleSubmitReport = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.reportUser({
        reportedUserId: Number(partnerId),
        reason: pendingReportReason,
        reporterId: Number(currentUserId),
      });
      toast.success("User reported. Your report will be reviewed.");
      setShowReportConfirm(false);
      setShowActions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId, pendingReportReason, currentUserId]);

  // Handle Block
  const handleBlockUser = useCallback(() => {
    setShowBlockConfirm(true);
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.blockUser(partnerId);
      const currentBlocked = (user?.blockedUsers as number[] | undefined) ?? [];
      await useAuthStore.getState().setUser({ ...user!, blockedUsers: [...currentBlocked, Number(partnerId)] });
      toast.success("User blocked.");
      setShowBlockConfirm(false);
      setShowActions(false);
      jiltAfterBlock.current = true;
      setShowJiltModal(true);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId, navigate, user]);

  const handleUnblockUser = useCallback(async () => {
    try {
      setIsPerformingAction(true);
      await chatService.unblockUser(partnerId);
      const currentBlocked = (user?.blockedUsers as number[] | undefined) ?? [];
      await useAuthStore.getState().setUser({ ...user!, blockedUsers: currentBlocked.filter((id) => id !== Number(partnerId)) });
      toast.success("User unblocked.");
      setShowActions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  }, [partnerId, user]);

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
    if (channel.type !== "messaging") {
      return String(
        (channel.data as Record<string, any>)?.name ||
          locationState?.channelName ||
          cachedCommunityChannels.find((item) => item.cid === channelId)
            ?.name ||
          "Community Channel",
      );
    }
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
    locationState,
  ]);

  // Compute partner age — guard against invalid/missing date
  const partnerAgeDisplay = useMemo(() => {
    if (!partnerAge) return null;
    const dob = new Date(partnerAge);
    if (isNaN(dob.getTime())) return null;
    return Math.floor(
      (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    );
  }, [partnerAge]);

  const isPersonalChat = channel?.type === "messaging";

  const isPartnerBlocked = useMemo(() => {
    if (!isPersonalChat || !partnerId || !user?.blockedUsers) return false;
    return (user.blockedUsers as number[]).includes(Number(partnerId));
  }, [isPersonalChat, partnerId, user?.blockedUsers]);

  const shouldRestrictMediaSharing =
    isPersonalChat &&
    (!partnerId ||
      personalChatAccess.isLoading ||
      !personalChatAccess.canShareMedia);
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

      try {
        await channel.sendMessage(message, sendOptions);
      } catch (error: any) {
        const msg: string = error?.message ?? "";
        const status: number = error?.status ?? error?.StatusCode ?? 0;
        if (status === 403 || msg.toLowerCase().includes("block")) {
          toast.error("You can no longer send messages to this user.");
        } else {
          toast.error("Failed to send message. Please try again.");
        }
      }
    },
    [channel, lockedMediaMessage, shouldRestrictMediaSharing],
  );

  return (
    <div className="flex h-[100dvh] pb-[calc(env(safe-area-inset-bottom))] flex-col overflow-hidden bg-[#FAF8FB]">
      {/* Custom Header */}
      <div className="sticky top-0 z-10 shrink-0 bg-white px-4 pb-4 pt-[calc(env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2
            onClick={() =>
              isPersonalChat
                ? navigate(`/app/match-profile/${partnerId}`)
                : undefined
            }
            className={`font-semibold text-[#55288D] capitalize flex items-center gap-1 text-[18px] ${isPersonalChat ? "cursor-pointer" : "cursor-default"}`}
          >
            {title}{" "}
            <span className="w-1.5 h-1.5 rounded-full bg-[#F416C4]"></span>
          </h2>
          {isPersonalChat ? (
            <button
              onClick={() => setShowActions((prev) => !prev)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <div className="w-7" />
          )}
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
        profileComp={
          isPersonalChat ? (
            <div className="flex items-center gap-3 mb-6">
              {isPersonalChat && !personalChatAccess.canShareMedia ? (
                <div className="relative w-[50px] h-[50px] rounded-full border overflow-hidden flex-shrink-0">
                  <div
                    className="absolute inset-0 scale-110  blur-sm "
                    style={{ backgroundImage: `url(${partnerImage || UserImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  />
                  <div className="absolute inset-0 select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                </div>
              ) : (
                <img src={partnerImage || UserImg} alt="" className="w-[50px] h-[50px] object-cover rounded-full border" />
              )}
              <div>
                <p className="text-gray-900 font-medium">
                  {title}
                  {title && partnerAgeDisplay ? `, ${partnerAgeDisplay}` : ""}
                </p>
                <p className="text-sm text-gray-600">{partnerLocation}</p>
              </div>
            </div>
          ) : null
        }
        isOpen={showActions}
        partnerName={title}
        isBlocked={isPartnerBlocked}
        onClose={() => setShowActions(false)}
        onProceedToDate={handleProceedToDate}
        onSponsorPlan={handleSponsorPlan}
        onBlock={handleBlockUser}
        onUnblock={handleUnblockUser}
        onReport={handleReportUser}
        onJilt={handleJiltUser}
      />

      {/* Report — reason selector */}
      <ReportModal
        isOpen={showReportModal}
        userName={title}
        userImage={partnerImage}
        userLocation={partnerLocation}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReasonSelected}
      />

      {/* Report — confirm dialog */}
      <ConfirmDialog
        isOpen={showReportConfirm}
        title="Report User"
        message={`Report ${title} for "${pendingReportReason}"? Your report is anonymous and will be reviewed by our team.`}
        confirmText="Report"
        cancelText="Cancel"
        isDangerous
        isLoading={isPerformingAction}
        onClose={() => setShowReportConfirm(false)}
        onConfirm={handleSubmitReport}
      />

      {/* Block — confirm dialog */}
      <ConfirmDialog
        isOpen={showBlockConfirm}
        title="Block Match"
        message={`Are you sure you want to block ${title}? They will no longer be able to message you.`}
        confirmText="Block"
        cancelText="Cancel"
        isDangerous
        isLoading={isPerformingAction}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleConfirmBlock}
      />

      {/* Proceed to Date — confirm dialog */}
      <ConfirmDialog
        isOpen={showProceedConfirm}
        title="Proceed to Date"
        message={`Send a date request to ${title}?`}
        confirmText="Send Request"
        cancelText="Cancel"
        isLoading={isPerformingAction}
        onClose={() => setShowProceedConfirm(false)}
        onConfirm={handleConfirmProceedToDate}
      />

      {/* Jilt Confirmation Modal */}
      <JiltModal
        isOpen={showJiltModal}
        userName={title}
        userImage={partnerImage}
        userLocation={partnerLocation}
        blurImage={!personalChatAccess.canShareMedia}
        onClose={() => {
          setShowJiltModal(false);
          if (jiltAfterBlock.current) {
            jiltAfterBlock.current = false;
            navigate("/app/chats");
          }
        }}
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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Channel
              channel={channel}
              AttachmentSelector={
                shouldRestrictMediaSharing
                  ? DisabledAttachmentSelector
                  : undefined
              }
              DateSeparator={CustomDateSeparator}
              MessageStatus={CustomMessageStatus as any}
              QuotedMessage={CustomQuotedMessage as any}
            >
              <div className=" border flex min-h-0 flex-1 flex-col overflow-hidden">
                <Window>
                  <MessageList
                    messageActions={["react", "quote", "delete"]}
                    head={
                      <div className="flex justify-center gap-2 flex-col items-center pt-3 pb-4">
                        {isPersonalChat && !personalChatAccess.canShareMedia ? (
                          <div className="relative w-[60px] h-[60px] rounded-full border overflow-hidden flex-shrink-0">
                            <div
                              className="absolute inset-0 blur-sm  "
                              style={{ backgroundImage: `url(${partnerImage || UserImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
                            />
                            <div className="absolute inset-0 select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                          </div>
                        ) : (
                          <img
                            src={
                              isPersonalChat
                                ? partnerImage || UserImg
                                : String(
                                    (channel?.data as Record<string, any>)
                                      ?.image ||
                                      locationState?.channelImage ||
                                      cachedCommunityChannels.find(
                                        (item) => item.cid === channelId,
                                      )?.image ||
                                      "/pwa-192x192.png",
                                  )
                            }
                            alt=""
                            className="w-[60px] object-cover h-[60px] rounded-full border"
                          />
                        )}
                        {isPersonalChat && partnerFullName && (
                          <p className="text-[#1C1C1C] font-medium text-[14px]">
                            {title ?? ""}
                            {title ? `, ${partnerAgeDisplay}` : ""}
                          </p>
                        )}
                      </div>
                    }
                  />
                  <TypingIndicator />
                  {isPartnerBlocked && (
                    <div className="border-t border-[#F1ECF5] bg-white px-4 py-3 text-xs text-[#77707F]">
                      <div className="flex items-start gap-2">
                        <Ban className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D400B3]" />
                        <p>You have blocked this user. Unblock them to send and receive messages.</p>
                      </div>
                    </div>
                  )}
                  {!personalChatAccess.isLoading &&
                    isPersonalChat &&
                    !personalChatAccess.canShareMedia &&
                    !isPartnerBlocked && (
                      <div className="border-t border-[#F1ECF5] bg-white px-4 py-3 text-xs text-[#77707F]">
                        <div className="flex items-start gap-2">
                          <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D400B3]" />
                          <p>{lockedMediaMessage}</p>
                        </div>
                      </div>
                    )}
                  {isPartnerBlocked ? (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Ban size={16} />
                      <span>You've blocked this user</span>
                    </div>
                  ) : (
                    <div className="border">
                      <MessageInput
                        audioRecordingEnabled={!shouldRestrictMediaSharing}
                        overrideSubmitHandler={handleMessageSubmit}
                      />
                    </div>
                  )}
                </Window>
              </div>
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
