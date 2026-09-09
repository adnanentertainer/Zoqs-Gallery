import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/app/login/LoginForm";

export const metadata: Metadata = {
  title: "Login | ZOQ's Gallery",
  description: "Log in to your ZOQ's Gallery account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
