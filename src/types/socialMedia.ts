export type SocialPlatformStatus = "pending" | "success" | "failed" | "skipped";

export interface SocialMediaSettings {
  facebookPageId: string;
  /** Never populated on read -- the real token never reaches the client. */
  facebookAccessToken: string;
  hasFacebookAccessToken: boolean;
  facebookEnabled: boolean;
  instagramBusinessAccountId: string;
  instagramEnabled: boolean;
  autoPostEnabled: boolean;
  facebookConnectedAt: string | null;
  instagramConnectedAt: string | null;
}

export interface SocialMediaSettingsInput {
  facebookPageId: string;
  /** Blank means "keep the existing token" -- only a non-blank value overwrites it. */
  facebookAccessToken: string;
  facebookEnabled: boolean;
  instagramBusinessAccountId: string;
  instagramEnabled: boolean;
  autoPostEnabled: boolean;
}

export interface ProductSocialPostRecord {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  facebookPostId: string | null;
  instagramMediaId: string | null;
  facebookStatus: SocialPlatformStatus;
  instagramStatus: SocialPlatformStatus;
  facebookError: string | null;
  instagramError: string | null;
  postedAt: string | null;
  retryCount: number;
  createdAt: string;
}
