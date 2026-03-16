import React from "react";
import { Heart, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MatchItem } from "@/services/profile.service";

interface MatchItemProps {
  item: MatchItem;
}

/**
 * Component to display a single match item
 * Shows compatibility percentage, username, and location
 * Similar to mobile app's MatchItem component
 */
const MatchItemComponent: React.FC<MatchItemProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/app/match-profile/${item.profile.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Compatibility Badge */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-pink-100">
          <Heart size={16} className="text-pink-500 fill-pink-500" />
          <span className="text-sm font-semibold text-pink-700">
            {Number(item.value ?? 0).toFixed()}%
          </span>
        </div>
      </div>

      {/* Username and Arrow */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {item.profile.username ?? "Unknown User"}
        </h3>
        <ChevronRight size={20} className="text-gray-400" />
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin size={16} className="text-gray-400" />
        <span>
          {item.profile.state ? `${item.profile.state}, ` : ""}
          {item.profile.country ?? "Location Unknown"}
        </span>
      </div>
    </button>
  );
};

export default MatchItemComponent;
