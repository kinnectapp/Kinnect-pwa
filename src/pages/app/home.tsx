import React, { useState } from "react";
import { ArrowRight, MoveRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BookSessionIcon,
  CrownIcon,
  HeartIcon,
  LocationIcon,
  MakeConnectionIcon,
} from "@/components/icons";
import { useAuthStore } from "@/store/auth.store";
import { http } from "@/api/http";
import { Link, useNavigate } from "react-router-dom";
import Splash2Img from "../../assets/images/splash2.png";

type Community = {
  id: number;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
};

type CommunitiesResponse = {
  data?: {
    data?: Community[];
  };
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [showConnections, setShowConnections] = useState(false);
  const displayName = user?.firstname || user?.username || "there";

  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ["active-communities"],
    queryFn: async () => {
      const response = await http.get<CommunitiesResponse>(
        "/community?isActive=true",
      );
      return response.data;
    },
  });

  const communities = (communitiesResponse?.data?.data ?? []).slice(0, 4);

  const truncateText = (text: string, maxLength = 60): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  };

  const Connections = [
    {
      name: "Relationship Advice",
      percent: "90",
      location: "Cairo, Egypt",
      kilometer: " 10km away",
    },
    {
      name: "Personal Development",
      percent: "23",
      location: "Cairo, Egypt",
      kilometer: " 10km away",
    },
    {
      name: "For Her",
      percent: "40",
      location: "Cairo, Egypt",
      kilometer: " 10km away",
    },
    {
      name: "For Him",
      percent: "100",
      location: "Cairo, Egypt",
      kilometer: " 10km away",
    },
  ];
  return (
    <div className="  ">
      {/* Header */}

      {/* Main Content */}
      <main className=" mt-4 space-y-4">
        <div className="px-4  space-y-6">
          {/* Welcome Section */}
          <section>
            <h1 className="text-[22px] font-semibold text-[#1C1C1C]">
              Welcome {displayName}
            </h1>
            <p className="text-[#77707F] leading-[20px] text-sm mt-1">
              Discover and engage with potential matches who share your values
              and interests.
            </p>
          </section>

          {/* Make Connections Card */}
          {showConnections ? (
            <section className="space-y-4">
              {Connections.map((d, i) => (
                <div
                  onClick={() => navigate("/app/match_profile")}
                  key={i}
                  className=" flex justify-between items-center  rounded-[8px] bg-[#FAF8FB] p-4"
                >
                  <div className="">
                    <div className="flex w-fit gap-2 mb-4 items-center justify-center bg-[#F9E0F5] text-[#D400B3] text-[12px] rounded-full px-3 py-1">
                      <HeartIcon />
                      {d.percent}%
                    </div>

                    <div className="font-semibold text-[20px]">{d.name}</div>
                    <div className="flex gap-2 items-center text-[#77707F] text-[12px]">
                      <LocationIcon color="#8F92A1" />
                      {d.location}{" "}
                      <span className="w-1 h-1 rounded-full bg-[#77707F]"></span>
                      {d.kilometer}
                    </div>
                  </div>
                  <div className="border-4 rounded-full border-[#1C1C1C] p-[3px] ">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section
              onClick={() => setShowConnections(true)}
              className="text-[#fff] background-gradient  p-3 rounded-[8px] w-full"
            >
              <div className="flex items-center gap-3">
                <MakeConnectionIcon width="60" />

                <div>
                  <h2 className="font-semibold text-lg">Make Connections</h2>
                  <p className="text-white text-xs mt-1">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Book A Coaching Session */}
        <Link to="/onboarding/booksession">
          {" "}
          <div className="flex p-4 mt-6 justify-between items-center bg-[#860B73] text-[#fff] w-full">
            <div className="flex items-center gap-4">
              <BookSessionIcon width="28" />
              <div className="">
                <div className="font-semibold text-[16px]">
                  Book A Coaching Session
                </div>

                <div className="text-[12px]">Book now to talk to an expert</div>
              </div>
            </div>
            <MoveRight />
          </div>
        </Link>

        {/* Kinnect Communities */}
        <section className="px-4">
          <h2 className="font-semibold text-[18px] text-[#55288D] mb-4">
            Kinnect Communities
          </h2>
          {isLoadingCommunities ? (
            <div className="grid overflow-clip grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[210px] rounded-[8px] bg-[#F3F3F6] animate-pulse border"
                >
                  <div className="h-full w-full flex flex-col justify-end p-3">
                    <div className="h-4 w-3/4 rounded bg-[#E2E2E8]" />
                    <div className="h-3 w-full rounded bg-[#E2E2E8] mt-2" />
                    <div className="h-3 w-2/3 rounded bg-[#E2E2E8] mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid overflow-clip grid-cols-2 gap-3">
              {communities.map((community) => (
                <Link key={community.id} to="/app/community">
                  <div
                    style={{
                      backgroundImage: `url(${community.image || Splash2Img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    className="border overflow-clip flex flex-col justify-end  h-[210px] rounded-[8px]"
                  >
                    <div className="splash-gradient  py-4 px-2">
                      <div className="text-[16px] text-white font-semibold">
                        {community.name}
                      </div>
                      <div className="text-[12px] text-[#D5D4D7]">
                        {truncateText(community.description)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Link to="/onboarding/booksession">
          {" "}
          <div className="flex p-4 mt-6 justify-between items-center  background-gradient text-[#fff] w-full">
            <div className="flex items-center gap-4">
              <CrownIcon />
              <div className="">
                <div className="font-semibold text-[16px]">
                  Subscribe to Premium Plan
                </div>
              </div>
            </div>
            <MoveRight />
          </div>
        </Link>
      </main>
    </div>
  );
};

export default HomePage;
