// ProfileComplete.tsx
import { SuccessIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
 import {  useNavigate } from "react-router-dom";
import Confetti from "../../assets/images/confetti.svg";
import { ArrowRight } from "lucide-react";

const ProfileComplete = () => {
    const navigate = useNavigate()
  return (

    <div
      style={{
        backgroundImage: `url(${Confetti})`,
        backgroundSize: "contain",
      }}
      className="h-[100dvh]  flex  px-6 pt-8 pb-6 "
    >
      <div className="flex flex-1 gap-3 justify-center flex-col items-center">
        <SuccessIcon />
        <h2 className="text-center  text-[24px] font-semibold text-[#1C1C1C]">
          Profile Completed
        </h2>
        <p className="mt-3 text-center text-[14px] max-w-[350px] mx-auto leading-relaxed text-[#1C1C1C]">
          Congratulations! Your profile is now complete! This is a crucial step
          in our matching process.
        </p>

        <div className="mt-5 w-full rounded-[8px] bg-[#1E073A] text-white max-w-[350px] text-center  text-[14px] leading-relaxed  ">
          <div className="border-b border-dashed py-2 px-4">
            <p className="text-center text-xs">Profile Strength</p>

            <div className="">60% Completed</div>
          </div>
          <div className="p-4 ">
            <Button onClick={() => navigate("/onboarding/dealbreaker")} className="flex w-full bg-white text-[#55288D] text-[12px] items-center justify-center gap-2">
              Select Deal Breakers{" "}
              <span className="p-[2px] rounded-full flex justify-center items-center bg-[#55288D] text-white">
                <ArrowRight className="w-3 h-3 " />
              </span>
            </Button>
          </div>
        </div>

        <div className="mt-6 w-full space-y-5">
          <Button
            type="button"
              onClick={() => navigate("/onboarding/dealbreaker")}
            className="w-full "
          >
            Find A Match
          </Button>
        
        </div>
      </div>
    </div>
  );
};

export default ProfileComplete;
