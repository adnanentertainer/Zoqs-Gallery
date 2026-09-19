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
