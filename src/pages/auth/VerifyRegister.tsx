import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { OtpInput } from "./OtpInput";
import useAuth from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";

const VerifyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { useVerifyEmailMutation, useSendOtpMutation } = useAuth();
  const { mutate: verifyEmail, isPending } = useVerifyEmailMutation();
  const { mutate: sendOtp, isPending: isResending } = useSendOtpMutation();
  const login = useAuthStore((state) => state.login);
  const setTokens = useAuthStore((state) => state.setTokens);

  const [code, setCode] = React.useState("");
  const [email, setEmail] = React.useState("");

  const getPendingUser = () => {
    try {
      const raw = sessionStorage.getItem("pendingUser");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.id || !parsed?.email) return null;
      return { id: parsed.id, email: parsed.email };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem("verificationEmail");
    if (!storedEmail) {
      toast.error("Email not found. Please start over.");
      navigate("/auth/register");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email not found. Please start over.");
      return;
    }

    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    verifyEmail(
      { email, otp: code },
      {
        onSuccess: async (response) => {
          const accessToken = response.data?.accessToken || response.data?.token;
          const refreshToken = response.data?.refreshToken;

          if (!accessToken || !refreshToken) {
            toast.error("Verification succeeded but tokens were not returned.");
            return;
          }

          if (response.data?.user) {
            await login(response.data.user, accessToken, refreshToken);
          } else {
            const pendingUser = getPendingUser();
            if (pendingUser) {
              await login(pendingUser, accessToken, refreshToken);
            } else {
              await setTokens(accessToken, refreshToken);
            }
          }

          // Clear sessionStorage
          sessionStorage.removeItem("verificationEmail");
          sessionStorage.removeItem("pendingUser");
          toast.success("Email verified successfully!");
          navigate("/onboarding");
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email not found. Please start over.");
      return;
    }

    sendOtp(
      { email },
      {
        onSuccess: () => {
          toast.success("A new OTP has been sent to your email.");
        },
        onError: (error: any) => {
          toast.error(handleApiError(error));
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      description={`A 6-digit code has been sent to ${email || "your email"}. Input the code below to proceed.`}
    >
      <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
        <OtpInput onChange={setCode} />

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full mt-8"
            disabled={code.length !== 6 || isPending}
          >
            {isPending ? "Verifying..." : "Verify"}
          </Button>
        </div>

        <p className="mt-10 text-center text-[14px] text-[#6C6C80]">
          Didn’t get a code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="font-medium text-[#55288D] text-[14px] disabled:opacity-60"
          >
            Resend Code
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyRegister;
