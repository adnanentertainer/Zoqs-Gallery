import { graphApiPost } from "@/lib/meta/graphClient";

interface PublishFacebookPhotoPostInput {
  pageId: string;
  accessToken: string;
  imageUrl: string;
  caption: string;
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
}: PublishFacebookPhotoPostInput): Promise<{ postId: string }> {
  const photo = await graphApiPost<FacebookIdResponse>(
    `${pageId}/photos`,
    accessToken,
    { url: imageUrl, published: "false" },
  );

  const post = await graphApiPost<FacebookIdResponse>(`${pageId}/feed`, accessToken, {
    message: caption,
    attached_media: JSON.stringify([{ media_fbid: photo.id }]),
  });

  return { postId: post.id };
}
