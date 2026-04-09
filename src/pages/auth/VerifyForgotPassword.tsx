import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { OtpInput } from "./OtpInput";
import { toast } from "sonner";
import useAuth from "@/api/auth";
import { handleApiError } from "@/api/serviceUtils";

const VerifyForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const { useForgotPasswordMutation } = useAuth();
  const { mutate: resendOtp, isPending: isResending } =
    useForgotPasswordMutation();

  React.useEffect(() => {
    const storedEmail = sessionStorage.getItem("forgotPasswordEmail");
    if (!storedEmail) {
      toast.error("Email not found. Request password recovery again.");
      navigate("/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    // Backend expects token in reset-password payload; token is the OTP.
    sessionStorage.setItem("forgotPasswordToken", code);
    navigate("/auth/reset-password");
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email not found. Request password recovery again.");
      navigate("/auth/forgot-password");
      return;
    }

    resendOtp(
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
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <OtpInput onChange={setCode} />

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={code.length !== 6}
          >
            Verify
          </Button>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#6C6C80]">
          Didn't get a code?{" "}
          <button
            type="button"
            className="font-medium text-[#7D1BCB] disabled:opacity-60"
            onClick={handleResendOtp}
            disabled={isResending}
          >
            Resend Code
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyForgotPassword;
