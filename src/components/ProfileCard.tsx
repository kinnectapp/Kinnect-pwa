"use client";

import React from "react";
import {
  ChevronLeft,
  Heart,
  MoreVertical,
  MessageCircleMoreIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationIcon } from "./icons";
import { useNavigate } from "react-router-dom";

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

interface ProfileCardProps {
  profile: Profile;

  onMessage: () => void;
  onMore: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,

  onMessage,
  onMore,
}) => {
  const navigate = useNavigate();
  return (
    <div className=" ">
      <div className="relative h-80 ">
        <img
          src={profile.image || "/placeholder.svg"}
          alt={profile.name}
          className="w-full h-full rounded-[8px] object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="  mt-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C1C1C]">
              {profile.name}
            </h2>
            <div className="flex items-center gap-1 text-[#77707F] mt-1">
              <LocationIcon color="#D400B3" />
              <span className="text-sm font-medium text-[#77707F]">
                {profile.location}
              </span>
            </div>
          </div>
          <div className="bg-[#D400B3] text-white rounded-full px-3 py-2 flex items-center gap-1">
            <Heart size={16} className="fill-current" />
            <span className="font-medium text-xs">
              {profile.compatibility}%
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-2">
            About Me
          </h3>
          <p className="text-[#77707F] text-sm leading-relaxed">
            {profile.about}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-2">
            Personality Result
          </h3>
          <p className="text-[#77707F] text-sm leading-relaxed mb-3">
            {profile.personalityResult}
          </p>
          <div className="flex gap-2">
            {profile.flags.map((flag, idx) => (
              <span key={idx} className="text-xl">
                {flag}
              </span>
            ))}
          </div>
        </div>

        {/* Essentials */}
        <div className="mt-6">
          <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-3">
            Essentials
          </h3>
          <div className="space-y-2">
            {profile.essentials.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-[#77707F] text-sm"
              >
                <span className="text-gray-400">📋</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="mt-6">
          <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-3">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, idx) => (
              <button
                key={idx}
                className="px-4 py-2 border-[1px] bg-[#FAF8FB] text-[#77707F] rounded-full text-xs    border-[#54278C26]"
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-6">
          <Button
            onClick={onMessage}
            className="flex-1 bg-[#55288D] hover:from-purple-700 hover:to-purple-800 text-white rounded-full h-12 font-semibold flex items-center justify-center gap-2"
          >
            <MessageCircleMoreIcon className="fill-current" size={20} />
            Message
          </Button>
          <Button
            onClick={onMore}
            variant="outline"
            className="w-12 h-12 p-0 rounded-full border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
