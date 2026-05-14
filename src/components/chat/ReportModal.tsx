import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  userName: string;
  userImage?: string;
  userLocation?: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  onJilt?: () => void;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  "Sexual Abuse",
  "Too Aggressive",
  "Spam",
  "Fake Profile",
  "Inappropriate Content",
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  userName,
  userImage,
  userLocation,
  onClose,
  onSubmit,
  onJilt,
  isLoading = false,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleReasonSelect = async (reason: string) => {
    if (isLoading) return;
    await onSubmit(reason);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-center relative px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-[#55288D]">Report Match</h2>
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="px-6 pb-8">
            {/* User card */}
            {(userImage || userName) && (
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 mb-8">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                  {userLocation && (
                    <p className="text-xs text-gray-500">{userLocation}</p>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation message */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Report Received
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Thanks for the report. Necessary actions will be taken towards
                your report.
              </p>
            </div>

            {/* Jilt button */}
            <button
              onClick={() => {
                onJilt?.();
                handleClose();
              }}
              className="w-full py-4 rounded-full bg-[#D400B3] text-white font-semibold text-base"
            >
              Jilt
            </button>
          </div>
        ) : (
          <div className="px-6 pb-8">
            <p className="text-sm text-gray-500 mb-4">Select a reason</p>

            {/* Reasons list */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden">
              {REPORT_REASONS.map((reason, index) => (
                <button
                  key={reason}
                  onClick={() => handleReasonSelect(reason)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between px-4 py-4 bg-white text-left disabled:opacity-50 ${
                    index < REPORT_REASONS.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <span className="text-sm text-gray-700">{reason}</span>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
