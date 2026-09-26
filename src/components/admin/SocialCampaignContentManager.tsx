"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  addSocialCampaignContentAction,
  deleteSocialCampaignContentAction,
  setSocialCampaignContentActiveAction,
} from "@/app/admin/social-campaigns/actions";
import type {
  AdminSocialCampaignContentInput,
  SocialCampaignContent,
} from "@/types/socialCampaign";

function emptyContent(): AdminSocialCampaignContentInput {
  return {
    platform: "facebook",
    postUrl: "",
    postId: "",
    thumbnailUrl: "",
    caption: "",
    postedAt: null,
    isActive: true,
  };
}

export function SocialCampaignContentManager({
  campaignId,
  content,
}: {
  campaignId: string;
  content: SocialCampaignContent[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<AdminSocialCampaignContentInput>(
    emptyContent(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function update<K extends keyof AdminSocialCampaignContentInput>(
    key: K,
    value: AdminSocialCampaignContentInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const result = await addSocialCampaignContentAction(campaignId, values);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setValues(emptyContent());
    router.refresh();
  }

  async function handleToggleActive(contentId: string, isActive: boolean) {
    setError(null);
    const result = await setSocialCampaignContentActiveAction(
      campaignId,
      contentId,
      isActive,
    );
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDeleteId) return;
    setIsSubmitting(true);
    setError(null);
    const result = await deleteSocialCampaignContentAction(
      campaignId,
      pendingDeleteId,
    );
    setIsSubmitting(false);
    setPendingDeleteId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6">
      <Text variant="body" className="font-medium text-primary">
        Eligible Posts &amp; Videos
      </Text>

      {error && <Text variant="bodySm" className="text-error">{error}</Text>}

      {content.length === 0 ? (
        <Text variant="bodySm" className="text-muted">
          No posts added yet — add the posts customers must engage with below.
        </Text>
      ) : (
        <div className="flex flex-col divide-y divide-beige">
          {content.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              {item.thumbnailUrl ? (
                // Plain <img>, not next/image — admins paste arbitrary
                // Facebook/Instagram CDN thumbnail URLs here, which aren't
                // (and shouldn't need to be) allowlisted in next.config.ts's
                // remotePatterns the way first-party product images are.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-sm bg-beige" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.platform}</Badge>
                  {!item.isActive && <Badge variant="default">Inactive</Badge>}
                </div>
                <a
                  href={item.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-body text-sm text-gold hover:underline"
                >
                  {item.postUrl}
                </a>
                {item.caption && (
                  <Text variant="bodySm" className="truncate text-muted">
                    {item.caption}
                  </Text>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleActive(item.id, !item.isActive)}
                  className="font-body text-sm font-medium text-primary hover:underline"
                >
                  {item.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(item.id)}
                  aria-label="Remove post"
                  className="text-error hover:opacity-70"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 gap-3 border-t border-beige pt-4 sm:grid-cols-2"
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-primary">
            Platform
          </label>
          <select
            value={values.platform}
            onChange={(event) =>
              update(
                "platform",
                event.target.value as AdminSocialCampaignContentInput["platform"],
              )
            }
            className="h-11 rounded-sm border border-beige bg-white px-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
        <Input
          label="Post ID (optional)"
          value={values.postId}
          onChange={(event) => update("postId", event.target.value)}
        />
        <Input
          label="Post/Video URL"
          required
          type="url"
          value={values.postUrl}
          onChange={(event) => update("postUrl", event.target.value)}
          className="sm:col-span-2"
        />
        <Input
          label="Thumbnail URL (optional)"
          value={values.thumbnailUrl}
          onChange={(event) => update("thumbnailUrl", event.target.value)}
        />
        <Input
          label="Posted Date (optional)"
          type="date"
          value={values.postedAt ?? ""}
          onChange={(event) => update("postedAt", event.target.value || null)}
        />
        <Input
          label="Caption / Title (optional)"
          value={values.caption}
          onChange={(event) => update("caption", event.target.value)}
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Button type="submit" variant="secondary" size="md" isLoading={isSubmitting}>
            Add Post
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Remove this post?"
        description="Customers who already engaged with it keep that engagement counted — this only removes it from future selection."
        confirmLabel="Remove"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
