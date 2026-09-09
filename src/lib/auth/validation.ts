export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateFullName(value: string): string | undefined {
  return value.trim().length === 0 ? "Full name is required." : undefined;
}

export function validateEmail(value: string): string | undefined {
  if (value.trim().length === 0) return "Email is required.";
  if (!isValidEmail(value)) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (value.length === 0) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (confirmPassword.length === 0) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (value.trim().length === 0) return undefined;
  return /^[0-9+\-\s()]{7,20}$/.test(value.trim())
    ? undefined
    : "Enter a valid phone number.";
}
