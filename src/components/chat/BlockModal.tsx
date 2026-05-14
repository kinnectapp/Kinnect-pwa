import React from "react";
import { X } from "lucide-react";

interface BlockModalProps {
  isOpen: boolean;
  userName?: string;
  userImage?: string;
  userLocation?: string;
  blurImage?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  userName,
  userImage,
  userLocation,
  blurImage = false,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[999999]">
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-center relative px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-[#55288D]">Block Match</h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        <div className="  pb-8">
          {/* User card */}
          {(userImage || userName) && (
            <div className="flex items-center gap-3 bg-gray-100   px-4 py-3 mb-8">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className={`w-12 h-12 rounded-full object-cover flex-shrink-0${blurImage ? " blur-sm" : ""}`}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
              )}
              <div>
                {userName && (
                  <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                )}
                {userLocation && (
                  <p className="text-xs text-gray-500">{userLocation}</p>
                )}
              </div>
            </div>
          )}

        <div className="px-4">
            {/* Question */}
          <h3 className="text-xl px-8 font-bold text-gray-900 text-center mb-3 leading-snug">
            Are you sure you want to block this match?
          </h3>

          {/* Description */}
          <p className="text-sm px-6 text-gray-500 text-center mb-8 leading-relaxed">
            By blocking this user, you will no longer be able to message this
            user anymore. And the user will no longer appear on your feed
          </p>

          {/* Block button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-4 rounded-full bg-[#D400B3] text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Blocking..." : "Block"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BlockModal;
