import React, { useState, useMemo, useCallback } from "react";
import ProfileCard from "@/components/ProfileCard";
import MoreOptionsModal from "@/components/MoreOptionsModal";
import ReportModal from "@/components/chat/ReportModal";
import JiltModal from "@/components/chat/JiltModal";
import ConfirmDialog from "@/components/chat/ConfirmDialog";
import SponsorModal from "@/components/chat/SponsorModal";
import { useNavigate, useParams } from "react-router-dom";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { usePersonalChatAccess } from "@/hooks/usePersonalChatAccess";
import { Loader } from "lucide-react";
import UserImage from "../../assets/images/user-profile.png";
import { useQuery } from "@tanstack/react-query";

interface ProfileEssentials {
  dob?: string;
  education?: string;
  occupation?: string;
  religion?: string;
  drinkRate?: string;
  smokeRate?: string;
}

interface Profile {
  id: string;
  name: string;
  location: string;
  dob: string;
  personalityPercentage: string;
  image: string;
  images: string[];
  about: string;
  personalityResult: string;
  flags: string[];
  essentials: ProfileEssentials;
  interests: string[];
}

type UserByIdResponse = {
  data?: {
    resp?: {
      id: number | string;
      firstname?: string;
      lastname?: string;
      username?: string;
      incognito?: boolean;
      city?: string;
      state?: string;
      country?: string;
      dob?: string;
      personalityPercentage?: number | string;
      profilePhotos?: string[];
      bio?: string;
      personalitySummary?: string;
      education?: string;
      occupation?: string;
      religion?: string;
      drinkRate?: string;
      smokeRate?: string;
      interests?: string[];
    };
  };
};

