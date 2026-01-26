import React from "react";
import { Link, useLocation } from "react-router-dom";
 import { ChatIcon, CommunityNavIcon, HomeIcon, ProfileIcon } from "../icons";

const navItems = [
  { href: "/app", label: "Home", icon: HomeIcon },
  { href: "/app/community", label: "Community", icon: CommunityNavIcon },
  { href: "/app/chats", label: "Chats", icon: ChatIcon },
  { href: "/app/profile", label: "Profile", icon: ProfileIcon },
];

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors ${
                isActive ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon />
              <span className={isActive ? "font-medium" : ""}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
