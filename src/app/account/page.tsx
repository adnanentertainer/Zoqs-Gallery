import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { LogoutButton } from "@/components/auth";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRow } from "@/lib/supabase/mappers";

export const metadata: Metadata = {
  title: "My Account | ZOQ's Gallery",
  description: "Manage your ZOQ's Gallery account.",
  robots: { index: false, follow: false },
};

const cardStyles =
  "rounded-sm border border-beige p-6 text-left transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

export default async function AccountPage() {
  // Defense in depth: src/proxy.ts already redirects unauthenticated visitors
  // away from /account before this page ever runs, but protected content
  // must never depend on client-only hiding, so this server-side check
  // stands on its own too.
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirect=/account");
  }

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data ? mapProfileRow(data) : null;
  const displayName = profile?.fullName || user.email?.split("@")[0] || "there";

  return (
    <Container className="flex flex-col gap-8 py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "My Account" }]}
      />

      <div>
        <Heading variant="h1" as="h1">
          Welcome back, {displayName}
        </Heading>
        <Text variant="body" className="mt-2 text-muted">
          {user.email}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/account/profile" className={cardStyles}>
          <Heading variant="h3" as="h2">
            Profile
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            Update your name and contact details.
          </Text>
        </Link>
        <Link href="/wishlist" className={cardStyles}>
          <Heading variant="h3" as="h2">
            Wishlist
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            View the pieces you&apos;ve saved.
          </Text>
        </Link>
        <Link href="/cart" className={cardStyles}>
          <Heading variant="h3" as="h2">
            Cart
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            Review items in your cart.
          </Text>
        </Link>
        <LogoutButton className={cardStyles}>
          <Heading variant="h3" as="h2">
            Logout
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            Sign out of your account.
          </Text>
        </LogoutButton>
      </div>

      <Text variant="bodySm" className="text-muted">
        Order history coming soon.
      </Text>
    </Container>
  );
}
