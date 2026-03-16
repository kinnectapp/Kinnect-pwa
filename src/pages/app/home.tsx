import React, { useEffect } from "react";
import { MoveRight, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BookSessionIcon,
  CrownIcon,
  MakeConnectionIcon,
} from "@/components/icons";
import { useAuthStore } from "@/store/auth.store";
import { http } from "@/api/http";
import { Link, useNavigate } from "react-router-dom";
import WhiteImg from "../../assets/images/white.jpg";
import useAuth from "@/api/auth";
import { setUser } from "@/api/storage";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import {
  useGetProfile,
  useGetProfileMatches,
} from "@/services/profile.service";
import MatchItemComponent from "@/components/MatchItem";

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
   const displayName = user?.firstname || user?.username || "";
  const { useGetUserMutation } = useAuth();

  const { mutateAsync: getUserById } = useGetUserMutation();

  // Get profile and matches using the new profile service
  const { data: profileData } = useGetProfile();
  const {
    data: matchesData,
    isLoading: isLoadingMatches,
    error: matchError,
  } = useGetProfileMatches();

  const handleSubmit = async () => {
    try {
      if (user?.id) {
        const userResponse = await getUserById(String(user.id));
        const fetchedUser = userResponse?.data?.resp;
        if (fetchedUser && typeof fetchedUser === "object") {
          await setUser(fetchedUser as any);
        }
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  useEffect(() => {
    handleSubmit();
    console.log("profileData", profileData);
  }, [user]);

  const { data: communitiesResponse, isLoading: isLoadingCommunities } =
    useQuery({
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

  // Check if user has completed dealbreaker and personality test
  const hasCompletedQuestionaires =
    !!profileData?.dealBreakerId && !!profileData?.personalityId;

  // Check if matches error is due to missing profile fields
  const isMissingProfileFields =
    matchError &&
    (matchError as any)?.response?.status === 400 &&
    (matchError as any)?.response?.data?.error?.includes(
      "update your religion, education, bodyType",
    );

  return (
    <div className="  ">
      {/* Header */}

      {/* Main Content */}
      <main className=" mt-4 space-y-4">
        <div className="px-4  space-y-6">
          {/* Welcome Section */}
          <section>
            <h1 className="text-[22px] capitalize font-semibold text-[#1C1C1C]">
              Welcome {displayName}
            </h1>
            <p className="text-[#77707F] leading-[20px] text-sm mt-1">
              Discover and engage with potential matches who share your values
              and interests.
            </p>
          </section>

          {/* Make Connections Section - Show Matches */}
          {!hasCompletedQuestionaires ? (
            <section
              onClick={() => navigate("/onboarding/dealbreaker_q")}
              className="text-[#fff] background-gradient  p-3 rounded-[8px] w-full cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MakeConnectionIcon width="60" />

                <div>
                  <h2 className="font-semibold text-lg">Make Connections</h2>
                  <p className="text-white text-xs mt-1">
                    Complete your deal breakers and personality test to discover
                    matches.
                  </p>
                </div>
              </div>
            </section>
          ) : isMissingProfileFields ? (
            <section
              onClick={() => navigate("/onboarding/profile-setup")}
              className="text-[#fff] background-gradient  p-3 rounded-[8px] w-full cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MakeConnectionIcon width="60" />

                <div>
                  <h2 className="font-semibold text-lg">
                    Complete Your Profile
                  </h2>
                  <p className="text-white text-xs mt-1">
                    Update your religion, education, and body type to discover
                    matches.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#1C1C1C] px-0">
                Your Matches
              </h2>
              {isLoadingMatches ? (
                <div className="flex items-center justify-center py-8 gap-2 text-[#77707F]">
                  <Loader className="animate-spin w-5 h-5" />
                  <span>Finding your matches...</span>
                </div>
              ) : matchError ? (
                <div className="text-center py-8 text-red-900">
                  <p>Unable to load matches. Please try again later.</p>
                </div>
              ) : matchesData && matchesData.length > 0 ? (
                <div className="space-y-3">
                  {matchesData.slice(0, 6).map((match, index) => (
                    <div key={`${match.profile.id}-${index}`}>
                      <MatchItemComponent item={match} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#77707F]">
                  <p>No matches found yet. Check back soon!</p>
                </div>
              )}
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
                      backgroundImage: `url(${community.image || WhiteImg})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: "#00000033",
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

        <Link to="/app/subscriptions">
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
