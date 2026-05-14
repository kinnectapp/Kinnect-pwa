import React from "react";
import { X } from "lucide-react";

interface ChatOptionsModalProps {
  isOpen: boolean;
  partnerName: string;
  isBlocked?: boolean;
  onClose: () => void;
  onProceedToDate: () => void;
  onSponsorPlan: () => void;
  onBlock: () => void;
  onUnblock?: () => void;
  onReport: () => void;
  onJilt: () => void;
  profileComp?: React.ReactNode;
}

const ChatOptionsModal: React.FC<ChatOptionsModalProps> = ({
  isOpen,
  partnerName,
  isBlocked = false,
  onClose,
  onProceedToDate,
  onSponsorPlan,
  onBlock,
  onUnblock,
  onReport,
  onJilt,
  profileComp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full relative bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {profileComp}

        {/* MORE Label */}
        <div className="text-xs font-semibold text-gray-500 mb-6 pt-2">
          MORE
        </div>

        {/* Options */}
        <div className="space-y-6">
          {/* Proceed to Date */}
          <div onClick={onProceedToDate} className="cursor-pointer group">
            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-3">
    
              Proceed To Date
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Get connected with {partnerName}
            </p>
          </div>

          {/* Sponsor Plan */}
          <div onClick={onSponsorPlan} className="cursor-pointer group">
            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-3">
               Sponsor Plan
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Sponsor this user as they are on a freemium.
            </p>
          </div>

          {/* Block / Unblock */}
          <div onClick={isBlocked ? onUnblock : onBlock} className="cursor-pointer group">
            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-3">
              {isBlocked ? "Unblock" : "Block"}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {isBlocked
                ? "Unblock this user to send and receive messages."
                : "This user can no longer see or interact with you once blocked."}
            </p>
          </div>

          {/* Report */}
          <div onClick={onReport} className="cursor-pointer group">
            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-3">
               Report
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Your report will be anonymous
            </p>
          </div>

          {/* Jilt */}
          <div onClick={onJilt} className="cursor-pointer group pb-4">
            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-3">
               Jilt
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              No longer interested in {partnerName}? Remove from matches
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOptionsModal;
