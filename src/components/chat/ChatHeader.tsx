import React from "react";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import UserImage from "../../assets/images/user-profile.png";
interface ChatHeaderProps {
  userName?: string;
  userAge?: number;
  lastSeen?: string;
  avatarUrl?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName = "Theressa Webb",
  // userAge = 24,
  // lastSeen = "Wed June 22, 2024",
  // avatarUrl = UserImage,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed left-0 right-0 top-0 z-10 border-b border-gray-200 bg-white px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div className="flex items-center justify-between max-w-full">
        <div onClick={() => navigate(-1)} className="flex items-center gap-3">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="font-semibold text-gray-900 text-sm">
          {userName} <span className="text-gray-400">•</span>
        </h2>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
