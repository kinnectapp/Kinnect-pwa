import type { User } from "@/lib/types/auth";

export type SubscriptionTier =
  | "fremium"
  | "standard"
  | "vip"
  | "lifetime";

export type CommunityAccessLevel = "read-only" | "full";
export type KikiAccessLevel = "none" | "guided" | "personalized";
export type IncognitoControlLevel = "locked-on" | "day-4" | "full";

type SubscriptionPermissions = {
  tier: SubscriptionTier;
  isPaid: boolean;
  hasActiveSubscription: boolean;
  communityAccess: CommunityAccessLevel;
  canJoinCommunityConversation: boolean;
  kikiChatAccess: KikiAccessLevel;
  kikiCoachingAccess: KikiAccessLevel;
  canAccessLiveCoach: boolean;
  canAccessSponsoredFirstDates: boolean;
  canReceiveSpendingVoucher: boolean;
  canPurchaseEventTickets: boolean;
  hasGuaranteedEventAccess: boolean;
  incognitoControl: IncognitoControlLevel;
  canToggleIncognito: boolean;
  canToggleIncognitoToday: boolean;
};

const safeLower = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const isActiveSubscriptionStatus = (status: unknown) => {
  const normalized = safeLower(status);
  if (!normalized) {
    return true;
  }

  return !["expired", "inactive", "cancelled", "canceled"].includes(
    normalized,
  );
};

const hasFutureExpiry = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return true;
  }

  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) {
    return true;
  }

  return expiry.getTime() >= Date.now();
};

export const resolveSubscriptionTier = (
  user: User | null | undefined,
): SubscriptionTier => {
  if (!user) {
    return "fremium";
  }

  const explicitPlan = safeLower(
    user.currentSubName ||
      user.subscriptionPlan ||
      user.subscriptionType ||
      user.plan,
  );

  if (!explicitPlan || explicitPlan.includes("free") || explicitPlan.includes("freemium")) {
    return "fremium";
  }

  if (explicitPlan.includes("lifetime")) {
    return "lifetime";
  }

  if (explicitPlan.includes("vip")) {
    return "vip";
  }

  if (explicitPlan.includes("standard")) {
    return "standard";
  }

  return user.currentSubId ? "standard" : "fremium";
};

const hasActivePaidSubscription = (user: User | null | undefined) => {
  const tier = resolveSubscriptionTier(user);
  if (tier === "fremium") {
    return false;
  }

  if (tier === "lifetime") {
    return true;
  }

  if (!isActiveSubscriptionStatus(user?.subscriptionStatus)) {
    return false;
  }

  return hasFutureExpiry(user?.subExpiryDate);
};

export const getSubscriptionPermissions = (
  user: User | null | undefined,
): SubscriptionPermissions => {
  const tier = resolveSubscriptionTier(user);
  const hasActiveSubscription = hasActivePaidSubscription(user);
  const effectiveTier =
    tier !== "fremium" && !hasActiveSubscription ? "fremium" : tier;

  const subStartDate =
    typeof user?.subStartDate === "string" ? new Date(user.subStartDate) : null;
  const standardIncognitoUnlocked =
    !!subStartDate &&
    !Number.isNaN(subStartDate.getTime()) &&
    Date.now() >= subStartDate.getTime() + 4 * 24 * 60 * 60 * 1000;

  switch (effectiveTier) {
    case "lifetime":
      return {
        tier: effectiveTier,
        isPaid: true,
        hasActiveSubscription: true,
        communityAccess: "full",
        canJoinCommunityConversation: true,
        kikiChatAccess: "personalized",
        kikiCoachingAccess: "personalized",
        canAccessLiveCoach: true,
        canAccessSponsoredFirstDates: true,
        canReceiveSpendingVoucher: true,
        canPurchaseEventTickets: true,
        hasGuaranteedEventAccess: true,
        incognitoControl: "full",
        canToggleIncognito: true,
        canToggleIncognitoToday: true,
      };
    case "vip":
      return {
        tier: effectiveTier,
        isPaid: true,
        hasActiveSubscription: true,
        communityAccess: "full",
        canJoinCommunityConversation: true,
        kikiChatAccess: "personalized",
        kikiCoachingAccess: "personalized",
        canAccessLiveCoach: true,
        canAccessSponsoredFirstDates: true,
        canReceiveSpendingVoucher: true,
        canPurchaseEventTickets: true,
        hasGuaranteedEventAccess: true,
        incognitoControl: "full",
        canToggleIncognito: true,
        canToggleIncognitoToday: true,
      };
    case "standard":
      return {
        tier: effectiveTier,
        isPaid: true,
        hasActiveSubscription: true,
        communityAccess: "full",
        canJoinCommunityConversation: true,
        kikiChatAccess: "guided",
        kikiCoachingAccess: "guided",
        canAccessLiveCoach: false,
        canAccessSponsoredFirstDates: true,
        canReceiveSpendingVoucher: false,
        canPurchaseEventTickets: true,
        hasGuaranteedEventAccess: false,
        incognitoControl: "day-4",
        canToggleIncognito: true,
        canToggleIncognitoToday: standardIncognitoUnlocked,
      };
    case "fremium":
    default:
      return {
        tier: "fremium",
        isPaid: false,
        hasActiveSubscription: false,
        communityAccess: "read-only",
        canJoinCommunityConversation: false,
        kikiChatAccess: "none",
        kikiCoachingAccess: "none",
        canAccessLiveCoach: false,
        canAccessSponsoredFirstDates: false,
        canReceiveSpendingVoucher: false,
        canPurchaseEventTickets: false,
        hasGuaranteedEventAccess: false,
        incognitoControl: "locked-on",
        canToggleIncognito: false,
        canToggleIncognitoToday: false,
      };
  }
};
