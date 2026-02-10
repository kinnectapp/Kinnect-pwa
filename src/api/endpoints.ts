export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    sendOtp: (email: string) => `/auth/verify/otp/${email}`,
    verifyOtp: "/auth/verify",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/forgot-password/reset",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    googleAuth: "/auth/google",
    appleAuth: "/auth/apple",
  },
  users: {
    list: "/users",
    single: (id: string) => `/users/${id}`,
    completeProfile: "/users/profile/complete",
    updateProfile: "/users/profile",
    deleteAccount: "/users/account",
  },
  image: {
    upload: "/image/upload",
  },
};
