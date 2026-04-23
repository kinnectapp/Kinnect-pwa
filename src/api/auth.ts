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
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  CompleteProfilePayload,
  CompleteProfileResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateInterestsPayload,
  PersonalityTestPayload,
  BookSessionPayload,
  DealBreakerPayload,
  RatingPayload,
  RatingResponse,
} from "@/lib/types/auth";
import { encodeBase64 } from "@/lib/base64";

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
        const encodedPayload: LoginPayload = {
          ...payload,
          password: encodeBase64(payload.password),
        };
        const response = await http.post<AuthResponse>(
          endpoints.auth.login,
          encodedPayload,
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
        const encodedPayload: RegisterPayload = {
          ...payload,
          password: encodeBase64(payload.password),
          confirmPassword: encodeBase64(payload.confirmPassword),
        };
        const response = await http.post<AuthResponse>(
          endpoints.auth.register,
          encodedPayload,
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
        const encodedPayload: VerifyOtpPayload = {
          ...payload,
          otp: encodeBase64(payload.otp),
        };
        const response = await http.post<VerifyOtpResponse>(
          endpoints.auth.verifyOtp,
          encodedPayload,
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
        const encodedPayload: ResetPasswordPayload = {
          ...payload,
          token: encodeBase64(payload.token),
          password: encodeBase64(payload.password),
          confirmPassword: encodeBase64(payload.confirmPassword),
        };
        const response = await http.post<ResetPasswordResponse>(
          endpoints.auth.resetPassword,
          encodedPayload,
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
    UpdateProfilePayload
  > => {
    return useMutation({
      mutationFn: async (payload: UpdateProfilePayload) => {
        const response = await http.put<CompleteProfileResponse>(
          endpoints.users.updateProfile,
          payload,
        );
        return response.data;
      },
    });
  };

  // Get single user mutation
  const useGetUserMutation = (): UseMutationResult<any, Error, string> => {
    return useMutation({
      mutationFn: async (userId: string) => {
        const response = await http.get(endpoints.users.single(userId));
        return response.data;
      },
    });
  };

  // Update interests mutation
  const useUpdateInterestsMutation = (): UseMutationResult<
    any,
    Error,
    UpdateInterestsPayload
  > => {
    return useMutation({
      mutationFn: async (payload: UpdateInterestsPayload) => {
        const response = await http.put(
          endpoints.users.updateInterests,
          payload,
        );
        return response.data;
      },
    });
  };

  // Change password mutation
  const useChangePasswordMutation = (): UseMutationResult<
    any,
    Error,
    ChangePasswordPayload
  > => {
    return useMutation({
      mutationFn: async (payload: ChangePasswordPayload) => {
        const encodedPayload: ChangePasswordPayload = {
          ...payload,
          oldPassword: encodeBase64(payload.oldPassword),
          newPassword: encodeBase64(payload.newPassword),
          confirmNewPassword: encodeBase64(payload.confirmNewPassword),
        };
        const response = await http.put(
          endpoints.users.changePassword,
          encodedPayload,
        );
        return response.data;
      },
    });
  };

  // Add personality test result mutation
  const useAddPersonalityMutation = (): UseMutationResult<
    any,
    Error,
    PersonalityTestPayload
  > => {
    return useMutation({
      mutationFn: async (payload: PersonalityTestPayload) => {
        const response = await http.post(endpoints.personality.add, payload);
        return response.data;
      },
    });
  };

  // Book session mutation
  const useBookSessionMutation = (): UseMutationResult<
    any,
    Error,
    BookSessionPayload
  > => {
    return useMutation({
      mutationFn: async (payload: BookSessionPayload) => {
        const response = await http.post(endpoints.session.create, payload);
        return response.data;
      },
    });
  };

  // Add deal breaker mutation
  const useAddDealBreakerMutation = (): UseMutationResult<
    any,
    Error,
    DealBreakerPayload
  > => {
    return useMutation({
      mutationFn: async (payload: DealBreakerPayload) => {
        const response = await http.post(endpoints.dealBreaker.create, payload);
        return response.data;
      },
    });
  };

  // Add rating & review mutation
  const useAddRatingMutation = (): UseMutationResult<
    RatingResponse,
    Error,
    RatingPayload
  > => {
    return useMutation({
      mutationFn: async (payload: RatingPayload) => {
        const response = await http.post<RatingResponse>(
          endpoints.rating.create,
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
    VerifyEmailResponse,
    Error,
    VerifyOtpPayload
  > => {
    return useMutation({
      mutationFn: async (payload: VerifyOtpPayload) => {
        const encodedPayload: VerifyOtpPayload = {
          ...payload,
          otp: encodeBase64(payload.otp),
        };
        const response = await http.post<VerifyEmailResponse>(
          endpoints.auth.verifyEmail,
          encodedPayload,
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
    useChangePasswordMutation,
    useGetUserMutation,
    useUpdateInterestsMutation,
    useAddPersonalityMutation,
    useAddDealBreakerMutation,
    useAddRatingMutation,
    useBookSessionMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useGoogleAuthMutation,
    useAppleAuthMutation,
    useDeleteAccountMutation,
  };
};

export default useAuth;
