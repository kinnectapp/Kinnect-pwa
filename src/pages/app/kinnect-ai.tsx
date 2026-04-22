import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KinnectAiChatView } from "@/components/ai/KinnectAiChatView";

const KinnectAiPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-white pb-6">
      <div className="sticky top-0 z-10 bg-white px-4 py-3">
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

      <div className=" ">
        <KinnectAiChatView />
      </div>
    </div>
  );
};

export default KinnectAiPage;
