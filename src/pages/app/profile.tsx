import React from "react";
import {
  Bell,
  BookOpenText,
  ChevronRight,
  CircleHelp,
  FileText,
  Lock,
  LogOut,
  MessageCircleQuestion,
  Shield,
  Star,
  Trash2,
  User,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const displayName =
    `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() ||
    user?.username ||
    "Kinnect User";
  const displayEmail = user?.email || "no-email@kinnect.app";
  const profilePhoto =
    (Array.isArray(user?.profilePhotos) ? user?.profilePhotos[0] : null) ||
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80";

  const menuItems = [
    { icon: User, label: "My Profile", onClick: () => navigate("/app/my-profile") },
    { icon: WalletCards, label: "Subscriptions" },
    {
      icon: BookOpenText,
      label: "Book A Coaching Session",
      onClick: () => navigate("/onboarding/booksession"),
    },
    { icon: Bell, label: "Notifications" },
    {
      icon: Lock,
      label: "Change Password",
      onClick: () => navigate("/app/my-profile?modal=changePassword"),
    },
    { icon: Star, label: "Rating & Review" },
    { icon: CircleHelp, label: "Frequently Asked Questions (FAQs)" },
    { icon: MessageCircleQuestion, label: "Need Help with App" },
    { icon: FileText, label: "Terms & Conditions" },
    { icon: Shield, label: "Privacy Policy" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF] pb-24">
      <div className="h-[92px] bg-gradient-to-r from-[#450f77] via-[#65195c70] to-[#7e016b]" />

      <div className="px-4 -mt-12">
        <div className="mx-auto h-[88px] w-[88px] rounded-full border-2 border-[#D400B3] bg-white p-[2px]">
          <img
            src={profilePhoto}
            alt="Profile"
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        <div className="mt-3 text-center">
          <h1 className="text-[34px] font-semibold text-[#1C1C1C]">
            {displayName}
          </h1>
          <p className="text-[14px] text-[#7B7B88]">{displayEmail}</p>
          <button
            type="button"
            className="mt-2 text-[14px] font-medium text-[#D400B3] underline"
            onClick={() => navigate("/app/my-profile")}
          >
            Review Profile
          </button>
        </div>

        <div className="mt-5 rounded-[10px] bg-[#21003F] p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#D7CBE6]">Profile Strength</p>
              <p className="text-[34px] font-semibold leading-none">
                60% Completed
              </p>
            </div>
            <ChevronRight size={20} className="text-[#D7CBE6]" />
          </div>
          <p className="mt-3 text-[13px] text-[#D7CBE6]">
            Complete your profile now to get more matches
          </p>
        </div>

        <div className="mt-4 rounded-[10px] bg-[#FAF8FB] px-4 py-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className="text-[#9B9BAC]" />
                <span className="text-[16px] text-[#5D5D6D]">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-[#88889A]" />
            </button>
          ))}

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/auth/login", { replace: true });
            }}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-[#F04438]" />
              <span className="text-[16px] text-[#D92D20]">Logout</span>
            </div>
            <ChevronRight size={16} className="text-[#88889A]" />
          </button>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-between rounded-[10px] border border-[#E3E3EA] bg-white px-4 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-[#F04438]" />
            <span className="text-[16px] text-[#1C1C1C]">
              Delete My Account
            </span>
          </div>
          <ChevronRight size={16} className="text-[#88889A]" />
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
