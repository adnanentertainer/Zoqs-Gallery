import { unstable_cache } from "next/cache";
import { socialPosts as mockSocialPosts } from "@/data/social";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabasePublicClient } from "@/lib/supabase/server";
import { mapSocialPostRow } from "@/lib/supabase/mappers";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { SocialPost } from "@/types";

const getSocialPostsUncached = unstable_cache(
  async (): Promise<SocialPost[]> => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("social_posts")
      .select("*, products(stock)")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    // A post with no linked product always shows; a linked product that's
    // sold out hides its post automatically instead of advertising a look
    // customers can't actually buy.
    return (data ?? [])
      .filter((row) => {
        if (!row.product_id) return true;
        const product = row.products as { stock: number } | null;
        return (product?.stock ?? 0) > 0;
      })
      .map(mapSocialPostRow);
  },
  ["social-posts:active"],
  { tags: [CACHE_TAGS.socialPosts], revalidate: 3600 },
);

export async function getSocialPosts(): Promise<SocialPost[]> {
  if (!isSupabaseConfigured()) {
    return mockSocialPosts;
  }

  try {
    return await getSocialPostsUncached();
  } catch (error) {
    console.error(
      "[socialPostService.getSocialPosts] Supabase query failed:",
      error,
    );
    throw new Error("Unable to load social posts right now.");
  }
}
