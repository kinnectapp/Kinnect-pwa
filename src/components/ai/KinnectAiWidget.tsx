import React, { useMemo } from "react";
import { Bot, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { KinnectAiProvider } from "@/services/kinnect-ai.service";

type KinnectAiWidgetProps = {
  provider?: KinnectAiProvider;
  visibleRoutes?: string[];
};

const routeMatches = (pathname: string, visibleRoutes: string[]) =>
  visibleRoutes.some((route) =>
    route === "/app" ? pathname === route : pathname.startsWith(route),
  );

export const KinnectAiWidget: React.FC<KinnectAiWidgetProps> = ({
  provider = "openai",
  visibleRoutes = ["/app", "/app/community", "/app/chats"],
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isVisible = useMemo(
    () => routeMatches(location.pathname, visibleRoutes),
    [location.pathname, visibleRoutes],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/app/kinnect-ai", { state: { provider } })}
        className="fixed bottom-24 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#55288D] to-[#C2188B] text-white shadow-[0_14px_30px_rgba(85,40,141,0.35)]"
        aria-label="Open Kinnect AI"
      >
        <MessageCircle size={22} />
      </button>

      <div className="fixed bottom-40 right-4 z-[999] rounded-full border border-[#EADCF5] bg-white px-3 py-2 text-xs font-medium text-[#5B2C8C] shadow-sm">
        <span className="inline-flex items-center gap-2">
          <Bot size={14} />
          Chat with Kinnect AI
        </span>
      </div>
    </>
  );
};
