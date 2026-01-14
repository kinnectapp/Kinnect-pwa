import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { PasswordRuleState } from "@/lib/password-rules";
import { VerifyIcon } from "../icons";

type PasswordRulesProps = {
  state: PasswordRuleState;
  visible: boolean;
};

const RuleRow: React.FC<{ label: string; ok: boolean }> = ({ label, ok }) => {
 
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <VerifyIcon color={ok ? "#006333" : "#B2A0C6"} />
      <span className={"text-[#77707F] text-[12px]"}>{label}</span>
    </div>
  );
};

export const PasswordRules: React.FC<PasswordRulesProps> = ({
  state,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="mt-5 ">
      <div className="space-y-2 mt-4 px-4 py-3 rounded-md bg-[#F8F5FF] ">
        <RuleRow label="Must contain a capital letter" ok={state.hasUpper} />
        <RuleRow label="Must contain a small letter" ok={state.hasLower} />
        <RuleRow label="Must contain a number" ok={state.hasNumber} />
        <RuleRow label="At least 8 characters long" ok={state.hasLength} />
      </div>
    </div>
  );
};
