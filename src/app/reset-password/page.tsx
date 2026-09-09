import type { Metadata } from "next";
import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | ZOQ's Gallery",
  description: "Choose a new password for your ZOQ's Gallery account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
