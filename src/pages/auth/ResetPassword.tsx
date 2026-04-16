import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  areAllPasswordRulesValid,
  getPasswordRuleState,
} from "@/lib/password-rules";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { AuthLayout } from "@/components/layout/AuthLayout";
import useAuth from "@/api/auth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { useResetPasswordMutation } = useAuth();
  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string>("");

  React.useEffect(() => {
    const token = sessionStorage.getItem("forgotPasswordToken");
    if (!token) {
      toast.error("Reset token not found. Request password recovery again.");
      navigate("/auth/forgot-password");
      return;
    }
    setResetToken(token);
  }, [navigate]);

  const ruleState = getPasswordRuleState(password);
  const allValid = areAllPasswordRulesValid(ruleState);
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  const canSubmit = allValid && passwordsMatch && !!resetToken && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    resetPassword(
      {
        token: resetToken,
        password,
        confirmPassword,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem("forgotPasswordToken");
          sessionStorage.removeItem("forgotPasswordEmail");
          toast.success("Password reset successful. Please sign in.");
          navigate("/auth/login");
        },
        onError: (error: any) => {
          toast.error(handleApiError(error));
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Reset Password"
      description="Input and confirm your new password below"
    >
      <form className="flex h-full flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* new password */}
          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="h-11 border-[#E4E4F0] pr-10 text-[14px] [-webkit-text-size-adjust:100%]"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!touched) setTouched(true);
                }}
                onFocus={() => setTouched(true)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-[#B200D7]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <PasswordRules state={ruleState} visible={touched} />
          </div>

          {/* confirm new password */}
          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="h-11 border-[#E4E4F0] pr-10 text-[14px] [-webkit-text-size-adjust:100%]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-[#B200D7]"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="pt-1 text-[12px] text-[#DC2626]">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
