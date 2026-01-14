import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { OtpInput } from "./OtpInput";

const VerifyForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = React.useState("");

  return (
    <AuthLayout
      title="Verify Your Email"
      description="A 6-digit code has been sent to example@kinnect.com. Input the code below to proceed."
    >
      <form
        className="flex h-full flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          // verify code then:
          navigate("/auth/reset-password");
        }}
      >
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
          Didn’t get a code?{" "}
          <span className="font-medium text-[#7D1BCB]"> Resend Code</span>
        </p>

        

        
      </form>
    </AuthLayout>
  );
};

export default VerifyForgotPassword;
