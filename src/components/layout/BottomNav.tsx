import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageCircle, User } from "lucide-react";

const navItems = [
  { href: "/app/", label: "Home", icon: Home },
  { href: "/app/community", label: "Community", icon: Users },
  { href: "/app/chats", label: "Chats", icon: MessageCircle },
  { href: "/app/profile", label: "Profile", icon: User },
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
              <Icon className="h-5 w-5" />
              <span className={isActive ? "font-medium" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};