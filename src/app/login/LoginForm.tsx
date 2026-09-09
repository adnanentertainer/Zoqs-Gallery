"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, AuthMessage, PasswordInput } from "@/components/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { validateEmail } from "@/lib/auth/validation";
import { getSafeRedirect } from "@/lib/auth/redirect";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: password.length === 0 ? "Password is required." : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);
    setFormError(null);

    const { error } = await signIn(email, password);

    setIsSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    router.push(redirectTo);
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Log in to continue to your ZOQ's Gallery account."
      footer={
        <p className="font-body text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </p>
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
          error={errors.email}
          required
        />
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            required
          />
          <Link
            href="/forgot-password"
            className="self-end font-body text-sm text-muted underline-offset-2 hover:text-gold hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Log In
        </Button>
      </form>
    </AuthCard>
  );
}
