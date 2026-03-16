"use client";

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

interface Profile {
  id: string;
  name: string;
  location: string;
  age: number;
  compatibility: number;
  image: string;
  about: string;
  personalityResult: string;
  flags: string[];
  essentials: string[];
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

  // Fetch all matches to find the specific one
  const { data: matchesData, isLoading: isLoadingMatches } =
    useGetProfileMatches();

  // Find the current match by ID
  const currentMatchItem = useMemo(() => {
    if (!matchesData || !id) return null;
    return matchesData.find((item) => item.profile.id === Number(id));
  }, [matchesData, id]);

  // Transform match data to Profile interface format
  const currentProfile: Profile | null = useMemo(() => {
    if (!currentMatchItem) return null;

    const { profile, value } = currentMatchItem;
    return {
      id: String(profile.id),
      name: profile.username || "Unknown User",
      location: `${profile.state || ""}, ${profile.country || ""}`.trim(),
      age: profile.age || 0,
      compatibility: Number(value || 0),
      image: profile.image || UserImage,
      about: profile.bio || "No bio available",
      personalityResult: "Personality test result pending...",
      flags: [],
      essentials: [],
      interests: [],
    };
  }, [currentMatchItem]);

  const handleMessage = async () => {
    if (!currentProfile) return;
    try {
      const channelId = await chatService.ensurePersonalChannel(
        currentProfile.id,
      );
      navigate(`/app/chats/${channelId}`);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleMore = () => {
    if (currentProfile) {
      console.log("[v0] More options opened for:", currentProfile.name);
      setShowMoreOptions(true);
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

  const handleSponsorPlan = async () => {
    setShowSponsorModal(true);
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

  const handleBlock = async () => {
    setShowBlockModal(true);
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

  const handleReport = async () => {
    setShowReportModal(true);
  };

  const handleConfirmReport = async (reason: string) => {
    if (!currentProfile) return;
    try {
      setIsPerformingAction(true);
      await chatService.reportUser({
        reportedUserId: currentProfile.id,
        reason,
      });
      toast.success(`Report submitted for ${currentProfile.name}`);
      setShowReportModal(false);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleJilt = async () => {
    setShowJiltModal(true);
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

  if (isLoadingMatches) {
    return (
      <div className="min-h-screen p-4 profile-match-gradient flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin w-5 h-5" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen p-4 profile-match-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Match not found</p>
          <button
            onClick={() => navigate("/app")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 profile-match-gradient flex items-center justify-center  ">
      {/* Cards Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Current Card */}
        <div className="w-full max-w-sm transform transition-all duration-300">
          <ProfileCard
            profile={currentProfile}
            onMessage={handleMessage}
            onMessage={handleMessage}
            onMore={handleMore}
          />
        </div>
      </div>

      {/* More Options Modal */}
      <MoreOptionsModal
        isOpen={showMoreOptions}
        profile={currentProfile}
        onClose={() => setShowMoreOptions(false)}
        onProceedToDate={handleProceedToDate}
        onSponsorPlan={handleSponsorPlan}
        onBlock={handleBlock}
        onReport={handleReport}
        onJilt={handleJilt}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        userName={currentProfile.name}
        userImage={currentProfile.image}
        userLocation={currentProfile.location}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleConfirmReport}
        isLoading={isPerformingAction}
      />

      {/* Block Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBlockModal}
        title="Block Match"
        message={`Are you sure you want to block ${currentProfile.name}? They will no longer be able to see or interact with you. And the user will no longer appear on your feed`}
        userImage={currentProfile.image}
        userLocation={currentProfile.location}
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
        userImage={currentProfile.image}
        userLocation={currentProfile.location}
        confirmText="Jilt"
        isDangerous
        onClose={() => setShowJiltModal(false)}
        onConfirm={handleConfirmJilt}
        isLoading={isPerformingAction}
      />

      {/* Sponsor Modal */}
      <SponsorModal
        isOpen={showSponsorModal}
        userName={currentProfile.name}
        userImage={currentProfile.image}
        onClose={() => setShowSponsorModal(false)}
        onConfirm={handleConfirmSponsor}
        isLoading={isPerformingAction}
      />
    </div>
  );
};

export default MatchProfile;
