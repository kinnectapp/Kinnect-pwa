import { SuccessIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";

const DealbreakerPrompt = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundSize: "contain",
      }}
      className="h-[100dvh]  flex  px-6 pt-8 pb-6 "
    >
      <div className="flex flex-1 gap-3 justify-center flex-col items-center">
        <img src={Logo} className="mb-6" alt="" />
        <h2 className="text-center  text-[24px] font-semibold text-[#1C1C1C]">
          Deal Breaker
        </h2>
        <p className="mt-3 text-center text-[14px] max-w-[350px] mx-auto leading-relaxed text-[#1C1C1C]">
          Set your Deal Breakers by selecting your preferences from each field.
          Please note that your choices are ranked from your most desired
          quality in a potential partner, to the least desired (from 5 to 0).
          And remember, be a little flexible as you rank.
        </p>

        <div className="mt-6 w-full space-y-5">
          <Button
            type="button"
            onClick={() => navigate("/onboarding/dealbreaker_q")}
            className="w-full "
          >
            Get Started
          </Button>
          <Button
            variant={"ghost"}
            type="button"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DealbreakerPrompt;
