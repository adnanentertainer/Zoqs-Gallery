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
  facebookCatalogId: string;
  facebookProductFeedId: string;
  productTaggingEnabled: boolean;
}

export interface SocialMediaSettingsInput {
  facebookPageId: string;
  /** Blank means "keep the existing token" -- only a non-blank value overwrites it. */
  facebookAccessToken: string;
  facebookEnabled: boolean;
  instagramBusinessAccountId: string;
  instagramEnabled: boolean;
  autoPostEnabled: boolean;
  facebookCatalogId: string;
  facebookProductFeedId: string;
  productTaggingEnabled: boolean;
}

export interface ProductSocialPostRecord {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  facebookPostId: string | null;
  instagramMediaId: string | null;
  instagramStoryMediaId: string | null;
  facebookStatus: SocialPlatformStatus;
  instagramStatus: SocialPlatformStatus;
  instagramStoryStatus: SocialPlatformStatus;
  facebookError: string | null;
  instagramError: string | null;
  instagramStoryError: string | null;
  postedAt: string | null;
  retryCount: number;
  createdAt: string;
}

export type WhatsAppStatusReason = "new_product" | "price_change";

/** One pending item in the WhatsApp Status helper queue — see
 * /admin/whatsapp-status. Never posted automatically (no official API for
 * WhatsApp Status exists); this only prepares the caption/image for the
 * admin to post manually, then tracks that it was done. */
export interface WhatsAppStatusQueueItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  reason: WhatsAppStatusReason;
  caption: string;
  createdAt: string;
}

export interface ProductReelInput {
  productId: string;
  videoUrl: string;
  caption: string;
}

export interface ProductReelRecord {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  /** null when the product no longer exists. */
  productAvailable: boolean | null;
  videoUrl: string;
  caption: string;
  facebookVideoId: string | null;
  instagramMediaId: string | null;
  facebookStatus: SocialPlatformStatus;
  instagramStatus: SocialPlatformStatus;
  facebookError: string | null;
  instagramError: string | null;
  postedAt: string | null;
  retryCount: number;
  createdAt: string;
}
