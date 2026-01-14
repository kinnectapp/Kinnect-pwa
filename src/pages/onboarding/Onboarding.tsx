import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";
import BgPattern from "../../assets/images/onboarding-pattern.svg";
import { PersonalityIcon, StarIcon } from "@/components/icons";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: `url(${BgPattern})`,

        backgroundSize: "contain",
      }}
      className="flex h-[100dvh] flex-col px-6 pt-10 pb-8 bg-[#FFF7FF] bg-[length:220px_220px] bg-[radial-gradient(circle_at_1px_1px,#E9E0FF_1px,transparent_0)]"
    >
      {/* top logo */}
      <div className="flex justify-center">
        <img src={Logo} alt="Kinnect" className="h-12 w-12" />
      </div>

      {/* title + copy */}
      <div className="mt-8 text-center">
        <h1 className="text-[24px] font-semibold text-[#1C1C1C]">
          Let’s get to know you!
        </h1>
        <p className="mt-3 max-w-[350px] m-auto text-[14px] leading-relaxed text-[#1C1C1C]">
          The personalized pre-coaching quiz set is a series of fun-friendly
          questions to enable us know you more.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#1C1C1C]">
          Your personalized quiz consists of the following:
        </p>
      </div>

      {/* middle content */}
      <div className="mt-10 flex flex-1 flex-col items-center justify-start gap-10">
        {/* Interests */}
        <div className="flex flex-col items-center gap-3">
          <StarIcon />
          <span className="text-[20px] font-semibold text-[#1C1C1C]">
            Interests
          </span>
        </div>

        {/* Personality Test */}
        <div className="flex flex-col items-center gap-3">
          <PersonalityIcon />
          <span className="text-[20px] font-semibold text-[#1C1C1C]">
            Personality Test
          </span>
        </div>
      </div>

      {/* bottom button */}
      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          variant={"secondary"}
          onClick={() => navigate("/onboarding/interests")}
          className="w-full flex gap-4 items-center justify-center"
        >
          <span>Get Started</span>
          <span className="text-lg">→</span>
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
