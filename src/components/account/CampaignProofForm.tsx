"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";
import { useToast } from "@/context/ToastContext";
import { submitProofAction } from "@/app/account/rewards/actions";

export function CampaignProofForm({
  participationId,
  adminNote,
}: {
  participationId: string;
  adminNote?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [proofLink, setProofLink] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const result = await submitProofAction(participationId, proofLink, proofNote);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    showToast("Submitted for review");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-sm border border-beige bg-white p-6"
    >
      <Text variant="body" className="font-medium text-primary">
        Please share more proof
      </Text>
      {adminNote && (
        <Text variant="bodySm" className="text-muted">
          Note from our team: {adminNote}
        </Text>
      )}
      {error && (
        <Text variant="bodySm" className="text-error">
          {error}
        </Text>
      )}
      <Input
        label="Post link"
        type="url"
        placeholder="https://facebook.com/..."
        value={proofLink}
        onChange={(event) => setProofLink(event.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm font-medium text-primary">
          Note
        </label>
        <textarea
          rows={2}
          value={proofNote}
          onChange={(event) => setProofNote(event.target.value)}
          placeholder="Tell us which posts you liked or shared"
          className="w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
        Submit for Review
      </Button>
    </form>
  );
}
