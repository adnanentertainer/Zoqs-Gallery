"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = "idle" | "error" | "success";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      setStatus("error");
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setStatus("success");
      setEmail("");
    }, 600);
  }

  return (
    <section className="bg-primary text-white">
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <Heading variant="h2" as="h2" className="text-white">
          Join the ZOQ&apos;s Circle
        </Heading>
        <Text variant="bodyLg" className="max-w-lg text-white/80">
          Be the first to discover new arrivals, exclusive collections and
          special offers.
        </Text>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-start"
        >
          <div className="flex-1 text-left">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatus("idle");
                }}
                placeholder="Enter your email"
                aria-invalid={status === "error" || undefined}
                aria-describedby={status === "error" ? errorId : undefined}
                className={cn(
                  "h-12 w-full rounded-sm border bg-white pl-11 pr-4 font-body text-sm text-primary placeholder:text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-gold",
                  status === "error" ? "border-error" : "border-transparent",
                )}
              />
            </div>
            {status === "error" && (
              <p
                id={errorId}
                className="mt-2 flex items-center gap-1.5 font-body text-xs text-white"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                Please enter a valid email address.
              </p>
            )}
            {status === "success" && (
              <p className="mt-2 flex items-center gap-1.5 font-body text-xs text-white">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-gold"
                  aria-hidden="true"
                />
                You&apos;re subscribed! Watch your inbox for new arrivals.
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            isLoading={isSubmitting}
          >
            Subscribe
          </Button>
        </form>
      </Container>
    </section>
  );
}
