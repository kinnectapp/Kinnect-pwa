import React from "react";
import { useNavigate } from "react-router-dom";
import PersonalityBanner from "../../assets/images/personalityBanner.jpg";
import { Button } from "@/components/ui/button";

const PersonalityIntro: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[100dvh] flex-col bg-[#F9F9F9] px-6 pt-10 pb-8">
      <div className="flex justify-center">
        <img
          src={PersonalityBanner} // swap with your asset
          alt="Personality test"
          className="max-w-[500px] w-[90vw]  rounded-xl"
        />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-[24px] max-w-[300px] text-center m-auto font-semibold text-[#1C1C1C]">
          Complete Your Personality Test
        </h1>
        <p className="mt-3 max-w-[350px] font-medium m-auto text-[14px] leading-relaxed text-[#1C1C1C]">
          Unlock deeper connections!
        </p>
      </div>

      <div className="mt-auto space-y-5 pt-6">
        <Button
          type="button"
          onClick={() => navigate("/onboarding/personality_test")}
          className="w-full "
        >
          Get Started
        </Button>

        <Button
          type="button"
          variant={"secondary"}
          onClick={() => navigate("/app")} // or wherever "Maybe Later" goes
          className="w-full"
        >
          Maybe Later
        </Button>
      </div>
    </div>
  );
};

export default PersonalityIntro;
