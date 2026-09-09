import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/**
 * Reads the authoritative role for an already-authenticated user directly
 * from `profiles.role` — never from AuthContext or any client-supplied
 * value. Returns "customer" if the profile row is missing for any reason,
 * so a lookup failure can never accidentally grant admin access.
 */
export async function getCurrentUserRole(user: User): Promise<UserRole> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[getCurrentUserRole] Supabase query failed:", error);
    return "customer";
  }

  return data?.role === "admin" ? "admin" : "customer";
}
