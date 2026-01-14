export type PasswordRuleState = {
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasLength: boolean;
};

export const getPasswordRuleState = (password: string): PasswordRuleState => ({
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasLength: password.length >= 8,
});

export const areAllPasswordRulesValid = (state: PasswordRuleState): boolean =>
  state.hasUpper && state.hasLower && state.hasNumber && state.hasLength;
