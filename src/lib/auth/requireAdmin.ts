import type { User } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getCurrentUserRole } from "@/lib/auth/getCurrentUserRole";

/**
 * The single authorization gate for every admin page and every admin Server
 * Action — never trust AuthContext (client state) for this. Unauthenticated
 * visitors are redirected to log in and return to where they were headed;
 * an authenticated non-admin gets a plain 404 rather than a distinguishable
 * "Access Denied" page, so a customer probing /admin routes learns nothing
 * about whether they exist (see the Phase 10 spec's "do not reveal sensitive
 * admin route details" requirement). Used identically from src/app/admin's
 * layout (page-level gate) and from every admin Server Action (so a crafted
 * direct request to a mutation can't bypass the layout).
 */
export async function requireAdmin(
  redirectTo = "/admin",
): Promise<{ user: User }> {
  const user = await getServerUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const role = await getCurrentUserRole(user);
  if (role !== "admin") {
    notFound();
  }

  return { user };
}
