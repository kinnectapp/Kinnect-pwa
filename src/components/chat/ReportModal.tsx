import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  userName: string;
  userImage?: string;
  userLocation?: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  "Inappropriate messages",
  "Harassment",
  "Spam",
  "Fake profile",
  "Scam attempt",
  "Offensive content",
  "Other",
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  userName,
  userImage,
  userLocation,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const finalReason =
      selectedReason === "Other" ? customReason : selectedReason;
    if (!finalReason.trim()) return;
    await onSubmit(finalReason);
    setIsSubmitted(true);
    setTimeout(() => {
      setSelectedReason("");
      setCustomReason("");
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

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
          <h2 className="text-lg font-bold text-blue-600 text-center mb-6">
            Report Match
          </h2>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4">
                <CheckCircle size={60} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                Report Received
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Thanks for the report. Necessary actions will be taken towards
                your report.
              </p>
            </div>
          ) : (
            <>
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
                    <h3 className="font-semibold text-gray-900">{userName} </h3>
                    {userLocation && (
                      <p className="text-sm text-gray-600">{userLocation}</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-6 text-center">
                Your report will be anonymous and reviewed by our team.
              </p>

              {/* Reason Selection */}
              <div className="space-y-3 mb-6">
                <label className="text-xs font-semibold text-gray-500 mb-3 block">
                  SELECT REASON
                </label>
                {REPORT_REASONS.map((reason) => (
                  <div
                    key={reason}
                    onClick={() => {
                      setSelectedReason(reason);
                      if (reason !== "Other") setCustomReason("");
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedReason === reason
                        ? "border-[#D400B3] bg-pink-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedReason === reason
                            ? "border-[#D400B3] bg-[#D400B3]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedReason === reason && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          selectedReason === reason
                            ? "text-[#D400B3]"
                            : "text-gray-700"
                        }`}
                      >
                        {reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Reason Input */}
              {selectedReason === "Other" && (
                <div className="mb-6">
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">
                    DESCRIBE THE ISSUE
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#D400B3] focus:ring-1 focus:ring-[#D400B3]"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              )}
            </>
          )}

          {!isSubmitted && (
            <div className="grid grid-cols-1 gap-3 mt-8">
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !selectedReason ||
                  (selectedReason === "Other" && !customReason.trim())
                }
                className="w-full px-4 py-3 rounded-full bg-[#D400B3] text-white font-semibold hover:bg-[#d10558] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
