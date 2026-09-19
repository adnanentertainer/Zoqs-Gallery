import { graphApiPost } from "@/lib/meta/graphClient";

interface PublishFacebookPhotoPostInput {
  pageId: string;
  accessToken: string;
  imageUrl: string;
  caption: string;
}

interface FacebookPhotoResponse {
  id: string;
  post_id?: string;
}

export async function publishFacebookPhotoPost({
  pageId,
  accessToken,
  imageUrl,
  caption,
}: PublishFacebookPhotoPostInput): Promise<{ postId: string }> {
  const response = await graphApiPost<FacebookPhotoResponse>(
    `${pageId}/photos`,
    accessToken,
    { url: imageUrl, caption, published: "true" },
  );

  // published=true also returns post_id (the Page post, "{page-id}_{post-id}") --
  // that's the one worth storing/linking to, not the bare photo id.
  return { postId: response.post_id ?? response.id };
}
