import { graphApiGet, graphApiPost } from "@/lib/meta/graphClient";

interface PublishInstagramPostInput {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption: string;
  /** Meta catalog product id (not the SKU) -- tags the media so it's shoppable. */
  productId?: string;
}

interface MediaContainerResponse {
  id: string;
}

interface MediaStatusResponse {
  status_code: "IN_PROGRESS" | "FINISHED" | "ERROR" | "EXPIRED" | "PUBLISHED";
}

const STATUS_POLL_ATTEMPTS = 5;
const STATUS_POLL_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Instagram publishes in two steps: create a media container, then publish
 * it. Image containers are usually ready near-instantly (no video
 * transcoding), but the API doesn't guarantee that synchronously, so this
 * polls briefly before publishing. There's no queue/cron in this app to fall
 * back to, so the whole thing has to finish inside one request -- the poll
 * is capped at ~5 attempts / ~7.5s total rather than waiting indefinitely.
 */
export async function publishInstagramPost({
  igUserId,
  accessToken,
  imageUrl,
  caption,
  productId,
}: PublishInstagramPostInput): Promise<{ mediaId: string }> {
  const mediaBody: Record<string, string> = { image_url: imageUrl, caption };
  if (productId) {
    // Instagram's documented format for /media is a single JSON-array
    // param (unlike Facebook's /feed, which needed indexed keys for the
    // analogous attached_media param) -- worth a live check given that
    // mismatch already happened once on the Facebook side this session.
    mediaBody.product_tags = JSON.stringify([
      { product_id: productId, x: 0.5, y: 0.5 },
    ]);
  }

  const container = await graphApiPost<MediaContainerResponse>(
    `${igUserId}/media`,
    accessToken,
    mediaBody,
  );
  const creationId = container.id;

  for (let attempt = 0; attempt < STATUS_POLL_ATTEMPTS; attempt++) {
    const status = await graphApiGet<MediaStatusResponse>(
      `${creationId}?fields=status_code`,
      accessToken,
    );

    if (status.status_code === "FINISHED" || status.status_code === "PUBLISHED") {
      break;
    }
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(
        `Instagram media container failed to process (status: ${status.status_code}).`,
      );
    }
    if (attempt < STATUS_POLL_ATTEMPTS - 1) {
      await delay(STATUS_POLL_DELAY_MS);
    }
  }

  const published = await graphApiPost<MediaContainerResponse>(
    `${igUserId}/media_publish`,
    accessToken,
    { creation_id: creationId },
  );

  return { mediaId: published.id };
}
