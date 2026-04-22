import { SuccessIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Confetti from "../../assets/images/confetti.svg";
import { useNavigate } from "react-router-dom";

const SessionConfirmation = () => {
    const navigate = useNavigate()
    
  return (
    <div
      style={{
        backgroundImage: `url(${Confetti})`,
        backgroundSize: "contain",
      }}
      className="flex min-h-[100dvh] px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+2rem)]"
    >
      <div className="flex flex-1 gap-3 justify-center flex-col items-center">
        <SuccessIcon />
        <h2 className="text-center  text-[24px] font-semibold text-[#1C1C1C]">
          Session Booked
        </h2>
        <p className="mt-3 text-center text-[14px] max-w-[350px] mx-auto leading-relaxed text-[#1C1C1C]">
          You have successfully booked a session. You’ll get a confirmation
          message to confirm this booking.
        </p>

        <div className="mt-6 w-full space-y-5">
          <Button
            type="button"
             onClick={() => navigate("/app/chats")}
            className="w-full "
          >
            Back To Chats
          </Button>
          <Button
            variant={"secondary"}
            type="button"
             onClick={() => navigate("/app")}
            className="w-full"
          >
            Go To Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionConfirmation;
