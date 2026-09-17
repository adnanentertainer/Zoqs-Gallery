import { socialPosts as mockSocialPosts } from "@/data/social";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapSocialPostRow } from "@/lib/supabase/mappers";
import type { SocialPost } from "@/types";

export async function getSocialPosts(): Promise<SocialPost[]> {
  if (!isSupabaseConfigured()) {
    return mockSocialPosts;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapSocialPostRow);
  } catch (error) {
    console.error(
      "[socialPostService.getSocialPosts] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load social posts right now.");
  }
}
