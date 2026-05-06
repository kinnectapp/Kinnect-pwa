import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KinnectAiChatView } from "@/components/ai/KinnectAiChatView";
import { useAuthStore } from "@/store/auth.store";
import { getSubscriptionPermissions } from "@/lib/subscription";

const KinnectAiPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const permissions = getSubscriptionPermissions(user);
  const hasKikiAccess = permissions.kikiChatAccess !== "none";

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

      {hasKikiAccess ? (
        <KinnectAiChatView />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#F5F0FB] flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#1C1C1C]">
              Meet Kiki, Your AI Dating Coach
            </h2>
            <p className="text-sm text-[#77707F] leading-relaxed">
              Get dating advice, message ideas, profile help, and personalised
              guidance. Kiki is available on Standard, VIP, and Lifetime plans.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/subscriptions")}
            className="w-full max-w-xs rounded-md bg-[#55288D] py-3 text-sm font-medium text-white"
          >
            Upgrade to Unlock Kiki
          </button>
        </div>
      )}
    </div>
  );
};

export default KinnectAiPage;
