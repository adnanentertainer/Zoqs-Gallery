"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, AuthMessage, PasswordInput } from "@/components/auth";
import { Input } from "@/components/ui/Input";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from "@/lib/auth/validation";

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      terms: agreedToTerms
        ? undefined
        : "Please accept the Terms and Privacy Policy.",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    setFormError(null);

    const { error, needsEmailConfirmation: pending } = await signUp(
      email,
      password,
      fullName.trim(),
    );

    setIsSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    if (pending) {
      setNeedsEmailConfirmation(true);
      return;
    }

    router.push("/account");
  }

  if (needsEmailConfirmation) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="One last step before your account is ready."
      >
        <AuthMessage
          variant="success"
          message="Check your email to confirm your account, then log in below."
        />
        <Link
          href="/login"
          className={buttonVariants("primary", "lg", "mt-6 w-full")}
        >
          Go to Login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Join ZOQ's Gallery for a more personal shopping experience."
      footer={
        <p className="font-body text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <AuthMessage variant="error" message={formError} />}

        <Input
          label="Full Name"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={errors.fullName}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          required
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
        />
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-2 font-body text-sm text-primary">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) => setAgreedToTerms(event.target.checked)}
              aria-invalid={!!errors.terms}
              className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-beige text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
            <span>
              I agree to the{" "}
              <Link
                href="/#terms-and-conditions"
                className="underline underline-offset-2 hover:text-gold"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/#privacy-policy"
                className="underline underline-offset-2 hover:text-gold"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="font-body text-xs text-error">{errors.terms}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Create Account
        </Button>
      </form>
    </AuthCard>
  );
}
