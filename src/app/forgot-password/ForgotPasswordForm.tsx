"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthCard, AuthMessage } from "@/components/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { toFriendlyAuthError } from "@/lib/auth/errors";
import { validateEmail } from "@/lib/auth/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    if (!isSupabaseConfigured()) {
      setFormError(
        "Authentication isn't configured yet. Add Supabase credentials to enable password reset.",
      );
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );

    setIsSubmitting(false);

    // Show the same success state regardless of whether the email exists —
    // Supabase's own behavior here can vary by project setting, and
    // confirming/denying an email's existence is a privacy leak either way.
    if (resetError) {
      console.error(
        "[ForgotPasswordForm] resetPasswordForEmail failed:",
        resetError,
      );
      setFormError(toFriendlyAuthError(resetError));
      return;
    }

    setIsSent(true);
  }

  if (isSent) {
    return (
      <AuthCard title="Check Your Email">
        <AuthMessage
          variant="success"
          message="If an account exists for that email, we've sent a link to reset your password."
        />
        <Link
          href="/login"
          className="mt-6 block text-center font-body text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Back to Login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      footer={
        <Link
          href="/login"
          className="font-body text-sm text-muted underline-offset-2 hover:text-gold hover:underline"
        >
          Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <AuthMessage variant="error" message={formError} />}

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Send Reset Link
        </Button>
      </form>
    </AuthCard>
  );
}
