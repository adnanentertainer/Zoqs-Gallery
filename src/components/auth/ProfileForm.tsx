"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { useAuth } from "@/context/AuthContext";
import { validateFullName, validatePhone } from "@/lib/auth/validation";
import type { Profile } from "@/types";

interface FieldErrors {
  fullName?: string;
  phone?: string;
}

export function ProfileForm() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile loads asynchronously after mount (see AuthContext). Seed the form
  // once it arrives by adjusting state during render (React's recommended
  // alternative to an effect for this) rather than a useEffect, which would
  // cause an extra render pass on every profile change.
  const [syncedProfile, setSyncedProfile] = useState<Profile | null>(profile);
  if (profile !== syncedProfile) {
    setSyncedProfile(profile);
    setFullName(profile?.fullName ?? "");
    setPhone(profile?.phone ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      phone: validatePhone(phone),
    };
    setErrors(nextErrors);
    if (nextErrors.fullName || nextErrors.phone) return;

    setIsSubmitting(true);
    setFormError(null);
    setShowSuccess(false);

    const { error } = await updateProfile({ fullName, phone });

    setIsSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }

    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <AuthMessage variant="error" message={formError} />}
      {showSuccess && (
        <AuthMessage
          variant="success"
          message="Profile updated successfully."
        />
      )}

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
        value={user?.email ?? ""}
        disabled
        readOnly
      />

      <Input
        label="Phone"
        type="tel"
        name="phone"
        autoComplete="tel"
        placeholder="03XX-XXXXXXX"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={errors.phone}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-fit"
      >
        Save Changes
      </Button>
    </form>
  );
}
