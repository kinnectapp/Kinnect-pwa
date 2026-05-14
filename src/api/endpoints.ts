export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    sendOtp: (email: string) => `/auth/verify/otp/${email}`,
    verifyOtp: "/auth/verify",
    verifyEmail: "/auth/verify",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/forgot-password/reset",
    logout: "/auth/logout",
    refreshToken: "/v1/auth/token",
    googleAuth: "/v1/auth/google",
    appleAuth: "/auth/apple",
  },
  users: {
    list: "/users",
    single: (id: string) => `/user/${id}`,
    profile: "/profile",
    matches: "/profile/matches",
    completeProfile: "/users/profile/complete",
    updateProfile: "/profile/update",
    changePassword: "/profile/password/change",
    updateInterests: "/profile/interests",
    deleteAccount: "/users/account",
    jilt: (id: string) => `/profile/dislike/${id}`,
    block: (id: string) => `/profile/block/${id}`,
    unblock: (id: string) => `/profile/unblock/${id}`,
    proceedToDate: (id: string) => `/profile/date/proceed/${id}`,
  },
  admin: {
    kiki: "/admin/kiki",
  },
  community: {
    list: "/community",
    join: (id: string | number) => `/community/${id}/join`,
  },
  report: {
    add: "/report/add",
  },
  subscription: {
    list: "/subscription",
    sponsor: (reportedUserId: string) =>
      `/subscription/sponsor/${reportedUserId}`,
  },
  image: {
    upload: "/image/upload",
  },
  personality: {
    add: "/personality/add",
  },
  session: {
    create: "/session",
  },
  dealBreaker: {
    create: "/deal-breaker",
  },
  rating: {
    create: "/rating",
  },
  notification: {
    unread: "/notification/unread",
    list: "/notification/user",
    readAll: "/notification/user/readall",
  },
  date: {
    accept: (dateId: string | number) => `/profile/date/accept/${dateId}`,
    reject: (dateId: string | number) => `/profile/date/reject/${dateId}`,
  },
  payments: {
    initialize: "/paystack/initialize",
    verify: "/paystack/verify",
  },
};
