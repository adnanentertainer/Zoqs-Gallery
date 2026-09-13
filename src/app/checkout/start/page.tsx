import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn, UserPlus, ShoppingBag } from "lucide-react";
import { AuthCard } from "@/components/auth";
import { buttonVariants } from "@/components/ui/Button";
import { getServerUser } from "@/lib/auth/getServerUser";

export const metadata: Metadata = {
  title: "Checkout | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

const CHECKOUT_REDIRECT = "/checkout";

export default async function CheckoutStartPage() {
  // Already signed in — nothing to choose, go straight to the real form.
  const user = await getServerUser();
  if (user) {
    redirect(CHECKOUT_REDIRECT);
  }

  return (
    <AuthCard
      title="How would you like to check out?"
      subtitle="Log in for faster checkout next time, or continue as a guest — it's up to you."
    >
      <div className="flex flex-col gap-3">
        <Link
          href={`/login?redirect=${CHECKOUT_REDIRECT}`}
          className={buttonVariants("primary", "lg", "w-full justify-center")}
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Log In
        </Link>
        <Link
          href={`/signup?redirect=${CHECKOUT_REDIRECT}`}
          className={buttonVariants("outline", "lg", "w-full justify-center")}
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Create Account
        </Link>
        <Link
          href={CHECKOUT_REDIRECT}
          className={buttonVariants("ghost", "lg", "w-full justify-center")}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Continue as Guest
        </Link>
      </div>
    </AuthCard>
  );
}
