import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "@/api/auth";
import {
  areAllPasswordRulesValid,
  getPasswordRuleState,
} from "@/lib/password-rules";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { RegisterPayload } from "@/lib/types/auth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";

const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { useRegisterMutation } = useAuth();
  const { mutate: register, isPending } = useRegisterMutation();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  // Retrieve registration data from sessionStorage
  const [registrationData, setRegistrationData] =
    React.useState<RegisterPayload | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("registrationData");
    if (!stored) {
      toast.error("Registration data not found. Please start over.");
      navigate("/auth/register");
      return;
    }
    try {
      const data = JSON.parse(stored) as RegisterPayload;
      setRegistrationData(data);
    } catch {
      toast.error("Invalid registration data. Please start over.");
      navigate("/auth/register");
    }
  }, [navigate]);

  const ruleState = getPasswordRuleState(password);
  const allValid = areAllPasswordRulesValid(ruleState);
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  const canSubmit = allValid && passwordsMatch && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !registrationData) return;

    // Combine registration data with password
    const payload: RegisterPayload = {
      ...registrationData,
      password,
      confirmPassword,
    };

    register(payload, {
      onError: (error: any) => {
        toast.error(handleApiError(error));
      },
      onSuccess: (response: any) => {
        const registerData = response?.data;
        if (registerData?.id && registerData?.email) {
          sessionStorage.setItem(
            "pendingUser",
            JSON.stringify({
              id: registerData.id,
              email: registerData.email,
            }),
          );
        }

        // Store email for verification page
        sessionStorage.setItem(
          "verificationEmail",
          registerData?.email || registrationData.email,
        );
        // Clear registration data
        localStorage.removeItem("registrationData");
        navigate("/auth/register/verify");
      },
    });
  };

  return (
    <AuthLayout
      title="Set Password"
      description="Input and confirm your password below"
      back={true}
    >
      <form className="flex h-full flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* password */}
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

          {/* confirm password */}
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
            {isPending ? "Creating account..." : "Submit"}
          </Button>

           
        </div>
      </form>
    </AuthLayout>
  );
};

export default SetPassword;
