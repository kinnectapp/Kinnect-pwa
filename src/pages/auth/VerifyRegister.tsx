import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { OtpInput } from "./OtpInput";
import useAuth from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const VerifyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { useVerifyEmailMutation } = useAuth();
  const { mutate: verifyEmail, isPending } = useVerifyEmailMutation();
  const login = useAuthStore((state) => state.login);

  const [code, setCode] = React.useState("");
  const [email, setEmail] = React.useState("");

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
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    verifyEmail(
      { code },
      {
        onSuccess: (response) => {
          // Log user in with response data
          if (response.data) {
            login(
              response.data.user,
              response.data.accessToken,
              response.data.refreshToken,
            );
            // Clear sessionStorage
            sessionStorage.removeItem("verificationEmail");
            toast.success("Email verified successfully!");
            navigate("/onboarding");
          }
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
          <span className="font-medium text-[#55288D] text-[14px]">
            Resend Code
          </span>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyRegister;
