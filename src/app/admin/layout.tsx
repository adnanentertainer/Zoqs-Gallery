import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const metadata: Metadata = {
  title: "Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The single enforcement point for every /admin/* route: unauthenticated
  // visitors are sent to log in, authenticated non-admins get a plain 404.
  // Every admin Server Action independently calls requireAdmin() again too
  // (see src/lib/services/admin/*), since a crafted direct request to a
  // mutation could otherwise skip this layout entirely.
  const { user } = await requireAdmin();

  return <AdminShell adminLabel={user.email ?? "Admin"}>{children}</AdminShell>;
}
