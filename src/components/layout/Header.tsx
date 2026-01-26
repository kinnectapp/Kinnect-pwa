 import React from "react";
import { Logo } from "./logo";
import { BellIcon, UserProfiileIcon } from "../icons";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between sticky top-0 bg-white px-4 py-4">
      <Logo />

      <div className="flex items-center gap-3">
        {/* User avatar */}
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-[#F2EAFC] flex items-center justify-center overflow-hidden">
            <UserProfiileIcon  />
          </div>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-[#F6EFF5] flex items-center justify-center overflow-hidden">
            <BellIcon   />
          </div>

          <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#920874] text-white text-[8px] font-medium rounded-full flex items-center justify-center">
            2
          </span>
        </div>
      </div>
    </header>
  );
};
