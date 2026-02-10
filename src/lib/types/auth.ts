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
  otp: number;
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
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  gender: string;
  dob: string;
  phone: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  status: boolean;
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
