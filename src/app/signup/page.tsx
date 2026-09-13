import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/app/signup/SignupForm";

export const metadata: Metadata = {
  title: "Create Account | ZOQ's Gallery",
  description: "Create your ZOQ's Gallery account.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
