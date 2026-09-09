import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/app/forgot-password/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | ZOQ's Gallery",
  description: "Reset your ZOQ's Gallery account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
