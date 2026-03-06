"use client";

import React, { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import MoreOptionsModal from "@/components/MoreOptionsModal";
import { useNavigate } from "react-router-dom";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";

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

const mockProfiles: Profile = {
  id: "1",
  name: "Charlotte Caser",
  location: "Cairo, Egypt",
  age: 24,
  compatibility: 92,
  image:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
  about:
    "Creative soul with a passion for art and literature. Always up for an adventure. Looking for a genuine connection and someone to share laughter and late-night conversations with.",
  personalityResult:
    "Their reliability is a strength, but empathy and emotional stability are areas for improvement, and developing these skills will help them navigate challenging situations.",
  flags: ["🇵🇰", "🇮🇳", "🇧🇩"],
  essentials: [
    "24 years",
    "Bachelor of Science (B.Sc.)",
    "Medical Doctor",
    "Islam",
    "Often Drinker",
    "Not a smoker",
  ],
  interests: [
    "Cooking",
    "Swimming",
    "Dance",
    "Reading",
    "Shopping",
    "Pets",
    "Painting",
  ],
};

export const MatchProfile: React.FC = () => {
  const navigate = useNavigate();
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const currentProfile = mockProfiles;

  const handleMessage = async () => {
    try {
      const channelId = await chatService.ensurePersonalChannel(currentProfile.id);
      navigate(`/app/chats/${channelId}`);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleMore = () => {
    console.log("[v0] More options opened for:", currentProfile.name);
    setShowMoreOptions(true);
  };

  const handleProceedToDate = async () => {
    try {
      await chatService.proceedToDate(currentProfile.id);
      toast.success(`Date request sent to ${currentProfile.name}`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleSponsorPlan = async () => {
    try {
      await chatService.sponsorUser(currentProfile.id);
      toast.success(`Sponsor request sent for ${currentProfile.name}`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleBlock = async () => {
    try {
      await chatService.blockUser(currentProfile.id);
      toast.success(`${currentProfile.name} has been blocked`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleReport = async () => {
    try {
      await chatService.reportUser({
        reportedUserId: currentProfile.id,
        reason: "Reported from profile",
      });
      toast.success(`Report submitted for ${currentProfile.name}`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleJilt = async () => {
    try {
      await chatService.jiltUser(currentProfile.id);
      toast.success(`${currentProfile.name} removed from matches`);
      setShowMoreOptions(false);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="min-h-screen  p-4 profile-match-gradient flex items-center justify-center  ">
      {/* Cards Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Current Card */}
        <div className="w-full max-w-sm transform transition-all duration-300">
          <ProfileCard
            profile={currentProfile}
            onMessage={handleMessage}
            onMore={handleMore}
          />
        </div>
      </div>

      {/* More Options Modal */}
      <MoreOptionsModal
        isOpen={showMoreOptions}
        profile={mockProfiles}
        onClose={() => setShowMoreOptions(false)}
        onProceedToDate={handleProceedToDate}
        onSponsorPlan={handleSponsorPlan}
        onBlock={handleBlock}
        onReport={handleReport}
        onJilt={handleJilt}
      />
    </div>
  );
};

export default MatchProfile;
