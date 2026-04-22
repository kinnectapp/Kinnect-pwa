import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";
import BgPattern from "../../assets/images/onboarding-pattern.svg";
import { DealbreakerIcon,  ProfilesetupIcon } from "@/components/icons";

const MakeConnectionPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: `url(${BgPattern})`,

        backgroundSize: "contain",
      }}
      className="flex min-h-[100dvh] flex-col bg-[#FFF7FF] bg-[length:220px_220px] bg-[radial-gradient(circle_at_1px_1px,#E9E0FF_1px,transparent_0)] px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+2.5rem)]"
    >
      {/* top logo */}
      <div className="flex justify-center">
        <img src={Logo} alt="Kinnect" className="h-12 w-12" />
      </div>

      {/* title + copy */}
      <div className="mt-8 text-center">
        <h1 className="text-[24px] font-semibold text-[#1C1C1C]">
          Make Connections
        </h1>
        <p className="mt-3 max-w-[350px] m-auto text-[14px] leading-relaxed text-[#1C1C1C]">
          On Kinnect, craft a profile that reflects your unique personality,
          interests, and values, then define your non-negotiables with our Deal
          Breaker Setup. This helps you connect with like-minded individuals who
          share your essential criteria, fostering authentic relationships.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#1C1C1C]">
        You need to complete the following in order to make connections:
        </p>
      </div>

      {/* middle content */}
      <div className="mt-10 flex flex-1 flex-col items-center justify-start gap-10">
        {/* Interests */}
        <div className="flex flex-col items-center gap-3">
          <ProfilesetupIcon />
          <span className="text-[20px] font-semibold text-[#1C1C1C]">
           Profile Setup
          </span>
        </div>

        {/* Personality Test */}
        <div className="flex flex-col items-center gap-3">
          <DealbreakerIcon />
          <span className="text-[20px] font-semibold text-[#1C1C1C]">
          Dealbreakers
          </span>
        </div>
      </div>

      {/* bottom button */}
      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          variant={"secondary"}
          onClick={() => navigate("/onboarding/profile-setup")}
          className="w-full flex gap-4 items-center justify-center"
        >
          <span>Get Started</span>
          <span className="text-lg">→</span>
        </Button>
      </div>
    </div>
  );
};

export default MakeConnectionPrompt;
