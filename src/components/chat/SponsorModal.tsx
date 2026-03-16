import React from "react";
import { X, Gift } from "lucide-react";

interface SponsorModalProps {
  isOpen: boolean;
  userName: string;
  userImage?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const SponsorModal: React.FC<SponsorModalProps> = ({
  isOpen,
  userName,
  userImage,
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
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-pink-50 rounded-full">
              <Gift size={40} className="text-[#E60B69]" />
            </div>
          </div>

          {/* User Profile Info */}
          {(userImage || userName) && (
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              {userImage && (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{userName}</h3>
              </div>
            </div>
          )}

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Sponsor {userName}
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
            {userName} is currently on a freemium plan. By sponsoring them,
            you'll unlock premium features for both of you and enhance your
            connection.
          </p>

          {/* Benefits */}
          <div className="bg-pink-50 rounded-lg p-4 mb-8 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Benefits:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Unlimited messaging</li>
              <li>✓ Video call access</li>
              <li>✓ Priority in matches</li>
              <li>✓ Advanced profile features</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-full border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-3 rounded-full bg-[#E60B69] text-white font-semibold hover:bg-[#d10558] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Sponsor Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorModal;