export const MatchProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [pendingReportReason, setPendingReportReason] = useState("");
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showJiltModal, setShowJiltModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const {
    data: userByIdResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["match-profile", id],
    queryFn: async () => chatService.getUserById(id!),
    enabled: Boolean(id),
  });

  const fetchedProfile = useMemo(
    () => (userByIdResponse as UserByIdResponse | undefined)?.data?.resp ?? null,
    [userByIdResponse],
  );

  const currentProfile: Profile | null = useMemo(() => {
    if (!fetchedProfile) return null;

    const images: string[] =
      fetchedProfile.profilePhotos && fetchedProfile.profilePhotos.length > 0
        ? fetchedProfile.profilePhotos
        : [UserImage];

    let age = 0;
    if (fetchedProfile.dob) {
      age = Math.floor(
        (Date.now() - new Date(fetchedProfile.dob).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      );
    }

    return {
      id: String(fetchedProfile.id),
      username:fetchedProfile.username || ""   ,
      name: fetchedProfile.incognito
        ? fetchedProfile.username || "Unknown User"
        : fetchedProfile.firstname && fetchedProfile.lastname
          ? `${fetchedProfile.firstname} ${fetchedProfile.lastname}`.trim()
          : fetchedProfile.username || "Unknown User",
      location: [fetchedProfile.city, fetchedProfile.state, fetchedProfile.country]
        .filter(Boolean)
        .join(", "),
      dob: String(age),
      personalityPercentage: String(
        Number(fetchedProfile.personalityPercentage || 0).toFixed() || 0,
      ),
      image: images[0],
      images,
      about: fetchedProfile.bio || "No bio available",
      personalityResult: fetchedProfile.personalitySummary || "",
      flags: [],
      essentials: {
        dob: String(age),
        education: fetchedProfile.education,
        occupation: fetchedProfile.occupation,
        religion: fetchedProfile.religion,
        drinkRate: fetchedProfile.drinkRate,
        smokeRate: fetchedProfile.smokeRate,
      },
      interests: fetchedProfile.interests || [],
    };
  }, [fetchedProfile]);

  const personalChatAccess = usePersonalChatAccess(currentProfile?.id);

  const isPartnerBlocked = useMemo(() => {
    if (!currentProfile?.id || !user?.blockedUsers) return false;
    return (user.blockedUsers as number[]).includes(Number(currentProfile.id));
  }, [currentProfile?.id, user?.blockedUsers]);

  const handleMessage = async () => {
    if (!currentProfile) return;
    try {
      const channelId = await chatService.ensurePersonalChannel(
        currentProfile.id,
      );
      // console.log("currentProfile", channelId);
      navigate(`/app/chats/${channelId}`);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleProceedToDate = async () => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.proceedToDate(currentProfile.id);
      toast.success(`Date request sent to ${currentProfile.name}`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleConfirmSponsor = async () => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.sponsorUser(currentProfile.id);
      toast.success(`Sponsor request sent for ${currentProfile.name}`);
      setShowSponsorModal(false);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleConfirmBlock = async () => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.blockUser(currentProfile.id);
      const currentBlocked = (user?.blockedUsers as number[] | undefined) ?? [];
      await useAuthStore.getState().setUser({ ...user!, blockedUsers: [...currentBlocked, Number(currentProfile.id)] });
      toast.success(`${currentProfile.name} has been blocked`);
      setShowBlockConfirm(false);
      setShowMoreOptions(false);
      setTimeout(() => navigate("/app"), 500);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleUnblockUser = useCallback(async () => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.unblockUser(currentProfile.id);
      const currentBlocked = (user?.blockedUsers as number[] | undefined) ?? [];
      await useAuthStore.getState().setUser({ ...user!, blockedUsers: currentBlocked.filter((id) => id !== Number(currentProfile.id)) });
      toast.success(`${currentProfile.name} has been unblocked`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  }, [currentProfile, user]);

  const handleReasonSelected = (reason: string) => {
    setPendingReportReason(reason);
    setShowReportModal(false);
    setShowReportConfirm(true);
  };

  const handleSubmitReport = async () => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.reportUser({
        reportedUserId: Number(currentProfile.id),
        reason: pendingReportReason,
        reporterId: Number(user?.id),
      });
      toast.success(`Report submitted for ${currentProfile.name}`);
      setShowReportConfirm(false);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleConfirmJilt = async () => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.jiltUser(currentProfile.id);
      toast.success(`${currentProfile.name} removed from matches`);
      setShowJiltModal(false);
      setShowMoreOptions(false);
      setTimeout(() => navigate("/app"), 500);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] p-4 profile-match-gradient flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin w-5 h-5" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (isError || !currentProfile) {
    return (
      <div className="min-h-[100dvh] p-4 profile-match-gradient flex items-center justify-center">
        <div className="max-w-sm rounded-[12px] bg-white p-5 text-center shadow-sm">
          <p className="text-[16px] font-semibold text-[#1C1C1C]">
            Unable to load profile
          </p>
          <p className="mt-2 text-sm text-[#77707F]">
            {isError ? handleApiError(error) : "This profile is not available right now."}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-full bg-[#55288D] px-4 py-2 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] px-4 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+5px)] profile-match-gradient flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="w-full max-w-sm transform transition-all duration-300">
          <ProfileCard
            profile={currentProfile}
            onMessage={handleMessage}
            onMore={() => setShowMoreOptions(true)}
            shouldBlurImages={!personalChatAccess.canShareMedia}
          />
        </div>
      </div>

      <MoreOptionsModal
        isOpen={showMoreOptions}
        profile={currentProfile}
        isBlocked={isPartnerBlocked}
        onClose={() => setShowMoreOptions(false)}
        onProceedToDate={handleProceedToDate}
        onSponsorPlan={() => setShowSponsorModal(true)}
        onBlock={() => setShowBlockConfirm(true)}
        onUnblock={handleUnblockUser}
        onReport={() => setShowReportModal(true)}
        onJilt={() => setShowJiltModal(true)}
      />

      <ReportModal
        isOpen={showReportModal}
        userName={currentProfile?.name ?? ""}
        userImage={currentProfile?.image}
        userLocation={currentProfile?.location}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReasonSelected}
      />

      <ConfirmDialog
        isOpen={showReportConfirm}
        title="Report User"
        message={`Report ${currentProfile?.name ?? "this user"} for "${pendingReportReason}"? Your report is anonymous.`}
        confirmText="Report"
        cancelText="Cancel"
        isDangerous
        isLoading={isPerformingAction}
        onClose={() => setShowReportConfirm(false)}
        onConfirm={handleSubmitReport}
      />

      <ConfirmDialog
        isOpen={showBlockConfirm}
        title="Block Match"
        message={`Are you sure you want to block ${currentProfile?.name ?? "this user"}? They will no longer be able to message you.`}
        confirmText="Block"
        cancelText="Cancel"
        isDangerous
        isLoading={isPerformingAction}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleConfirmBlock}
      />

      <JiltModal
        isOpen={showJiltModal}
        userName={currentProfile?.name}
        userImage={currentProfile?.image}
        userLocation={currentProfile?.location}
        blurImage={!personalChatAccess.canShareMedia}
        onClose={() => setShowJiltModal(false)}
        onConfirm={handleConfirmJilt}
        isLoading={isPerformingAction}
      />

      <SponsorModal
        isOpen={showSponsorModal}
        userName={currentProfile?.name}
        userImage={currentProfile?.image}
        onClose={() => setShowSponsorModal(false)}
        onConfirm={handleConfirmSponsor}
        isLoading={isPerformingAction}
      />
    </div>
  );
};

export default MatchProfile;
