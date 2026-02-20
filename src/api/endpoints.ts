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
    refreshToken: "/auth/refresh-token",
    googleAuth: "/auth/google",
    appleAuth: "/auth/apple",
  },
  users: {
    list: "/users",
    single: (id: string) => `/user/${id}`,
    completeProfile: "/users/profile/complete",
    updateProfile: "/profile/update",
    changePassword: "/profile/password/change",
    updateInterests: "/profile/interests",
    deleteAccount: "/users/account",
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
};
