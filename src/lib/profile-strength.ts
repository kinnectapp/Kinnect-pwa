/**
 * Profile Strength Calculator
 * Calculates user profile completeness as a percentage (0-100)
 */

interface UserProfile {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  profilePhotos?: string[];
  bodyType?: string;
  complexion?: string;
  religion?: string;
  education?: string;
  smokeRate?: string;
  drinkRate?: string;
  bio?: string;
  occupation?: string;
  interests?: string[];
  personalityCompleted?: boolean;
  personalityId?: string | number | null;
  dealBreakerId?: string | number | null;
  isVerified?: boolean;
  isActive?: boolean;
  incognito?: boolean;
}

const isFieldComplete = (value?: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

const isFieldCompleteWithMinLength = (
  value?: any,
  minLength: number = 1,
): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length >= minLength;
  if (Array.isArray(value)) return value.length >= minLength;
  return Boolean(value);
};

export const calculateProfileStrength = (user: UserProfile): number => {
  let totalPoints = 0;
  let maxPoints = 100;

  // 1. Identity Information (15 points)
  // Each: 3 points
  if (isFieldComplete(user.firstname)) totalPoints += 3;
  if (isFieldComplete(user.lastname)) totalPoints += 3;
  if (isFieldComplete(user.dob)) totalPoints += 3;
  if (isFieldComplete(user.gender)) totalPoints += 3;
  if (user.isVerified) totalPoints += 3;

  // 2. Contact & Location (15 points)
  if (isFieldComplete(user.phone)) totalPoints += 3;
  if (isFieldComplete(user.city)) totalPoints += 2;
  if (isFieldComplete(user.state)) totalPoints += 2;
  if (isFieldComplete(user.country)) totalPoints += 2;
  if (isFieldComplete(user.address)) totalPoints += 3;

  // 3. Appearance & Physical (20 points)
  // Photos: 10 points base (1+ photos), +3 for 2+, +2 more for 3+
  const photoCount = Array.isArray(user.profilePhotos)
    ? user.profilePhotos.filter((p) => p).length
    : 0;
  if (photoCount >= 1) totalPoints += 10;
  if (photoCount >= 2) totalPoints += 3;
  if (photoCount >= 3) totalPoints += 2;

  // Physical attributes: 5 points total
  if (isFieldComplete(user.bodyType)) totalPoints += 1;
  if (isFieldComplete(user.complexion)) totalPoints += 1;
  if (isFieldComplete(user.religion)) totalPoints += 1;
  if (isFieldComplete(user.education)) totalPoints += 1;

  // 4. Lifestyle (10 points)
  if (isFieldComplete(user.smokeRate)) totalPoints += 5;
  if (isFieldComplete(user.drinkRate)) totalPoints += 5;

  // 5. About You (15 points)
  if (isFieldCompleteWithMinLength(user.bio, 10)) totalPoints += 5;
  if (isFieldComplete(user.occupation)) totalPoints += 5;

  // Interests: 1+ = 3pts, 3+ = +2, 5+ = +3 more
  const interestCount = Array.isArray(user.interests)
    ? user.interests.filter((i) => i).length
    : 0;
  if (interestCount >= 1) totalPoints += 3;
  if (interestCount >= 3) totalPoints += 2;
  if (interestCount >= 5) totalPoints += 2;

  // 6. Personality & Values (15 points)
  const hasPersonality =
    user.personalityCompleted || isFieldComplete(user.personalityId);
  const hasDealBreaker = isFieldComplete(user.dealBreakerId);

  if (hasPersonality) totalPoints += 7;
  if (hasDealBreaker) totalPoints += 7;
  if (hasPersonality && hasDealBreaker) totalPoints += 1; // Bonus for both

  // 7. Engagement (10 points)
  if (user.isActive) totalPoints += 5;
  if (!user.incognito) totalPoints += 5;

  // Calculate percentage
  const percentage = Math.round((totalPoints / maxPoints) * 100);

  // Ensure it doesn't exceed 100
  return Math.min(percentage, 100);
};

/**
 * Get profile strength with detailed breakdown
 */
