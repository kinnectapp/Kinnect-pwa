"use client";

import React, { useState } from "react";

interface CommunityGroup {
  id: string;
  name: string;
  avatar: string;
  description: string;
  memberCount: number;
  joinedDate?: string;
  members?: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

const CommunityView: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const communities: CommunityGroup[] = [
    {
      id: "1",
      name: "Kiki",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Need help! Let's chat",
      memberCount: 1,
      joinedDate: "5 mins ago",
    },
    {
      id: "2",
      name: "Relationship Advice",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Share and discuss relationship topics",
      memberCount: 256,
      joinedDate: "3 weeks ago",
    },
    {
      id: "3",
      name: "Personal Development",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Grow and improve yourself every day",
      memberCount: 512,
      joinedDate: "2 months ago",
      members: [
        {
          id: "1",
          name: "Alex",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        },
        {
          id: "2",
          name: "Jordan",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        },
        {
          id: "3",
          name: "Casey",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        },
      ],
    },
  ];

  const selectedGroupData = communities.find((g) => g.id === selectedGroup);

  if (selectedGroup && selectedGroupData) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Group Header */}
        <div className="border-b border-gray-200 p-4">
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            <img
              src={selectedGroupData.avatar || "/placeholder.svg"}
              alt={selectedGroupData.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedGroupData.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedGroupData.memberCount} Members
              </p>
            </div>
          </div>
        </div>

        {/* Group Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-600 mb-6">
            {selectedGroupData.description}
          </p>

          {selectedGroupData.members && selectedGroupData.members.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Members</h3>
              <div className="flex gap-2 overflow-x-auto pb-4">
                {selectedGroupData.members.map((member) => (
                  <div key={member.id} className="flex-shrink-0 text-center">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover mb-2"
                    />
                    <p className="text-xs text-gray-600">{member.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
    

      {/* Communities List */}
      <div className="flex-1 overflow-y-auto">
       
        {communities.map((community) => (
          <button
            key={community.id}
            onClick={() => setSelectedGroup(community.id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 text-left"
          >
            <img
              src={community.avatar || "/placeholder.svg"}
              alt={community.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {community.name}
                </h3>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {community.description}
              </p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
              {community.joinedDate}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommunityView;
