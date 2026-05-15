import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import {
  getMissingProfileFields,
  getIncompleteProfileFields,
  getProfileStrengthDetails,
} from "@/lib/profile-strength";

interface ProfileStrengthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onNavigateToField?: (field: string) => void;
}

const ProfileStrengthModal: React.FC<ProfileStrengthModalProps> = ({
  isOpen,
  onClose,
  user,
  onNavigateToField,
}) => {
  if (!isOpen || !user) return null;

  const missingFields = getMissingProfileFields(user);
  const incompleteFields = getIncompleteProfileFields(user);
  const { percentage, message } = getProfileStrengthDetails(user);

  const priorityFields = [
    "First Name",
    "Last Name",
    "Date of Birth",
    "Email",
    "Phone Number",
    "Profile Photo",
    "Profile Visibility",
  ];

  const allIssues = [...missingFields, ...incompleteFields.map((f) => f.field)];
  const criticalMissing = missingFields.filter((field) =>
    priorityFields.includes(field),
  );
  const otherMissing = missingFields.filter(
    (field) => !priorityFields.includes(field),
  );
  const criticalIncomplete = incompleteFields.filter(
    (f) => f.priority === "high",
  );
  const mediumIncomplete = incompleteFields.filter(
    (f) => f.priority === "medium",
  );
  const lowIncomplete = incompleteFields.filter((f) => f.priority === "low");

  const getFieldColor = (
    type:
      | "critical"
      | "medium"
      | "low"
      | "incomplete-high"
      | "incomplete-medium"
      | "incomplete-low",
  ): string => {
    if (type === "critical") return "bg-red-50 border-red-200";
    if (type === "incomplete-high") return "bg-red-50 border-red-200";
    if (type === "medium" || type === "incomplete-medium")
      return "bg-yellow-50 border-yellow-200";
    return "bg-blue-50 border-blue-200";
  };

  const getFieldIcon = (
    type:
      | "critical"
      | "medium"
      | "low"
      | "incomplete-high"
      | "incomplete-medium"
      | "incomplete-low",
  ) => {
    if (type === "critical" || type === "incomplete-high") {
      return <AlertCircle size={16} className="text-red-500 flex-shrink-0" />;
    }
    if (type === "medium" || type === "incomplete-medium") {
      return (
        <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
      );
    }
    return <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />;
  };

  const getButtonClass = (
    type:
      | "critical"
      | "medium"
      | "low"
      | "incomplete-high"
      | "incomplete-medium"
      | "incomplete-low",
  ) => {
    if (type === "critical" || type === "incomplete-high")
      return "text-xs font-semibold text-red-600 hover:text-red-700 underline";
    if (type === "medium" || type === "incomplete-medium")
      return "text-xs font-semibold text-yellow-600 hover:text-yellow-700 underline";
    return "text-xs font-semibold text-blue-600 hover:text-blue-700 underline";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[999999]">
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-center relative px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#55288D]">
            Complete Your Profile
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Strength Display */}
          <div className="rounded-lg bg-gradient-to-r from-[#55288D] to-[#7B3FA3] text-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-90">Your Profile Strength</p>
                <p className="text-4xl font-bold">{percentage}%</p>
              </div>
              <div className="text-6xl font-bold opacity-20">{percentage}%</div>
            </div>
            <p className="text-sm opacity-90">{message}</p>
          </div>

          {/* Issues Found */}
          {allIssues.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  Items to Improve ({allIssues.length})
                </h3>

                {/* Critical Missing Fields */}
                {criticalMissing.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-red-600 uppercase">
                      Missing - Priority
                    </p>
                    {criticalMissing.map((field, idx) => (
                      <div
                        key={`critical-${idx}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getFieldColor("critical")}`}
                      >
                        {getFieldIcon("critical")}
                        <div className="flex-1 min-w-0">
                          <span className="block text-[14px] text-[#1C1C1C] font-medium">
                            {field}
                          </span>
                        </div>
                        {onNavigateToField && (
                          <button
                            onClick={() => {
                              onNavigateToField(field);
                              onClose();
                            }}
                            className={getButtonClass("critical")}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Critical Incomplete Fields */}
                {criticalIncomplete.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-red-600 uppercase">
                      Needs Attention - Priority
                    </p>
                    {criticalIncomplete.map((item, idx) => (
                      <div
                        key={`critical-incomplete-${idx}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getFieldColor("incomplete-high")}`}
                      >
                        {getFieldIcon("incomplete-high")}
                        <div className="flex-1 min-w-0">
                          <span className="block text-[14px] text-[#1C1C1C] font-medium">
                            {item.field}
                          </span>
                          <p className="text-xs text-[#77707F] mt-1">
                            {item.issue}
                          </p>
                        </div>
                        {onNavigateToField && (
                          <button
                            onClick={() => {
                              onNavigateToField(item.field);
                              onClose();
                            }}
                            className={getButtonClass("incomplete-high")}
                          >
                            Fix
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Missing Fields */}
                {otherMissing.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-yellow-600 uppercase">
                      Missing - Recommended
                    </p>
                    {otherMissing.map((field, idx) => (
                      <div
                        key={`other-${idx}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getFieldColor("medium")}`}
                      >
                        {getFieldIcon("medium")}
                        <div className="flex-1 min-w-0">
                          <span className="block text-[14px] text-[#1C1C1C] font-medium">
                            {field}
                          </span>
                        </div>
                        {onNavigateToField && (
                          <button
                            onClick={() => {
                              onNavigateToField(field);
                              onClose();
                            }}
                            className={getButtonClass("medium")}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Medium Incomplete Fields */}
                {mediumIncomplete.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-yellow-600 uppercase">
                      Needs Attention - Recommended
                    </p>
                    {mediumIncomplete.map((item, idx) => (
                      <div
                        key={`medium-incomplete-${idx}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getFieldColor("incomplete-medium")}`}
                      >
                        {getFieldIcon("incomplete-medium")}
                        <div className="flex-1 min-w-0">
                          <span className="block text-[14px] text-[#1C1C1C] font-medium">
                            {item.field}
                          </span>
                          <p className="text-xs text-[#77707F] mt-1">
                            {item.issue}
                          </p>
                        </div>
                        {onNavigateToField && (
                          <button
                            onClick={() => {
                              onNavigateToField(item.field);
                              onClose();
                            }}
                            className={getButtonClass("incomplete-medium")}
                          >
                            Fix
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Low Priority Incomplete Fields */}
                {lowIncomplete.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-blue-600 uppercase">
                      Optional Improvements
                    </p>
                    {lowIncomplete.map((item, idx) => (
                      <div
                        key={`low-incomplete-${idx}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getFieldColor("incomplete-low")}`}
                      >
                        {getFieldIcon("incomplete-low")}
                        <div className="flex-1 min-w-0">
                          <span className="block text-[14px] text-[#1C1C1C] font-medium">
                            {item.field}
                          </span>
                          <p className="text-xs text-[#77707F] mt-1">
                            {item.issue}
                          </p>
                        </div>
                        {onNavigateToField && (
                          <button
                            onClick={() => {
                              onNavigateToField(item.field);
                              onClose();
                            }}
                            className={getButtonClass("incomplete-low")}
                          >
                            Improve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">
                  Profile Complete!
                </p>
                <p className="text-sm text-green-700">
                  Your profile is looking great!
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#55288D] text-white font-semibold text-[14px] hover:bg-[#3e1a6e] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStrengthModal;