export const getProfileStrengthDetails = (user: UserProfile) => {
  const strength = calculateProfileStrength(user);

  let status: "low" | "medium" | "high" = "low";
  let message = "Profile needs more information";

  if (strength >= 80) {
    status = "high";
    message = "Profile is looking great!";
  } else if (strength >= 50) {
    status = "medium";
    message = "Profile is coming along nicely";
  }

  return {
    percentage: strength,
    status,
    message,
  };
};

/**
 * Get missing profile fields for recommendations
 */
export const getMissingProfileFields = (user: UserProfile): string[] => {
  const missing: string[] = [];

  // Critical fields (should be completed)
  if (!isFieldComplete(user.firstname)) missing.push("First Name");
  if (!isFieldComplete(user.lastname)) missing.push("Last Name");
  if (!isFieldComplete(user.dob)) missing.push("Date of Birth");
  if (!isFieldComplete(user.gender)) missing.push("Gender");
  if (!isFieldComplete(user.email)) missing.push("Email");

  // Important fields
  if (!isFieldComplete(user.phone)) missing.push("Phone Number");
  if (
    !(
      isFieldComplete(user.city) &&
      isFieldComplete(user.state) &&
      isFieldComplete(user.country)
    )
  )
    missing.push("Location (City, State, Country)");

  const photoCount = Array.isArray(user.profilePhotos)
    ? user.profilePhotos.filter((p) => p).length
    : 0;
  if (photoCount === 0) missing.push("Profile Photo");

  if (!isFieldComplete(user.bodyType)) missing.push("Body Type");
  if (!isFieldComplete(user.complexion)) missing.push("Complexion");
  if (!isFieldComplete(user.religion)) missing.push("Religion");
  if (!isFieldComplete(user.education)) missing.push("Education");

  if (!isFieldComplete(user.smokeRate)) missing.push("Smoking Status");
  if (!isFieldComplete(user.drinkRate)) missing.push("Drinking Status");

  if (!isFieldCompleteWithMinLength(user.bio, 10)) missing.push("Bio");
  if (!isFieldComplete(user.occupation)) missing.push("Occupation");

  const interestCount = Array.isArray(user.interests)
    ? user.interests.filter((i) => i).length
    : 0;
  if (interestCount < 3) missing.push("Interests (at least 3)");

  if (!user.personalityCompleted && !isFieldComplete(user.personalityId))
    missing.push("Personality Test");
  if (!isFieldComplete(user.dealBreakerId)) missing.push("Deal Breaker Test");

  return missing;
};

/**
 * Get incomplete/needs-improvement profile fields with specific details
 */
export const getIncompleteProfileFields = (
  user: UserProfile,
): Array<{
  field: string;
  issue: string;
  priority: "high" | "medium" | "low";
}> => {
  const incomplete: Array<{
    field: string;
    issue: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // Check bio - needs minimum 10 characters
  if (isFieldComplete(user.bio)) {
    const bioLength = String(user.bio).trim().length;
    if (bioLength < 10) {
      incomplete.push({
        field: "Bio",
        issue: `Currently ${bioLength} characters - needs at least 10`,
        priority: "medium",
      });
    }
  }

  // Check interests - needs at least 3
  const interestCount = Array.isArray(user.interests)
    ? user.interests.filter((i) => i).length
    : 0;
  if (interestCount > 0 && interestCount < 3) {
    incomplete.push({
      field: "Interests",
      issue: `You have ${interestCount} - add at least ${3 - interestCount} more`,
      priority: "medium",
    });
  }

  // Check photos - encourage multiple (ideally 3+)
  const photoCount = Array.isArray(user.profilePhotos)
    ? user.profilePhotos.filter((p) => p).length
    : 0;
  if (photoCount === 1) {
    incomplete.push({
      field: "Profile Photos",
      issue: "Add more photos to increase visibility (3+ recommended)",
      priority: "low",
    });
  } else if (photoCount === 2) {
    incomplete.push({
      field: "Profile Photos",
      issue: "Add one more photo (3+ recommended)",
      priority: "low",
    });
  }

  // Check incognito mode
  if (user.incognito) {
    incomplete.push({
      field: "Profile Visibility",
      issue: "Incognito mode is ON - disable to appear in matches",
      priority: "high",
    });
  }

  return incomplete;
};
