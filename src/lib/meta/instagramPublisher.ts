import { GraphApiError, graphApiGet, graphApiPost } from "@/lib/meta/graphClient";

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

// Video containers go through real transcoding, unlike image containers, so
// Reels get a longer poll budget (~30s total) than the image flow's ~7.5s.
const REEL_STATUS_POLL_ATTEMPTS = 10;
const REEL_STATUS_POLL_DELAY_MS = 3000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// error_subcode 2207027 ("media not ready for publishing") is a known Meta
// race condition: status_code can report FINISHED slightly before the
// container is actually ready for /media_publish. Meta's own error message
// for it is literally "please wait for a moment", so a short retry clears
// it almost every time rather than failing an otherwise-successful upload.
const MEDIA_NOT_READY_SUBCODE = 2207027;
const PUBLISH_RETRY_ATTEMPTS = 4;
const PUBLISH_RETRY_DELAY_MS = 4000;

async function publishMediaContainer(
  igUserId: string,
  accessToken: string,
  creationId: string,
): Promise<MediaContainerResponse> {
  for (let attempt = 0; attempt < PUBLISH_RETRY_ATTEMPTS; attempt++) {
    try {
      return await graphApiPost<MediaContainerResponse>(
        `${igUserId}/media_publish`,
        accessToken,
        { creation_id: creationId },
      );
    } catch (error) {
      const isMediaNotReady =
        error instanceof GraphApiError &&
        error.errorSubcode === MEDIA_NOT_READY_SUBCODE;
      if (!isMediaNotReady || attempt === PUBLISH_RETRY_ATTEMPTS - 1) throw error;
      await delay(PUBLISH_RETRY_DELAY_MS);
    }
  }
  // Unreachable -- the loop above always returns or throws.
  throw new Error("Unable to publish Instagram media.");
}

/**
 * Shared by the image and Reels flows below. There's no queue/cron in this
 * app to fall back to, so the whole publish has to finish inside one
 * request -- the poll is capped rather than waiting indefinitely.
 */
async function pollMediaContainerUntilReady(
  creationId: string,
  accessToken: string,
  attempts: number,
  delayMs: number,
): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const status = await graphApiGet<MediaStatusResponse>(
      `${creationId}?fields=status_code`,
      accessToken,
    );

    if (status.status_code === "FINISHED" || status.status_code === "PUBLISHED") {
      return;
    }
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(
        `Instagram media container failed to process (status: ${status.status_code}).`,
      );
    }
    if (attempt < attempts - 1) {
      await delay(delayMs);
    }
  }
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

  await pollMediaContainerUntilReady(
    creationId,
    accessToken,
    STATUS_POLL_ATTEMPTS,
    STATUS_POLL_DELAY_MS,
  );

  const published = await publishMediaContainer(igUserId, accessToken, creationId);

  return { mediaId: published.id };
}

interface PublishInstagramReelInput {
  igUserId: string;
  accessToken: string;
  videoUrl: string;
  caption: string;
  /** Meta catalog product id (not the SKU) -- tags the reel so it's shoppable. */
  productId?: string;
}

/**
 * Same two-step container/publish flow as publishInstagramPost, just with
 * media_type=REELS and video_url instead of image_url -- Instagram fetches
 * the video from that URL itself. Product tags on video containers take
 * just product_id (no x/y position, unlike image tagging, since there's no
 * fixed frame to anchor a tag position to).
 */
export async function publishInstagramReel({
  igUserId,
  accessToken,
  videoUrl,
  caption,
  productId,
}: PublishInstagramReelInput): Promise<{ mediaId: string }> {
  const mediaBody: Record<string, string> = {
    media_type: "REELS",
    video_url: videoUrl,
    caption,
  };
  if (productId) {
    mediaBody.product_tags = JSON.stringify([{ product_id: productId }]);
  }

  const container = await graphApiPost<MediaContainerResponse>(
    `${igUserId}/media`,
    accessToken,
    mediaBody,
  );
  const creationId = container.id;

  await pollMediaContainerUntilReady(
    creationId,
    accessToken,
    REEL_STATUS_POLL_ATTEMPTS,
    REEL_STATUS_POLL_DELAY_MS,
  );

  const published = await publishMediaContainer(igUserId, accessToken, creationId);

  return { mediaId: published.id };
}
