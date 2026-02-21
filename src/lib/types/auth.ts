export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  username: string;
  gender: string;
  dob: string;
  phone: string;
  confirmPassword: string;
}

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  otp: string;
  email: string;
}

export interface ResetPasswordPayload {
  confirmPassword: string;
  token: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
  accessToken: string;
}

export interface LogoutPayload {
  refreshToken: string;
  accessToken: string;
}

export interface User {
  id: string | number;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  gender: string;
  dob: string;
  phone: string;
  isVerified?: boolean;
  verified?: boolean;
  personalityCompleted?: boolean;
  personalityId?: number | null;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface LoginApiData {
  user: User;
  token?: string;
  accessToken?: string;
  refreshToken: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken?: string;
    token?: string;
    refreshToken: string;
  };
  message: string;
  status: boolean | string;
}

export interface OtpResponse {
  data: {
    email: string;
  };
  message: string;
  status: boolean;
}

export interface VerifyOtpResponse {
  data: {
    email: string;
    verified: boolean;
  };
  message: string;
  status: boolean;
}

export interface VerifyEmailResponse {
  data: {
    token?: string;
    accessToken?: string;
    refreshToken: string;
    user?: User;
  };
  message: string;
  status: boolean | string;
}

export interface ForgotPasswordResponse {
  data: {
    token: string;
    email: string;
  };
  message: string;
  status: boolean;
}

export interface ResetPasswordResponse {
  data: {
    email: string;
  };
  message: string;
  status: boolean;
}

export interface FileUploadResponse {
  data: {
    url: string;
    filename: string;
  };
  message: string;
  status: boolean;
}

export interface CompleteProfilePayload {
  bio?: string;
  avatar?: string;
  interests?: string[];
  location?: string;
  dob?: string;
  [key: string]: any;
}

export interface CompleteProfileResponse {
  data: User;
  message: string;
  status: boolean;
}

export interface UpdateProfilePayload {
  username?: string;
  occupation?: string;
  incognito?: boolean;
  phone?: string;
  dob?: string;
  gender?: string;
  bio?: string;
  religion?: string;
  bodyType?: string;
  complexion?: string;
  education?: string;
  smokeRate?: string;
  drinkRate?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePhotos?: string[];
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateInterestsPayload {
  interests: string[];
}

export interface PersonalityTestPayload {
  agreeablenessA: number;
  agreeablenessB: number;
  agreeablenessC: number;
  agreeablenessD: number;
  agreeablenessE: number;
  conscientiousnessA: number;
  conscientiousnessB: number;
  conscientiousnessC: number;
  conscientiousnessD: number;
  conscientiousnessE: number;
  neuroticismA: number;
  neuroticismB: number;
  neuroticismC: number;
  neuroticismD: number;
  neuroticismE: number;
  personalityScore: number;
  personalitySummary: string;
  personalityPercentage: number;
  personalityFlag: string;
  agreeablenessTotal: number;
  agreeablenessPercentage: number;
  agreeablenessSummary: string;
  agreeablenessFlag: string;
  conscientiousnessTotal: number;
  conscientiousnessPercentage: number;
  conscientiousnessSummary: string;
  conscientiousnessFlag: string;
  neuroticismTotal: number;
  neuroticismPercentage: number;
  neuroticismSummary: string;
  neuroticismFlag: string;
  user: Record<string, unknown>;
}

export interface BookSessionPayload {
  name: string;
  email: string;
  reason: string;
  date: string;
  time: string;
  userId: number;
}

export interface RatingPayload {
  review: string;
  rating: number;
}

export interface RatingResponse {
  data?: Record<string, unknown>;
  message: string;
  status: boolean | string;
}

export type DealBreakerPayload = {
  preferredReligion: Record<string, number>;
  smokingRate: Record<string, number>;
  bodyType: Record<string, number>;
  complexion: Record<string, number>;
  education: Record<string, number>;
};
