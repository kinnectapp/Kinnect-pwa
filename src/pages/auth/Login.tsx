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

const loginSchema = z.object({
  email: z.string().min(3, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, isLoggingIn, persistSession } = useLogin();
  const { useSendOtpMutation } = useAuth();
  const { mutateAsync: resendOtp } = useSendOtpMutation();

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
          const hasCompletedPersonality = Boolean(
            user?.personalityCompleted || user?.personalityId,
          );

          if (!user) {
            toast.error("Login succeeded but user data was not returned.");
            return;
          }

          if (!isVerified) {
            const verificationEmail = user.email || data.email;

            if (verificationEmail) {
              sessionStorage.setItem("verificationEmail", verificationEmail);
              try {
                await resendOtp({ email: verificationEmail });
              } catch (error: any) {
                toast.error(handleApiError(error));
              }
            }

            toast.error("Account is not verified. Please verify your email.");
            navigate("/auth/register/verify");
            return;
          }

          try {
            await persistSession(response);
          } catch (error: any) {
            toast.error(handleApiError(error));
            return;
          }

          if (!hasCompletedPersonality) {
            navigate("/onboarding/personality_test");
            return;
          }

          navigate("/app");
        },
        onError: (error: any) => {
          const errorMessage = handleApiError(error);

          toast.error(errorMessage, {
            duration: 4000,
            style: { borderRadius: "8px", background: "#333", color: "red" },
          });
        },
      },
    );
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
              className={`h-11 border-[#E4E4F0] text-[14px] ${errors.email ? "border-red-500" : ""}`}
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
                className={`h-11 border-[#E4E4F0] pr-10 text-[14px] ${errors.password ? "border-red-500" : ""}`}
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

          <div className="mt-2 border-t border-dashed border-[#E4E4F0] pt-4 space-y-3">
            <SocialLoginButtons />
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

const SocialLoginButtons = () => (
  <>
    <Button
      variant="outline"
      className="w-full h-10 rounded-full border-[#E4E4F0] text-[14px]"
    >
      <span className="mr-2 text-lg">G</span> Continue with Google
    </Button>
    <Button
      variant="outline"
      className="w-full h-10 rounded-full border-[#E4E4F0] text-[14px]"
    >
      <span className="mr-2 text-lg"></span> Continue with Apple
    </Button>
  </>
);

export default Login;
