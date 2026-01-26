"use client";

import React, { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import MoreOptionsModal from "@/components/MoreOptionsModal";

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
   const [showMoreOptions, setShowMoreOptions] = useState(false);

  const currentProfile = mockProfiles;

  const handleMessage = () => {
    console.log("[v0] Message clicked for:", currentProfile.name);
    alert(`Opening message chat with ${currentProfile.name}`);
  };

  const handleMore = () => {
    console.log("[v0] More options opened for:", currentProfile.name);
    setShowMoreOptions(true);
  };

  const handleProceedToDate = () => {
    console.log("[v0] Proceed to date:", currentProfile.name);
    alert(`Proceeding to schedule a date with ${currentProfile.name}`);
    setShowMoreOptions(false);
  };

  const handleSponsorPlan = () => {
    console.log("[v0] Sponsor plan clicked:", currentProfile.name);
    alert(`Opening sponsor plan for ${currentProfile.name}`);
    setShowMoreOptions(false);
  };

  const handleBlock = () => {
    console.log("[v0] Block user:", currentProfile.name);
    alert(`${currentProfile.name} has been blocked`);
    setShowMoreOptions(false);
  };

  const handleReport = () => {
    console.log("[v0] Report user:", currentProfile.name);
    alert(`Report submitted for ${currentProfile.name} (anonymous)`);
    setShowMoreOptions(false);
  };

  const handleJilt = () => {
    console.log("[v0] Jilt user:", currentProfile.name);
    alert(`${currentProfile.name} removed from matches`);
    setShowMoreOptions(false);
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
