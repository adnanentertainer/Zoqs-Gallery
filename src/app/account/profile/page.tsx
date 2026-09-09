import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { ProfileForm } from "@/components/auth";
import { getServerUser } from "@/lib/auth/getServerUser";

export const metadata: Metadata = {
  title: "Profile | ZOQ's Gallery",
  description: "Update your ZOQ's Gallery profile details.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?redirect=/account/profile");
  }

  return (
    <Container className="flex flex-col gap-8 py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
          { label: "Profile" },
        ]}
      />

      <div className="max-w-xl">
        <Heading variant="h1" as="h1">
          Your Profile
        </Heading>
        <Text variant="body" className="mt-2 text-muted">
          Update your name and phone number. Your email is tied to your login
          and can&apos;t be changed here.
        </Text>
      </div>

      <div className="max-w-xl">
        <ProfileForm />
      </div>
    </Container>
  );
}
