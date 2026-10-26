import { isTikTokAppAudited } from "@/lib/tiktok/config";

const API_BASE = "https://open.tiktokapis.com/v2";

export class TikTokApiError extends Error {
  constructor(status: number, body: string) {
    super(`TikTok Content Posting API request failed (${status}): ${body}`);
    this.name = "TikTokApiError";
  }
}

async function tiktokFetch<T>(
  path: string,
  accessToken: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new TikTokApiError(response.status, text);
  }
  const parsed = JSON.parse(text) as { data: T; error?: { code?: string; message?: string } };
  // TikTok returns HTTP 200 with an error payload for several failure
  // modes (e.g. scope/privacy issues), not just non-2xx statuses.
  if (parsed.error && parsed.error.code && parsed.error.code !== "ok") {
    throw new TikTokApiError(response.status, text);
  }
  return parsed.data;
}

interface CreatorInfo {
  creator_username: string;
  privacy_level_options: string[];
}

/**
 * TikTok requires querying the creator's allowed privacy levels before
 * every Direct Post. Critically, an unaudited app's creator_info can still
 * list PUBLIC_TO_EVERYONE as an option (that's what the connected
 * account's own settings would otherwise allow) -- but the Content Posting
 * API rejects an unaudited client's request for anything other than
 * SELF_ONLY with unaudited_client_can_only_post_to_private_accounts
 * regardless, so this can't just pick the most-open option from the list
 * the way it looks like it should. isTikTokAppAudited() is the one place
 * that needs to flip once TikTok actually approves the Production app.
 */
async function pickPrivacyLevel(accessToken: string): Promise<string> {
  const info = await tiktokFetch<CreatorInfo>(
    "/post/publish/creator_info/query/",
    accessToken,
  );
  if (!isTikTokAppAudited()) {
    return "SELF_ONLY";
  }
  if (info.privacy_level_options.includes("PUBLIC_TO_EVERYONE")) {
    return "PUBLIC_TO_EVERYONE";
  }
  return info.privacy_level_options[0] ?? "SELF_ONLY";
}

interface InitResponse {
  publish_id: string;
  upload_url: string;
}

async function initDirectPost(
  accessToken: string,
  title: string,
  videoSize: number,
): Promise<InitResponse> {
  const privacyLevel = await pickPrivacyLevel(accessToken);
  return tiktokFetch<InitResponse>("/post/publish/video/init/", accessToken, {
    post_info: {
      title,
      privacy_level: privacyLevel,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      video_cover_timestamp_ms: 1000,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: videoSize,
      chunk_size: videoSize,
      total_chunk_count: 1,
    },
  });
}

/**
 * Sends the video to the creator's TikTok inbox as a draft instead of
 * posting it -- no post_info/privacy_level, since nothing is actually
 * published yet. This is the only way our unaudited app can get a video in
 * front of the public: Direct Post is hard-restricted to SELF_ONLY (see
 * pickPrivacyLevel), but a draft dropped in the creator's own inbox carries
 * no such restriction once *they* tap "Post" inside the TikTok app -- that
 * action is the account owner's own post, not the API's.
 */
async function initInboxUpload(
  accessToken: string,
  videoSize: number,
): Promise<InitResponse> {
  return tiktokFetch<InitResponse>(
    "/post/publish/inbox/video/init/",
    accessToken,
    {
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: videoSize,
        total_chunk_count: 1,
      },
    },
  );
}

async function uploadVideoBytes(
  uploadUrl: string,
  video: Buffer,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Range": `bytes 0-${video.length - 1}/${video.length}`,
    },
    body: new Uint8Array(video),
  });
  if (!response.ok) {
    throw new TikTokApiError(response.status, await response.text());
  }
}

interface PublishStatus {
  status: "PROCESSING_DOWNLOAD" | "PROCESSING_UPLOAD" | "PUBLISH_COMPLETE" | "FAILED" | "SEND_TO_USER_INBOX";
  fail_reason?: string;
}

const STATUS_POLL_ATTEMPTS = 10;
const STATUS_POLL_DELAY_MS = 3000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollUntilPublished(
  accessToken: string,
  publishId: string,
): Promise<void> {
  for (let attempt = 0; attempt < STATUS_POLL_ATTEMPTS; attempt++) {
    const status = await tiktokFetch<PublishStatus>(
      "/post/publish/status/fetch/",
      accessToken,
      { publish_id: publishId },
    );

    if (status.status === "PUBLISH_COMPLETE" || status.status === "SEND_TO_USER_INBOX") {
      return;
    }
    if (status.status === "FAILED") {
      throw new Error(`TikTok video failed to publish: ${status.fail_reason ?? "unknown reason"}`);
    }
    if (attempt < STATUS_POLL_ATTEMPTS - 1) {
      await delay(STATUS_POLL_DELAY_MS);
    }
  }
  throw new Error("TikTok video publish timed out while processing.");
}

/**
 * Direct Posts a generated video straight to the connected creator's TikTok
 * profile. Mirrors the two-step container/publish shape of the Instagram
 * publisher (init, then poll until ready) even though the concrete API
 * calls are TikTok's own.
 *
 * Unused while the app is unaudited (see runTikTok in socialPostingService.ts,
 * which calls publishTikTokVideoToInbox instead) -- kept so switching back is
 * a one-line change if TikTok ever approves Production review.
 */
export async function publishTikTokVideoDirect({
  accessToken,
  video,
  title,
}: {
  accessToken: string;
  video: Buffer;
  title: string;
}): Promise<{ publishId: string }> {
  const { publish_id, upload_url } = await initDirectPost(accessToken, title, video.length);
  await uploadVideoBytes(upload_url, video);
  await pollUntilPublished(accessToken, publish_id);
  return { publishId: publish_id };
}

/**
 * Uploads a generated video as a draft to the connected creator's TikTok
 * inbox instead of posting it (see initInboxUpload). The app never requests
 * a privacy level and nothing goes live until the account owner opens the
 * TikTok app and taps "Post" themselves.
 */
export async function publishTikTokVideoToInbox({
  accessToken,
  video,
}: {
  accessToken: string;
  video: Buffer;
}): Promise<{ publishId: string }> {
  const { publish_id, upload_url } = await initInboxUpload(accessToken, video.length);
  await uploadVideoBytes(upload_url, video);
  await pollUntilPublished(accessToken, publish_id);
  return { publishId: publish_id };
}
