import React from "react";
import { Logo } from "./logo";
import { BellIcon, UserProfiileIcon } from "../icons";
import { useNavigate } from "react-router-dom";
import { useUnreadNotifications } from "@/services/notification.service";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadNotifications();
  const showBadge = unreadCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] bg-white">
      <div className="mx-auto flex w-full max-w-[1025px] items-center justify-between px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div onClick={() => navigate("/app")}>
          <Logo />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              onClick={() => navigate("/app/profile")}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#F2EAFC]"
            >
              <UserProfiileIcon />
            </div>
          </div>

          <div className="relative">
            <div
              onClick={() => navigate("/app/notifications")}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#F6EFF5]"
            >
              <BellIcon />
            </div>

            {showBadge && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#920874] px-1 text-[8px] font-medium text-white">
                {displayCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
