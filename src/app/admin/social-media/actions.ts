"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { graphApiGet } from "@/lib/meta/graphClient";
import {
  getSocialMediaSettings,
  saveSocialMediaSettings,
  retryProductSocialPost,
  getFacebookAccessTokenForServerUse,
  syncProductFeed,
} from "@/lib/services/admin/socialPostingService";
import type { SocialMediaSettingsInput } from "@/types/socialMedia";

function validateSettingsInput(
  input: SocialMediaSettingsInput,
  hasExistingToken: boolean,
): string | undefined {
  const hasToken = !!input.facebookAccessToken.trim() || hasExistingToken;
  if (input.facebookEnabled && (!input.facebookPageId.trim() || !hasToken)) {
    return "Facebook posting needs a Page ID and an access token.";
  }
  if (
    input.instagramEnabled &&
    (!input.instagramBusinessAccountId.trim() || !hasToken)
  ) {
    return "Instagram posting needs a Business Account ID and an access token.";
  }
  return undefined;
}

export async function saveSocialMediaSettingsAction(
  input: SocialMediaSettingsInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const current = await getSocialMediaSettings();
  const validationError = validateSettingsInput(
    input,
    current.hasFacebookAccessToken,
  );
  if (validationError) return { error: validationError };

  const result = await saveSocialMediaSettings(input);
  if (!result.error) {
    revalidatePath("/admin/social-media");
  }
  return result;
}

export async function testFacebookConnectionAction(): Promise<{
  success?: string;
  error?: string;
}> {
  await requireAdmin();
  const settings = await getSocialMediaSettings();
  if (!settings.facebookPageId || !settings.hasFacebookAccessToken) {
    return { error: "Save a Page ID and access token first." };
  }

  try {
    const token = await getFacebookAccessTokenForServerUse();
    if (!token) return { error: "Save an access token first." };
    const { name } = await graphApiGet<{ name: string }>(
      `${settings.facebookPageId}?fields=name`,
      token,
    );
    return { success: `Connected to "${name}".` };
  } catch (error) {
    console.error("[social-media/actions.testFacebookConnectionAction]", error);
    return {
      error:
        "Could not connect to this Facebook Page — check the Page ID and access token.",
    };
  }
}

export async function testInstagramConnectionAction(): Promise<{
  success?: string;
  error?: string;
}> {
  await requireAdmin();
  const settings = await getSocialMediaSettings();
  if (!settings.instagramBusinessAccountId || !settings.hasFacebookAccessToken) {
    return { error: "Save an Instagram Business Account ID and access token first." };
  }

  try {
    const token = await getFacebookAccessTokenForServerUse();
    if (!token) return { error: "Save an access token first." };
    const { username } = await graphApiGet<{ username: string }>(
      `${settings.instagramBusinessAccountId}?fields=username`,
      token,
    );
    return { success: `Connected to "@${username}".` };
  } catch (error) {
    console.error("[social-media/actions.testInstagramConnectionAction]", error);
    return {
      error:
        "Could not connect to this Instagram account — check the Business Account ID and access token.",
    };
  }
}

export async function syncProductFeedAction(): Promise<{
  success?: string;
  error?: string;
}> {
  await requireAdmin();
  const result = await syncProductFeed();
  if (result.error) return result;
  return { success: "Feed sync requested." };
}

export async function retrySocialPostAction(
  productId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await retryProductSocialPost(productId);
  revalidatePath("/admin/social-media/history");
  return result;
}
