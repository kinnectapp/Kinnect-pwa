import { endpoints } from "@/api/endpoints";
import { http } from "@/api/http";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export type MatchItem = {
  value: number; // Compatibility percentage
  profile: {
    id: number;
    username: string;
    bio?: string;
    state?: string;
    country?: string;
    image?: string;
    age?: number;
    gender?: string;
    email?: string;
    profilePhotos?: string[];
    dob?: string;
    firstname?: string;
    lastname?: string;
    city?: string;
    personalitySummary?: string;
    personalityPercentage?: number | string;
    education?: string;
    occupation?: string;
    religion?: string;
    drinkRate?: string;
    smokeRate?: string;
    interests?: string[];
  };
};

export type MatchesResponse = {
  data?: {
    result?: MatchItem[];
  };
};

export type ProfileResponse = {
  data?: {
    user?: {
      id: number;
      dealBreakerId?: string;
      personalityId?: string;
      dealBreakerStatus?: string;
      personalityStatus?: string;
      matchStatus?: string;
      username?: string;
      email?: string;
      bio?: string;
    };
  };
};

export const profileService = {
  /**
   * Get user profile with deal breaker and personality information
   */
  getProfile: async () => {
    const { data } = await http.get<ProfileResponse>(endpoints.users.profile);

 
    return data.data?.user || null;
  },

  /**
   * Get all matches for the current user based on deal breakers and personality test
   */
  getMatches: async () => {
    const { data } = await http.get<MatchesResponse>(endpoints.users.matches);

 
    return data.data?.result ?? [];
  },

  /**
   * Like a user profile
   */
  likeProfile: async (id: string) => {
    const { data } = await http.put(`/profile/like/${id}`, {});
    return data;
  },

  /**
   * Dislike a user profile
   */
  dislikeProfile: async (id: string) => {
    const { data } = await http.put(endpoints.users.jilt(id), {});
    return data;
  },
};

/**
 * Hook to fetch user profile with deal breaker and personality information
 */
export const useGetProfile = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => profileService.getProfile(),
    enabled: !!user?.id,
  });
};

/**
 * Hook to fetch matches based on deal breaker and personality test
 * Similar to the mobile app's useGetProfileMatches
 */
export const useGetProfileMatches = () => {
  const user = useAuthStore((state) => state.user);
  const { data: profileData } = useGetProfile();

  // Type assertion to access the properties safely
  const profileDataWithTypes = profileData as Partial<typeof profileData> & {
    dealBreakerId?: string;
    personalityId?: string;
  };

  return useQuery({
    queryKey: [
      "user-matches",
      profileDataWithTypes?.dealBreakerId,
      profileDataWithTypes?.personalityId,
      user?.id,
    ],
    queryFn: async () => profileService.getMatches(),
    // Only fetch matches if user has completed both deal breaker and personality test
    enabled:
      !!profileDataWithTypes?.dealBreakerId &&
      !!profileDataWithTypes?.personalityId,
  });
};
