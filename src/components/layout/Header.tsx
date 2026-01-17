import { Bell, User } from "lucide-react";
import React from "react";
import { Logo } from "./logo";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <Logo />

      <div className="flex items-center gap-3">
        {/* User avatar */}
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-purple-500/80 flex items-center justify-center overflow-hidden">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-pink-500/80 flex items-center justify-center overflow-hidden">
            <Bell className="h-5 w-5 text-white" />
          </div>

          <span className="absolute -top-1 -right-1 h-5 w-5 bg-pink-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
            2
          </span>
        </div>
      </div>
    </header>
  );
};
