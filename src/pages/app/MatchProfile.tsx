

import React, { useState, useMemo } from "react";
import ProfileCard from "@/components/ProfileCard";
import MoreOptionsModal from "@/components/MoreOptionsModal";
import ReportModal from "@/components/chat/ReportModal";
import ConfirmationModal from "@/components/chat/ConfirmationModal";
import SponsorModal from "@/components/chat/SponsorModal";
import { useNavigate, useParams } from "react-router-dom";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { useGetProfileMatches } from "@/services/profile.service";
import { Loader } from "lucide-react";
import UserImage from "../../assets/images/user-profile.png";

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

export const MatchProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showJiltModal, setShowJiltModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const { data: matchesData, isLoading } = useGetProfileMatches();

  const currentMatchItem = useMemo(() => {
    if (!matchesData || !id) return null;
    return matchesData.find((item: any) => item.profile.id === Number(id));
  }, [matchesData, id]);

  const currentProfile: Profile | null = useMemo(() => {
    if (!currentMatchItem) return null;
    console.log("currentMatchItem", currentMatchItem);
    const { profile,
      //  value 
    } = currentMatchItem;

    const images: string[] =
      profile.profilePhotos && profile.profilePhotos.length > 0
        ? profile.profilePhotos
        : [UserImage];

    let age = profile.age || 0;
    if (!age && profile.dob) {
      age = Math.floor(
        (Date.now() - new Date(profile.dob).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
      );
    }

    return {
      id: String(profile.id),
      name:
        profile.firstname && profile.lastname
          ? `${profile.firstname} ${profile.lastname}`
          : profile.username || "Unknown User",
      location: [profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(", "),
      dob: String(age),
      // personalityPercentage: String(value || 0),
      personalityPercentage: String(Number(profile.personalityPercentage).toFixed() || 0),

      image: images[0],
      images,
      about: profile.bio || "No bio available",
      personalityResult: profile.personalitySummary || "",
      flags: [],
      essentials: {
        dob: String(age),
        education: profile.education,
        occupation: profile.occupation,
        religion: profile.religion,
        drinkRate: profile.drinkRate,
        smokeRate: profile.smokeRate,
      },
      interests: profile.interests || [],
    };
  }, [currentMatchItem]);

  const handleMessage = async () => {
    if (!currentProfile) return;
    try {
      const channelId = await chatService.ensurePersonalChannel(currentProfile.id);
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
      toast.success(`${currentProfile.name} has been blocked`);
      setShowBlockModal(false);
      setShowMoreOptions(false);
      setTimeout(() => navigate("/app"), 500);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleConfirmReport = async (reason: string) => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.reportUser({ reportedUserId: currentProfile.id, reason });
      toast.success(`Report submitted for ${currentProfile.name}`);
      setShowReportModal(false);
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

  if (isLoading || !currentProfile) {
    return (
      <div className="min-h-screen p-4 profile-match-gradient flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin w-5 h-5" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

   

  return (
    <div className="min-h-screen p-4 profile-match-gradient flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="w-full max-w-sm transform transition-all duration-300">
          <ProfileCard
            profile={currentProfile}
            onMessage={handleMessage}
            onMore={() => setShowMoreOptions(true)}
          />
        </div>
      </div>

      <MoreOptionsModal
        isOpen={showMoreOptions}
        profile={currentProfile}
        onClose={() => setShowMoreOptions(false)}
        onProceedToDate={handleProceedToDate}
        onSponsorPlan={() => setShowSponsorModal(true)}
        onBlock={() => setShowBlockModal(true)}
        onReport={() => setShowReportModal(true)}
        onJilt={() => setShowJiltModal(true)}
      />

      <ReportModal
        isOpen={showReportModal}
        userName={currentProfile?.name}
        userImage={currentProfile?.image}
        userLocation={currentProfile?.location}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleConfirmReport}
        isLoading={isPerformingAction}
      />

      <ConfirmationModal
        isOpen={showBlockModal}
        title="Block Match"
        message={`Are you sure you want to block ${currentProfile?.name}? They will no longer be able to see or interact with you. And the user will no longer appear on your feed`}
        userImage={currentProfile?.image}
        userLocation={currentProfile?.location}
        confirmText="Block"
        isDangerous
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleConfirmBlock}
        isLoading={isPerformingAction}
      />

      <ConfirmationModal
        isOpen={showJiltModal}
        title="Jilt Match"
        message={`Are you sure you want to jilt this match? By jilting this match, it means you are no longer interested and want to put off this conversation.`}
        userImage={currentProfile?.image}
        userLocation={currentProfile?.location}
        confirmText="Jilt"
        isDangerous
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