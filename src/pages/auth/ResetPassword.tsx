import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);

  return (
    <AuthLayout
      title="Reset Password"
      description="Input and confirm your new password below"
    >
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // reset password, then:
          navigate("/auth/login");
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Password
            </Label>
            <div className="relative">
              <Input
                type={show1 ? "text" : "password"}
                placeholder="Enter password"
                className="h-11 border-[#E4E4F0] pr-10 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShow1((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-[#B200D7]"
              >
                {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                type={show2 ? "text" : "password"}
                placeholder="Confirm password"
                className="h-11 border-[#E4E4F0] pr-10 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShow2((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-[#B200D7]"
              >
                {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
