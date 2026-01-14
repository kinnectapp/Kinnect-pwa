import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Forgotten Password?"
      description="Provide your registered email address below to recover your password."
    >
      <form
        className="flex  flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // trigger API, then:
          navigate("/auth/forgot-password/verify");
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="example@kinnect.com"
              className="h-11 border-[#E4E4F0] text-[14px]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Button type="submit" >
            Recover Password
          </Button>
        </div>
      </form>
      <div className="flex-1 flex justify-center items-end">
        <p className="text-center text-[13px] text-[#6C6C80]">
          Remember now?{" "}
          <Link to="/auth/login" className="font-medium text-[#7D1BCB]">
            Back To Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
