import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KinnectAiProvider } from "@/services/kinnect-ai.service";
import { Logo } from "../layout/logo";

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
  visibleRoutes = ["/app", "/app/community"],
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
        className="fixed border bottom-24 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full  shadow-[0_14px_30px_rgba(85,40,141,0.35)]"
        aria-label="Open Kiki"
      >
        <Logo />
        {/* <MessageCircle size={22} /> */}
      </button>

      <div className="fixed bottom-40 right-4 z-[999] rounded-full border border-[#EADCF5] bg-white px-3 py-2 text-xs font-medium text-[#5B2C8C] shadow-sm">
        <span className="inline-flex items-center gap-2">Chat with Kiki</span>
      </div>
    </>
  );
};
