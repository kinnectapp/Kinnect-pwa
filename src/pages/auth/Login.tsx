import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useLogin } from "@/hooks/useAuth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import useAuth from "@/api/auth";
import { LoginApiData } from "@/lib/types/auth";
import { GOOGLE_WEB_CLIENT_ID } from "@/env";
 
const loginSchema = z.object({
  email: z.string().min(3, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const UNVERIFIED_ACCOUNT_PATTERN = /has not been verified/i;
const EMAIL_IN_TEXT_PATTERN =
  /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, isLoggingIn, persistSession } = useLogin();
  const { useSendOtpMutation, useGoogleAuthMutation } = useAuth();
  const { mutateAsync: resendOtp } = useSendOtpMutation();
  const { mutateAsync: googleAuth, isPending: isGoogleLoading } =
    useGoogleAuthMutation();
  const [isGoogleReady, setIsGoogleReady] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsGoogleReady(true);
      return;
    }

    const scriptId = "google-identity-services";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleReady(true);
    document.head.appendChild(script);
  }, []);

  const finalizeAuth = async (response: LoginApiData) => {
    const user = response?.user;

    if (!user) {
      toast.error("Login succeeded but user data was not returned.");
      return;
    }

    const hasCompletedPersonality = Boolean(
      user?.personalityCompleted || user?.personalityId,
    );

    await persistSession(response);

    if (!hasCompletedPersonality) {
      navigate("/onboarding/personality_test");
      return;
    }

    navigate("/app");
  };

  const extractVerificationEmail = (
    message: string,
    fallbackValue?: string,
  ) => {
    const matchedEmail = message.match(EMAIL_IN_TEXT_PATTERN)?.[1];
    if (matchedEmail) {
      return matchedEmail;
    }

    if (fallbackValue && fallbackValue.includes("@")) {
      return fallbackValue;
    }

    return "";
  };

  const handleUnverifiedAccount = async (
    verificationEmail: string,
    message = "Account is not verified. Please verify your email.",
  ) => {
    if (!verificationEmail) {
      toast.error(message);
      return;
    }

    sessionStorage.setItem("verificationEmail", verificationEmail);

    try {
      await resendOtp({ email: verificationEmail });
    } catch (error: unknown) {
      toast.error(handleApiError(error));
    }

    toast.error(message);
    navigate("/auth/register/verify");
  };

  const onSubmit = (data: LoginFormValues) => {
    login(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: async (response: LoginApiData) => {
          const user = response?.user;
          const isVerified = Boolean(user?.isVerified ?? user?.verified);

          if (!user) {
            toast.error("Login succeeded but user data was not returned.");
            return;
          }

          if (!isVerified) {
            const verificationEmail = user.email || data.email;

            await handleUnverifiedAccount(verificationEmail);
            return;
          }

          try {
            await finalizeAuth(response);
          } catch (error: unknown) {
            toast.error(handleApiError(error));
          }
        },
        onError: async (error: unknown) => {
          const errorMessage = handleApiError(error);

          if (UNVERIFIED_ACCOUNT_PATTERN.test(errorMessage)) {
            const verificationEmail = extractVerificationEmail(
              errorMessage,
              data.email,
            );

            await handleUnverifiedAccount(verificationEmail, errorMessage);
            return;
          }

          toast.error(errorMessage, {
            duration: 4000,
            style: { borderRadius: "8px", background: "#333", color: "red" },
          });
        },
      },
    );
  };

  const handleGoogleLogin = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      toast.error("Google web client ID is missing.");
      return;
    }

    if (!window.google?.accounts?.id || !isGoogleReady) {
      toast.error("Google login is still loading. Please try again.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      ux_mode: "popup",
      callback: async (googleResponse) => {
        try {
          const credential = googleResponse?.credential;
          if (!credential) {
            toast.error("No Google ID token was returned.");
            return;
          }

          // Backend contract:
          // POST /v1/auth/google { token: <google_id_token> }
          const response = await googleAuth({ token: credential });
          const dataNode = response.data;
          const user = dataNode?.user;
          const token = dataNode?.token || dataNode?.accessToken;
          const refreshToken = dataNode?.refreshToken;

          if (!user || !token || !refreshToken) {
            toast.error("Google login response is missing session data.");
            return;
          }

          await finalizeAuth({
            user,
            token,
            refreshToken,
          });
        } catch (error: unknown) {
          toast.error(handleApiError(error));
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  return (
    <AuthLayout
      title="Sign In to your account"
      description="Fill the fields below to sign in to your account"
    >
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[14px] font-[500] text-[#1C1C1C]"
            >
              Email Address
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="Enter email or username"
              className={`h-11 border-[#E4E4F0] text-[14px] [-webkit-text-size-adjust:100%] ${errors.email ? "border-red-500" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-[14px] font-[500] text-[#1C1C1C]"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className={`h-11 border-[#E4E4F0] pr-10 text-[14px] [-webkit-text-size-adjust:100%] ${errors.password ? "border-red-500" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-[#B200D7]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="mt-1 text-right">
            <Link
              to="/auth/forgot-password"
              className="text-[16px] underline font-medium text-[#55288D]"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Button type="submit" disabled={isLoggingIn}>
            {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </Button>

          <p className="text-center text-[13px] text-[#6C6C80]">
            Don’t have an account?{" "}
            <Link to="/auth/register" className="font-medium text-[#7D1BCB]">
              Create account
            </Link>
          </p>

          <div className="mt-2 space-y-3 border-t border-dashed border-[#E4E4F0] pt-4">
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              isGoogleLoading={isGoogleLoading}
              isGoogleReady={isGoogleReady}
            />
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

const SocialLoginButtons: React.FC<{
  onGoogleLogin: () => void;
  isGoogleLoading: boolean;
  isGoogleReady: boolean;
}> = ({ onGoogleLogin, isGoogleLoading, isGoogleReady }) => (
  <>
    <Button
      variant="outline"
      className="h-10 w-full rounded-full border-[#E4E4F0] text-[14px]"
      onClick={onGoogleLogin}
      type="button"
      disabled={!isGoogleReady || isGoogleLoading}
    >
      <span className="mr-2 text-lg">G</span>
      {isGoogleLoading ? "Signing in..." : "Continue with Google"}
    </Button>
    <Button
      variant="outline"
      className="h-10 w-full rounded-full border-[#E4E4F0] text-[14px]"
      type="button"
    >
      <span className="mr-2 text-lg"></span> Continue with Apple
    </Button>
  </>
);

export default Login;
