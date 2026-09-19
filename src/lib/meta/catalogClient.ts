import { graphApiGet, graphApiPost } from "@/lib/meta/graphClient";

interface CatalogProductSearchResponse {
  data: { id: string }[];
}

/**
 * Looks up a catalog product by retailer_id (our product SKU). Returns
 * null on "not found" as well as any error -- not being in the catalog
 * yet is a normal, expected state (Meta only re-fetches the feed on its
 * own schedule), not a failure worth surfacing to the posting flow.
 */
export async function findCatalogProductId(
  catalogId: string,
  retailerId: string,
  accessToken: string,
): Promise<string | null> {
  try {
    const filter = encodeURIComponent(
      JSON.stringify({ retailer_id: { eq: retailerId } }),
    );
    const response = await graphApiGet<CatalogProductSearchResponse>(
      `${catalogId}/products?filter=${filter}`,
      accessToken,
    );
    return response.data[0]?.id ?? null;
  } catch (error) {
    console.error("[catalogClient.findCatalogProductId] failed:", error);
    return null;
  }
}

/**
 * Triggers an on-demand re-fetch of the registered feed URL, so a newly
 * created product doesn't have to wait for Meta's default sync schedule
 * before "Post Again" can pick up its catalog tag.
 */
export async function triggerCatalogFeedSync(
  feedId: string,
  feedUrl: string,
  accessToken: string,
): Promise<{ error?: string }> {
  try {
    await graphApiPost(`${feedId}/uploads`, accessToken, { url: feedUrl });
    return {};
  } catch (error) {
    console.error("[catalogClient.triggerCatalogFeedSync] failed:", error);
    return { error: "Unable to trigger a feed sync right now." };
  }
}
