import { formatPrice } from "@/lib/utils";

export interface SocialPostProductInput {
  name: string;
  shortDescription: string | null;
  price: number;
  productUrl: string;
  categoryName?: string | null;
  colorOptions?: string[];
}

const BASE_FACEBOOK_HASHTAGS = [
  "#Jewelry",
  "#NewArrival",
  "#FashionJewelry",
  "#ZoqsGallery",
];
const BASE_INSTAGRAM_HASHTAGS = [
  "#Jewelry",
  "#InstaJewelry",
  "#FashionJewelry",
  "#ZoqsGallery",
  "#JewelryLovers",
  "#OOTD",
];
const BASE_TIKTOK_HASHTAGS = [
  "#Jewelry",
  "#JewelryTikTok",
  "#FashionJewelry",
  "#ZoqsGallery",
  "#TikTokMadeMeBuyIt",
];
const MAX_HASHTAGS = 6;

// TikTok's Content Posting API technically accepts a much longer title, but
// TikTok's own UI truncates captions after roughly this many characters --
// keeping the generated video's caption short means nothing meaningful gets
// cut off, unlike the much longer Facebook/Instagram captions above which
// are expected to be expanded with "...more".
const TIKTOK_CAPTION_LIMIT = 150;

// Instagram caps captions at 2200 characters -- truncate the description
// (not the whole caption) with headroom to spare, rather than let a long
// product description silently get cut off mid-hashtag by the API.
const INSTAGRAM_CAPTION_LIMIT = 2150;

function categoryHashtag(categoryName?: string | null): string | undefined {
  if (!categoryName) return undefined;
  const tag = categoryName.replace(/[^a-zA-Z0-9]/g, "");
  return tag ? `#${tag}` : undefined;
}

function buildHashtags(base: string[], categoryName?: string | null): string {
  const extra = categoryHashtag(categoryName);
  const tags = extra && !base.includes(extra) ? [...base, extra] : base;
  return tags.slice(0, MAX_HASHTAGS).join(" ");
}

function colorLine(colorOptions?: string[]): string | undefined {
  if (!colorOptions || colorOptions.length === 0) return undefined;
  return `Available in: ${colorOptions.join(", ")}`;
}

export interface WhatsAppStatusCaptionInput {
  name: string;
  price: number;
  reason: "new_product" | "price_change";
  /** Only meaningful when reason is "price_change". */
  previousPrice?: number | null;
}

// Deliberately much shorter than the Facebook/Instagram captions above — a
// WhatsApp Status caption sits as an overlay on top of a photo with very
// limited visible room, so this skips the hashtags/hook/description
// entirely and just states the one thing worth knowing at a glance.
export function buildWhatsAppStatusCaption(
  input: WhatsAppStatusCaptionInput,
): string {
  if (input.reason === "price_change" && input.previousPrice != null) {
    return [
      "🔥 Price Drop!",
      input.name,
      `Was ${formatPrice(input.previousPrice)} — now ${formatPrice(input.price)}`,
      "📩 DM to order",
    ].join("\n");
  }

  return [
    "✨ New Arrival",
    input.name,
    formatPrice(input.price),
    "📩 DM to order",
  ].join("\n");
}

export function buildFacebookCaption(input: SocialPostProductInput): string {
  const lines = [
    "✨ New Arrival ✨",
    "",
    input.name,
    "",
    input.shortDescription ?? "",
  ];

  const color = colorLine(input.colorOptions);
  if (color) lines.push("", color);

  lines.push(
    "",
    `💰 Price: ${formatPrice(input.price)}`,
    "",
    "🛍️ Shop Now:",
    input.productUrl,
    "",
    "❤️ Like & Share this post with your friends! 💕",
    "",
    buildHashtags(BASE_FACEBOOK_HASHTAGS, input.categoryName),
  );

  return lines.join("\n");
}

// Deliberately a different structure/tone from the Facebook caption, not a
// copy -- Instagram captions do better with a punchier hook up top and a
// denser hashtag block, and shouldn't read like a duplicate cross-post.
export function buildInstagramCaption(input: SocialPostProductInput): string {
  let description = input.shortDescription ?? "";
  const hook = `😍 Obsessed yet? Meet our ${input.name}.`;
  const color = colorLine(input.colorOptions);
  const hashtags = buildHashtags(BASE_INSTAGRAM_HASHTAGS, input.categoryName);

  function assemble(desc: string): string {
    const lines = [hook, "", desc];
    if (color) lines.push("", color);
    lines.push(
      "",
      `💫 ${formatPrice(input.price)} | Limited stock`,
      `🔗 Shop the link: ${input.productUrl}`,
      "",
      "❤️ Like & Share this post with your friends! 💕",
      "",
      hashtags,
    );
    return lines.join("\n");
  }

  let caption = assemble(description);
  while (caption.length > INSTAGRAM_CAPTION_LIMIT && description.length > 0) {
    description = `${description.slice(0, -1).trimEnd()}…`;
    caption = assemble(description);
  }

  return caption;
}

// No product link -- TikTok captions don't render URLs as tappable text
// (unlike Facebook/Instagram), so including one here would just be dead
// text eating into the tight TIKTOK_CAPTION_LIMIT for no benefit.
export function buildTikTokCaption(input: SocialPostProductInput): string {
  const hashtags = buildHashtags(BASE_TIKTOK_HASHTAGS, input.categoryName);
  let caption = `✨ New Arrival: ${input.name} — ${formatPrice(input.price)} ${hashtags}`;

  if (caption.length > TIKTOK_CAPTION_LIMIT) {
    const withoutHashtags = `✨ New Arrival: ${input.name} — ${formatPrice(input.price)}`;
    caption =
      withoutHashtags.length > TIKTOK_CAPTION_LIMIT
        ? `${withoutHashtags.slice(0, TIKTOK_CAPTION_LIMIT - 1).trimEnd()}…`
        : withoutHashtags;
  }

  return caption;
}
