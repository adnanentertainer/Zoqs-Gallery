"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { useToast } from "@/context/ToastContext";
import {
  joinCampaignAction,
  toggleEngagementAction,
} from "@/app/account/rewards/actions";
import type {
  SocialCampaignContent,
  SocialCampaignEngagementType,
} from "@/types/socialCampaign";

interface CampaignEngagementChecklistProps {
  campaignId: string;
  participationId: string | null;
  isEditable: boolean;
  engagementType: SocialCampaignEngagementType;
  requiredCount: number;
  engagementCount: number;
  content: SocialCampaignContent[];
  engagedContentIds: Record<"like" | "share", string[]>;
}

function ProgressBar({
  current,
  required,
}: {
  current: number;
  required: number;
}) {
  const percentage = Math.min(100, Math.round((current / required) * 100));
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-sm text-primary">
        {current >= required ? (
          <span className="font-medium text-success">
            You&apos;ve completed the requirement
          </span>
        ) : (
          <>
            <span className="font-semibold text-gold">
              {current} / {required}
            </span>{" "}
            engagements completed
          </>
        )}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-beige">
        <div
          className="h-full rounded-full bg-gold transition-all duration-300"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function CampaignEngagementChecklist({
  campaignId,
  participationId,
  isEditable,
  engagementType,
  requiredCount,
  engagementCount,
  content,
  engagedContentIds,
}: CampaignEngagementChecklistProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setIsJoining(true);
    setError(null);
    const result = await joinCampaignAction(campaignId);
    setIsJoining(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function handleToggle(
    contentId: string,
    type: "like" | "share",
    checked: boolean,
  ) {
    if (!participationId) return;
    const key = `${contentId}:${type}`;
    setPendingKey(key);
    setError(null);
    const result = await toggleEngagementAction(
      participationId,
      contentId,
      type,
      checked,
    );
    setPendingKey(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    showToast(checked ? "Marked as done" : "Unmarked");
    startTransition(() => router.refresh());
  }

  if (!participationId) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-sm border border-beige bg-white p-6">
        <Text variant="body" className="text-primary">
          Join this campaign to start tracking your engagements.
        </Text>
        {error && (
          <Text variant="bodySm" className="text-error">
            {error}
          </Text>
        )}
        <Button onClick={handleJoin} isLoading={isJoining} variant="primary" size="md">
          Join Campaign
        </Button>
      </div>
    );
  }

  const engagementTypesToShow: ("like" | "share")[] =
    engagementType === "both" ? ["like", "share"] : [engagementType];

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-6">
      <ProgressBar current={engagementCount} required={requiredCount} />
      {error && (
        <Text variant="bodySm" className="text-error">
          {error}
        </Text>
      )}
      <div className="flex flex-col divide-y divide-beige">
        {content.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3">
            {item.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-sm object-cover"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-sm bg-beige" />
            )}
            <div className="min-w-0 flex-1">
              <a
                href={item.postUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate font-body text-sm font-medium text-primary hover:text-gold hover:underline"
              >
                {item.caption || item.postUrl}
              </a>
              <Text variant="bodySm" className="capitalize text-muted">
                {item.platform}
              </Text>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              {engagementTypesToShow.map((type) => {
                const checked = engagedContentIds[type].includes(item.id);
                const key = `${item.id}:${type}`;
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 font-body text-sm text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!isEditable || pendingKey === key}
                      onChange={(event) =>
                        handleToggle(item.id, type, event.target.checked)
                      }
                      className="h-4 w-4 accent-gold"
                    />
                    {type === "like" ? "Liked" : "Shared"}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
