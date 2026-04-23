import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KinnectAiChatView } from "@/components/ai/KinnectAiChatView";

const KinnectAiPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-white pb-[calc(env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top))]">
      <div className="fixed border-b inset-x-0 top-0 z-10 bg-white">
        <div className="mx-auto w-full max-w-[1025px] px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
          >
            <ChevronLeft size={18} className="text-[#5A2B8D]" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#55288D]">
            Kiki
          </h1>
          </div>
        </div>
      </div>

     
        <KinnectAiChatView /> 
     

     
    </div>
  );
};

export default KinnectAiPage;
