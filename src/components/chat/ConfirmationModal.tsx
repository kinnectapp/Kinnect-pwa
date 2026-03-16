import React from "react";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  userImage?: string;
  userLocation?: string;
  cancelText?: string;
  confirmText?: string;
  isDangerous?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  userImage,
  userLocation,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isDangerous = false,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isLoading}
        >
          <X size={24} className="text-gray-600" />
        </button>

        <div className="pt-2">
          {/* Title */}
          <h2 className="text-lg font-bold text-blue-600 text-center mb-6">
            {title}
          </h2>

          {/* User Profile Info */}
          {(userImage || title) && (
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              {userImage && (
                <img
                  src={userImage}
                  alt="user"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {title.split(" ")[0] === "Block"
                    ? title.replace("Block Match", "").trim()
                    : title.replace("Remove from Matches", "").trim() || "User"}
                </h3>
                {userLocation && (
                  <p className="text-sm text-gray-600">{userLocation}</p>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-full border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-3 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDangerous
                  ? "bg-[#E60B69] hover:bg-[#d10558]"
                  : "bg-[#E60B69] hover:bg-[#d10558]"
              }`}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
