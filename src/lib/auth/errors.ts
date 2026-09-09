/**
 * Converts Supabase Auth errors into user-friendly copy. Never surface
 * error.message directly — it can leak implementation details.
 */
export function toFriendlyAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : undefined;
  const message = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "Your email or password is incorrect.";
  }
  if (
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists.";
  }
  if (code === "weak_password" || message.includes("password should be")) {
    return "Please choose a stronger password (at least 8 characters).";
  }
  if (code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (
    code === "same_password" ||
    message.includes("should be different from the old password")
  ) {
    return "Your new password must be different from your current password.";
  }
  if (message.includes("network") || message.includes("fetch failed")) {
    return "Something went wrong. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
