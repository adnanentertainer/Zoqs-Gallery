"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Text } from "@/components/ui/Typography";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { reviewSocialCampaignSubmissionAction } from "@/app/admin/social-campaigns/actions";
import type { AdminSocialCampaignParticipationRow } from "@/types/socialCampaign";

type Decision = "approve" | "reject" | "request_more_proof";

export function SocialCampaignSubmissionsTable({
  campaignId,
  participations,
}: {
  campaignId: string;
  participations: AdminSocialCampaignParticipationRow[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<{
    submissionId: string;
    decision: Decision;
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!pending) return;
    setIsSubmitting(true);
    setError(null);
    const result = await reviewSocialCampaignSubmissionAction(
      campaignId,
      pending.submissionId,
      pending.decision,
      adminNotes,
    );
    setIsSubmitting(false);
    setPending(null);
    setAdminNotes("");
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const decisionLabel: Record<Decision, string> = {
    approve: "Approve this submission?",
    reject: "Reject this submission?",
    request_more_proof: "Request more proof from this customer?",
  };

  if (participations.length === 0) {
    return (
      <Text variant="bodySm" className="p-6 text-muted">
        No customers have joined this campaign yet.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Text variant="bodySm" className="text-error">
          {error}
        </Text>
      )}
      <div className="overflow-x-auto rounded-sm border border-beige bg-white">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-beige font-body text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Proof</th>
              <th className="px-5 py-3 font-medium">Submitted</th>
              <th className="px-5 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {participations.map((row) => {
              const submission = row.latestSubmission;
              const canReview =
                submission && submission.status === "pending";
              return (
                <tr key={row.id} className="border-b border-beige last:border-b-0 align-top">
                  <td className="px-5 py-3 font-body text-sm text-primary">
                    <div className="font-medium">{row.customerName || "—"}</div>
                    <div className="text-muted">{row.customerEmail || "—"}</div>
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">
                    {row.engagementCount} / {row.requiredEngagementCount}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">
                    {submission?.proofLink && (
                      <a
                        href={submission.proofLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-gold hover:underline"
                      >
                        {submission.proofLink}
                      </a>
                    )}
                    {submission?.proofNote && (
                      <div className="mt-1 max-w-xs whitespace-pre-wrap">
                        {submission.proofNote}
                      </div>
                    )}
                    {!submission && "—"}
                    {submission &&
                      !submission.proofLink &&
                      !submission.proofNote && (
                        <span className="italic">
                          Auto-submitted — no link/note provided. Check the
                          checklist progress and verify on Facebook/Instagram
                          if needed.
                        </span>
                      )}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleString("en-PK")
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canReview && submission && (
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setPending({
                              submissionId: submission.id,
                              decision: "approve",
                            })
                          }
                          className="font-body text-sm font-medium text-success hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPending({
                              submissionId: submission.id,
                              decision: "request_more_proof",
                            })
                          }
                          className="font-body text-sm font-medium text-primary hover:underline"
                        >
                          Request More Proof
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPending({
                              submissionId: submission.id,
                              decision: "reject",
                            })
                          }
                          className="font-body text-sm font-medium text-error hover:underline"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? decisionLabel[pending.decision] : ""}
        description="This action is final once submitted; the customer's dashboard updates immediately."
        confirmLabel={
          pending?.decision === "approve"
            ? "Approve"
            : pending?.decision === "reject"
              ? "Reject"
              : "Request More Proof"
        }
        isDestructive={pending?.decision !== "approve"}
        isLoading={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => {
          setPending(null);
          setAdminNotes("");
        }}
      />
      {pending && (
        <div className="rounded-sm border border-beige bg-white p-4">
          <label className="font-body text-sm font-medium text-primary">
            Admin note (optional, shown to the customer if you request more proof)
          </label>
          <textarea
            rows={2}
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            className="mt-1.5 w-full rounded-sm border border-beige bg-white px-4 py-3 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      )}
    </div>
  );
}
