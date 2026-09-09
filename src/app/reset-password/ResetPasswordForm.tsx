"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, AuthMessage, PasswordInput } from "@/components/auth";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toFriendlyAuthError } from "@/lib/auth/errors";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/lib/auth/validation";

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

export function ResetPasswordForm() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(nextErrors);
    if (nextErrors.password || nextErrors.confirmPassword) return;

    setIsSubmitting(true);
    setFormError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      setFormError(toFriendlyAuthError(error));
      return;
    }

    setIsSuccess(true);
    window.setTimeout(() => router.push("/account"), 2000);
  }

  if (!isAuthenticated) {
    return (
      <AuthCard title="Link Expired">
        <AuthMessage
          variant="error"
          message="This password reset link is invalid or has expired. Please request a new one."
        />
        <Link
          href="/forgot-password"
          className="mt-6 block text-center font-body text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard title="Password Updated">
        <AuthMessage
          variant="success"
          message="Your password has been updated. Redirecting you to your account..."
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a New Password"
      subtitle="Choose a new password for your account."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <AuthMessage variant="error" message={formError} />}

        <PasswordInput
          label="New Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
        />
        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Update Password
        </Button>
      </form>
    </AuthCard>
  );
}
