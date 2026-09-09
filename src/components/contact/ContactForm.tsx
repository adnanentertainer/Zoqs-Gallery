"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { validateFullName, validateEmail } from "@/lib/auth/validation";
import { siteConfig } from "@/constants/site";

const MESSAGE_MAX_LENGTH = 500;

function validateMessage(value: string): string | undefined {
  if (value.trim().length === 0) return "Message is required.";
  if (value.length > MESSAGE_MAX_LENGTH) {
    return `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }
  return undefined;
}

/**
 * There's no email/SMS backend in this project, so "sending" a message here
 * composes a pre-filled WhatsApp chat instead of posting to a form endpoint
 * that doesn't exist — a real, working action rather than a form that
 * silently goes nowhere.
 */
export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const nameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const messageError = validateMessage(message);
    if (nameError) nextErrors.fullName = nameError;
    if (emailError) nextErrors.email = emailError;
    if (messageError) nextErrors.message = messageError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const text = `Hi ZOQ's Gallery, my name is ${fullName.trim()} (${email.trim()}).\n\n${message.trim()}`;
    const whatsappNumber = siteConfig.socialLinks.whatsapp.replace(
      "https://wa.me/",
      "",
    );
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6"
      noValidate
    >
      <Input
        label="Full Name"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        error={errors.fullName}
        autoComplete="name"
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="contact-message"
          className="font-body text-sm font-medium text-primary"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="How can we help?"
          aria-invalid={!!errors.message || undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {errors.message && (
          <p
            id="contact-message-error"
            className="font-body text-xs text-error"
          >
            {errors.message}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary" size="lg" className="mt-2">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Send via WhatsApp
      </Button>
      <Text variant="caption" className="text-muted">
        This opens WhatsApp with your message pre-filled — nothing is sent
        automatically.
      </Text>
    </form>
  );
}
