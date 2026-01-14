import React from "react";
import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { OtpInput } from "./OtpInput";

const VerifyRegister: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = React.useState("");

  return (
    <AuthLayout
      title="Verify Your Email"
      description="A 6-digit code has been sent to example@kinnect.com. Input the code below to proceed."
    >
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          // verify and then:
          navigate("/auth/login");
        }}
      >
        <OtpInput onChange={setCode} />

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full mt-8"
            disabled={code.length !== 6}
          >
            Verify
          </Button>
        </div>

        <p className="mt-10 text-center text-[14px] text-[#6C6C80]">
          Didn’t get a code? <span className="font-medium text-[#55288D] text-[14px]">Resend Code</span>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyRegister;
