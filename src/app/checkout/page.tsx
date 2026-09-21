import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { CheckoutForm } from "@/components/checkout";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfileRow } from "@/lib/supabase/mappers";
import { getShippingSettings } from "@/lib/checkout/getShippingSettings";

export const metadata: Metadata = {
  title: "Checkout | ZOQ's Gallery",
  description: "Complete your ZOQ's Gallery order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Guest checkout is allowed — /checkout/start offers Log In / Create
  // Account / Continue as Guest, and this page itself works for either.
  // shippingSettings never depends on the user, so it starts alongside the
  // auth check instead of waiting on it — for a signed-in visitor this takes
  // it off the critical path entirely (only the profile lookup still has to
  // wait on `user`).
  const [user, shippingSettings] = await Promise.all([
    getServerUser(),
    getShippingSettings(),
  ]);

  let profile = null;
  if (user) {
    const supabase = await getSupabaseServerClient();
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = profileRow ? mapProfileRow(profileRow) : null;
  }

  return (
    <Container className="flex flex-col gap-6 py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
      />
      <Heading variant="h1" as="h1">
        Checkout
      </Heading>

      <CheckoutForm
        initialShipping={{
          fullName: profile?.fullName ?? "",
          email: user?.email ?? "",
          phone: profile?.phone ?? "",
        }}
        shippingSettings={shippingSettings}
      />
    </Container>
  );
}
