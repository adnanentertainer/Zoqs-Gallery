import { graphApiPost } from "@/lib/meta/graphClient";

interface PublishFacebookPhotoPostInput {
  pageId: string;
  accessToken: string;
  imageUrl: string;
  caption: string;
  /** Meta catalog product id (not the SKU) -- tags the post so it shows a tappable "Shop now" product tag. */
  productId?: string;
}

interface FacebookIdResponse {
  id: string;
}

/**
 * A single POST /{page-id}/photos?published=true uploads a Photo object,
 * but Facebook doesn't reliably surface that as a real Timeline post -- it
 * only shows up under the Page's Photos tab, not its Posts feed (confirmed:
 * the post_id that call returns 404s on facebook.com/{page}/posts/{id}).
 * The documented fix is two calls: upload the photo unpublished, then
 * create a genuine feed post that attaches it via attached_media.
 */
export async function publishFacebookPhotoPost({
  pageId,
  accessToken,
  imageUrl,
  caption,
  productId,
}: PublishFacebookPhotoPostInput): Promise<{ postId: string }> {
  const photo = await graphApiPost<FacebookIdResponse>(
    `${pageId}/photos`,
    accessToken,
    { url: imageUrl, published: "false" },
  );

  // Meta's documented format for attached_media on /feed uses indexed
  // keys (attached_media[0], attached_media[1], ...) each holding a JSON
  // object -- a single "attached_media" key holding a JSON array is
  // silently ignored, producing a text-only post with no photo attached.
  // product_tags uses the same indexed-key style, by analogy -- verify
  // live the same way attached_media's format had to be corrected.
  const body: Record<string, string> = {
    message: caption,
    "attached_media[0]": JSON.stringify({ media_fbid: photo.id }),
  };
  if (productId) {
    body["product_tags[0]"] = JSON.stringify({ product_id: productId });
  }

  const post = await graphApiPost<FacebookIdResponse>(
    `${pageId}/feed`,
    accessToken,
    body,
  );

  return { postId: post.id };
}

interface PublishFacebookReelInput {
  pageId: string;
  accessToken: string;
  videoUrl: string;
  caption: string;
  /** Meta catalog product id (not the SKU) -- tags the reel so it shows a tappable product tag. */
  productId?: string;
}

interface FacebookReelStartResponse {
  video_id: string;
  upload_url: string;
}

/**
 * Facebook Reels use a three-step "Reels Publishing API" flow, unlike the
 * single-call photo upload above: start an upload session, hand Meta the
 * already-hosted video via the file_url header (so this never has to
 * stream the bytes itself), then finish/publish. video_state=PUBLISHED
 * makes the finish call publish immediately rather than leave it as a draft.
 * As with attached_media on the photo flow, the exact finish-call param
 * shape (particularly product_tags) is what's documented, not yet verified
 * against a live response -- check the same way the photo flow's format had
 * to be corrected.
 */
export async function publishFacebookReel({
  pageId,
  accessToken,
  videoUrl,
  caption,
  productId,
}: PublishFacebookReelInput): Promise<{ videoId: string }> {
  const start = await graphApiPost<FacebookReelStartResponse>(
    `${pageId}/video_reels`,
    accessToken,
    { upload_phase: "start" },
  );

  const uploadResponse = await fetch(start.upload_url, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${accessToken}`,
      file_url: videoUrl,
    },
  });
  if (!uploadResponse.ok) {
    const body = await uploadResponse.text();
    throw new Error(
      `Facebook Reel upload failed (${uploadResponse.status}): ${body}`,
    );
  }

  const finishBody: Record<string, string> = {
    upload_phase: "finish",
    video_id: start.video_id,
    video_state: "PUBLISHED",
    description: caption,
  };
  if (productId) {
    finishBody["product_tags[0]"] = JSON.stringify({ product_id: productId });
  }

  await graphApiPost(`${pageId}/video_reels`, accessToken, finishBody);

  return { videoId: start.video_id };
}
