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
    <header className="flex z-[9999] items-center justify-between sticky top-0 bg-white px-4 py-4">
      <div className="" onClick={() => navigate("/app")}>
        <Logo />
      </div>

      <div className="flex items-center gap-3">
        {/* User avatar */}
        <div className="relative">
          <div
            onClick={() => navigate("/app/profile")}
            className="h-9 w-9 rounded-full bg-[#F2EAFC] flex items-center justify-center overflow-hidden"
          >
            <UserProfiileIcon />
          </div>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <div
            onClick={() => navigate("/app/notifications")}
            className="h-9 w-9 rounded-full bg-[#F6EFF5] flex items-center justify-center overflow-hidden"
          >
            <BellIcon />
          </div>

          {showBadge && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#920874] text-white text-[8px] font-medium rounded-full flex items-center justify-center">
              {displayCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
