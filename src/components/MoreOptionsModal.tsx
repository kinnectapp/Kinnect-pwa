'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoreOptionsModalProps {
  isOpen: boolean;
  profile: {
    name: string;
    location: string;
    image: string;
  };
  isBlocked?: boolean;
  onClose: () => void;
  onProceedToDate: () => void;
  onSponsorPlan: () => void;
  onBlock: () => void;
  onUnblock?: () => void;
  onReport: () => void;
  onJilt: () => void;
}

export const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({
  isOpen,
  profile,
  isBlocked = false,
  onClose,
  onProceedToDate,
  onSponsorPlan,
  onBlock,
  onUnblock,
  onReport,
  onJilt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Profile Header in Modal */}
        <div className="flex items-center gap-4 mb-8 pt-2">
          <img
            src={profile.image || "/placeholder.svg"}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-600 text-sm">{profile.location}</p>
          </div>
        </div>

        {/* MORE Label */}
        <div className="text-xs font-semibold text-gray-500 mb-4">MORE</div>

        {/* Options */}
        <div className="space-y-6">
          {/* Proceed to Date */}
          <div
            onClick={onProceedToDate}
            className="cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
               Proceed To Date
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Get connected with {profile.name}
            </p>
          </div>

          {/* Sponsor Plan */}
          <div
            onClick={onSponsorPlan}
            className="cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
               Sponsor Plan
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sponsor this user as they are on a freemium.
            </p>
          </div>

          {/* Block / Unblock */}
          <div
            onClick={isBlocked ? onUnblock : onBlock}
            className="cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-2">
               {isBlocked ? "Unblock" : "Block"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isBlocked
                ? "Unblock this user to send and receive messages."
                : "This user can no longer see or interact with you once blocked."}
            </p>
          </div>

          {/* Report */}
          <div
            onClick={onReport}
            className="cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
               Report
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Your report will be anonymous
            </p>
          </div>

          {/* Jilt */}
          <div
            onClick={onJilt}
            className="cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 group-hover:text-gray-600 transition-colors flex items-center gap-2">
               Jilt
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              No longer interested in {profile.name}? Remove from matches
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onClose}
          className="w-full mt-8 bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-full h-12 font-semibold"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default MoreOptionsModal;
