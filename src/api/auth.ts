/**
 * Auth hook for handling all authentication-related mutations
 * Uses TanStack React Query for async state management
 */

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useHttp } from "./http";
import { useHttpFormData } from "./httpFormData";
import { endpoints } from "./endpoints";
import {
  LoginPayload,
  RegisterPayload,
  SendOtpPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  ForgotPasswordPayload,
  FileUploadResponse,
  AuthResponse,
  OtpResponse,
  VerifyOtpResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  CompleteProfilePayload,
  CompleteProfileResponse,
} from "@/lib/types/auth";

export const useAuth = () => {
  const { http } = useHttp();
  const { http: httpFormData } = useHttpFormData();

  // Login mutation
  const useLoginMutation = (): UseMutationResult<
    AuthResponse,
    Error,
    LoginPayload
  > => {
    return useMutation({
      mutationFn: async (payload: LoginPayload) => {
        const response = await http.post<AuthResponse>(
          endpoints.auth.login,
          payload,
        );
        return response.data;
      },
    });
  };

  // Register mutation
  const useRegisterMutation = (): UseMutationResult<
    AuthResponse,
    Error,
    RegisterPayload
  > => {
    return useMutation({
      mutationFn: async (payload: RegisterPayload) => {
        const response = await http.post<AuthResponse>(
          endpoints.auth.register,
          payload,
        );
        return response.data;
      },
    });
  };

  // Send OTP mutation
  const useSendOtpMutation = (): UseMutationResult<
    OtpResponse,
    Error,
    SendOtpPayload
  > => {
    return useMutation({
      mutationFn: async (payload: SendOtpPayload) => {
        const response = await http.get<OtpResponse>(
          endpoints.auth.sendOtp(payload.email),
        );
        return response.data;
      },
    });
  };

  // Verify OTP mutation
  const useVerifyOtpMutation = (): UseMutationResult<
    VerifyOtpResponse,
    Error,
    VerifyOtpPayload
  > => {
    return useMutation({
      mutationFn: async (payload: VerifyOtpPayload) => {
        const response = await http.post<VerifyOtpResponse>(
          endpoints.auth.verifyOtp,
          payload,
        );
        return response.data;
      },
    });
  };

  // Forgot password mutation
  const useForgotPasswordMutation = (): UseMutationResult<
    ForgotPasswordResponse,
    Error,
    ForgotPasswordPayload
  > => {
    return useMutation({
      mutationFn: async (payload: ForgotPasswordPayload) => {
        const response = await http.post<ForgotPasswordResponse>(
          endpoints.auth.forgotPassword,
          payload,
        );
        return response.data;
      },
    });
  };

  // Reset password mutation
  const useResetPasswordMutation = (): UseMutationResult<
    ResetPasswordResponse,
    Error,
    ResetPasswordPayload
  > => {
    return useMutation({
      mutationFn: async (payload: ResetPasswordPayload) => {
        const response = await http.post<ResetPasswordResponse>(
          endpoints.auth.resetPassword,
          payload,
        );
        return response.data;
      },
    });
  };

  // File upload mutation
  const useFileUploadMutation = (): UseMutationResult<
    FileUploadResponse,
    Error,
    FormData
  > => {
    return useMutation({
      mutationFn: async (payload: FormData) => {
        const response = await httpFormData.post<FileUploadResponse>(
          endpoints.image.upload,
          payload,
        );
        return response.data;
      },
    });
  };

  // Complete profile mutation
  const useCompleteProfileMutation = (): UseMutationResult<
    CompleteProfileResponse,
    Error,
    CompleteProfilePayload
  > => {
    return useMutation({
      mutationFn: async (payload: CompleteProfilePayload) => {
        const response = await http.post<CompleteProfileResponse>(
          endpoints.users.completeProfile,
          payload,
        );
        return response.data;
      },
    });
  };

  // Update profile mutation
  const useUpdateProfileMutation = (): UseMutationResult<
    CompleteProfileResponse,
    Error,
    CompleteProfilePayload
  > => {
    return useMutation({
      mutationFn: async (payload: CompleteProfilePayload) => {
        const response = await http.patch<CompleteProfileResponse>(
          endpoints.users.updateProfile,
          payload,
        );
        return response.data;
      },
    });
  };

  // Logout mutation
  const useLogoutMutation = (): UseMutationResult<any, Error, void> => {
    return useMutation({
      mutationFn: async () => {
        const response = await http.post(endpoints.auth.logout, {});
        return response.data;
      },
    });
  };

  // Refresh token mutation
  const useRefreshTokenMutation = (): UseMutationResult<
    AuthResponse,
    Error,
    void
  > => {
    return useMutation({
      mutationFn: async () => {
        const response = await http.post<AuthResponse>(
          endpoints.auth.refreshToken,
          {},
        );
        return response.data;
      },
    });
  };

  // Google auth mutation
  const useGoogleAuthMutation = (): UseMutationResult<
    AuthResponse,
    Error,
    { token: string }
  > => {
    return useMutation({
      mutationFn: async (payload: { token: string }) => {
        const response = await http.post<AuthResponse>(
          endpoints.auth.googleAuth,
          payload,
        );
        return response.data;
      },
    });
  };

  // Apple auth mutation
  const useAppleAuthMutation = (): UseMutationResult<
    AuthResponse,
    Error,
    { token: string }
  > => {
    return useMutation({
      mutationFn: async (payload: { token: string }) => {
        const response = await http.post<AuthResponse>(
          endpoints.auth.appleAuth,
          payload,
        );
        return response.data;
      },
    });
  };

  // Verify email mutation
  const useVerifyEmailMutation = (): UseMutationResult<
    AuthResponse,
    Error,
    { code: string }
  > => {
    return useMutation({
      mutationFn: async (payload: { code: string }) => {
        const response = await http.post<AuthResponse>(
          endpoints.auth.verifyEmail,
          payload,
        );
        return response.data;
      },
    });
  };

  // Delete account mutation
  const useDeleteAccountMutation = (): UseMutationResult<any, Error, void> => {
    return useMutation({
      mutationFn: async () => {
        const response = await http.delete(endpoints.users.deleteAccount);
        return response.data;
      },
    });
  };

  return {
    useLoginMutation,
    useRegisterMutation,
    useSendOtpMutation,
    useVerifyOtpMutation,
    useVerifyEmailMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useFileUploadMutation,
    useCompleteProfileMutation,
    useUpdateProfileMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useGoogleAuthMutation,
    useAppleAuthMutation,
    useDeleteAccountMutation,
  };
};

export default useAuth;
