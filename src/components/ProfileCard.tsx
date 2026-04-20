import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MoreVertical,
  MessageCircleMore,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, DrinkIcon, GradIcon, ReligionIcon, SmokeIcon, WorkIcon } from "./icons";

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

interface ProfileCardProps {
  profile: Profile;
  onMessage: () => void;
  onMore: () => void;
  shouldBlurImages?: boolean;
}

// ── helpers ────────────────────────────────────────────────────────────────────

const EssentialRow = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => {
  if (!label) return null;
  return (
    <div className="flex items-center gap-3 py-1">
      <Icon />
      <span className="text-sm text-[#77707F]">{label}</span>
    </div>
  );
};

// ── component ──────────────────────────────────────────────────────────────────

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onMessage,
  onMore,
  shouldBlurImages = true,
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  function formatText(value: any) {
    if (!value) return "";

    return value
      // add space before capital letters
      .replace(/([A-Z])/g, " $1")
      // capitalize first letter
      .replace(/^./, (str: any) => str.toUpperCase());
  }
  const images =
    profile?.images && profile?.images?.length > 0
      ? profile?.images
      : [profile?.image];

  useEffect(() => {
    if (currentImageIndex < images.length) return;
    setCurrentImageIndex(0);
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    if (!shouldBlurImages || images.length < 2) return;

    const intervalId = window.setInterval(() => {
      setCurrentImageIndex((current) => (current + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [images.length, shouldBlurImages]);


  const showPreviousImage = () => {
    setCurrentImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((current) => (current + 1) % images.length);
  };

  const { essentials, interests } = profile;
 


  return (
    <div className="w-full">
      {/* ── Hero image ── */}
      <div className="relative h-96 ">


        <div className="w-full h-full rounded-[8px] overflow-hidden">
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={profile.name}
            className={`w-full h-full object-cover ${
              shouldBlurImages ? "blur" : ""
            }`}
          />
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

           <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Show previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition-colors hover:bg-black/60"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              aria-label="Show next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition-colors hover:bg-black/60"
            >
              <ChevronRight size={16} />
            </button>
          </>
 
        {/* Image dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentImageIndex
                  ? "bg-white w-4"
                  : "bg-white/50 w-1.5"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="mt-6">

        {/* Name + compatibility */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl !capitalize font-semibold text-[#1C1C1C]">
              {profile.name}
            </h2>
            {profile.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} color="#D400B3" />
                <span className="text-sm font-medium text-[#77707F]">
                  {profile.location}
                </span>
              </div>
            )}
          </div>
          {/* {profile.personalityPercentage > 0 && ( */}
          <div className="bg-[#D400B3] text-white rounded-full px-3 py-2 flex items-center gap-1 shrink-0 ml-2">
            <Heart size={16} className="fill-current" />
            <span className="font-medium text-xs">{profile?.personalityPercentage}%</span>
          </div>
          {/* )} */}
        </div>

        {/* About Me */}
        <div className="mt-6">
          <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-2">
            About Me
          </h3>
          <p className="text-[#77707F] text-sm leading-relaxed">{profile.about}</p>
        </div>

        {/* Personality Result */}
        {profile.personalityResult && (
          <div className="mt-6">
            <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-2">
              Personality Result
            </h3>
            <p className="text-[#77707F] text-sm leading-relaxed mb-3">
              {profile.personalityResult}
            </p>
            {profile.flags && profile.flags.length > 0 && (
              <div className="flex gap-2">
                {profile.flags.map((flag, idx) => (
                  <span key={idx} className="text-xl">{flag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Essentials */}
        <div className="mt-6">
          <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-2">
            Essentials
          </h3>
          <div className="space-y-0.5">

            {
              essentials.dob && <EssentialRow
                icon={CalendarIcon}
                label={essentials.dob ? `${essentials.dob} years` : ""}
              />
            }

            {
              essentials.education && <EssentialRow
                icon={GradIcon}
                label={essentials.education || ""}
              />
            }
            {
              essentials.occupation && <EssentialRow
                icon={WorkIcon}
                label={essentials.occupation || ""}
              />
            }
            {
              essentials.religion && <EssentialRow
                icon={ReligionIcon}
                label={essentials.religion || ""}
              />
            }
            {
              essentials.drinkRate && <EssentialRow
                icon={DrinkIcon}
                label={
                  essentials.drinkRate
                    ? `${formatText(essentials.drinkRate)} `
                    : ""
                }
              />
            }
            {
              essentials.smokeRate && <EssentialRow
                icon={SmokeIcon}
                label={
                  essentials.smokeRate
                    ? `${formatText(essentials.smokeRate)}`
                    : ""
                }
              />
            }
          </div>
        </div>

        {/* Interests */}
        {interests && interests.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-[16px] text-[#1C1C1C] mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <button
                  key={idx}
                  className="px-4 py-2 border bg-[#FAF8FB] text-[#77707F] rounded-full text-xs border-[#54278C26]"
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-6">
          <Button
            onClick={onMessage}
            className="flex-1 bg-[#55288D] hover:bg-[#3e1a6e] text-white rounded-full h-12 font-semibold flex items-center justify-center gap-2"
          >
            <MessageCircleMore className="fill-current" size={20} />
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
