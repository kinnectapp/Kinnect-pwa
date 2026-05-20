import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChatIcon, CommunityNavIcon, HomeIcon, ProfileIcon } from "../icons";
import { useChatStore } from "@/store/chat.store";

const navItems = [
  { href: "/app", label: "Home", icon: HomeIcon },
  { href: "/app/community", label: "Community", icon: CommunityNavIcon },
  { href: "/app/chats", label: "Chats", icon: ChatIcon },
  { href: "/app/profile", label: "Profile", icon: ProfileIcon },
];

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const personalChannels = useChatStore((state) => state.personalChannels);
  const communityChannels = useChatStore((state) => state.communityChannels);
  const totalUnread =
    personalChannels.reduce((sum, ch) => sum + ch.unreadCount, 0) +
    communityChannels.reduce((sum, ch) => sum + ch.unreadCount, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[calc(env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md items-center justify-around pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === "/app/chats" && totalUnread > 0;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors ${
                isActive ? "text-pink-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="relative">
                <Icon />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#55288D] px-1 text-[10px] font-bold text-white leading-none">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
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
