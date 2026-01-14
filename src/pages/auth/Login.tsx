import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <AuthLayout
      title="Sign In to your account"
      description="Fill the fields below to sign in to your account"
    >
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // handle real login here
          navigate("/app");
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Email Address or Username
            </Label>
            <Input
              type="text"
              placeholder="Enter email or username"
              className="h-11 border-[#E4E4F0] text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="h-11 border-[#E4E4F0] pr-10 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-[#B200D7]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
          <Button type="submit"  >
            Sign In
          </Button>

          <p className="text-center text-[13px] text-[#6C6C80]">
            Don’t have an account?{" "}
            <Link to="/auth/register" className="font-medium text-[#7D1BCB]">
              Create account
            </Link>
          </p>

          <div className="mt-2 border-t border-dashed border-[#E4E4F0] pt-4 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full border-[#E4E4F0] text-[14px]"
            >
              <span className="mr-2 text-lg">G</span>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full border-[#E4E4F0] text-[14px]"
            >
              <span className="mr-2 text-lg"></span>
              Continue with Apple
            </Button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
