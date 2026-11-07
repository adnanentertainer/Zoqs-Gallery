/** A single slide in the homepage hero carousel, as consumed by the public
 * HeroSection variants. */
export interface HeroImage {
  id: string;
  imageUrl: string;
  /** Optional crop used in place of `imageUrl` on the Classic Split mobile
   * strip -- shown cropped to fill the frame (object-cover) when set.
   * When null, the mobile strip falls back to `imageUrl` shown uncropped
   * (object-contain, letterboxed) instead. Ignored everywhere else. */
  mobileImageUrl: string | null;
  altText: string;
}

/** Shape submitted from the admin create/edit form. */
export interface AdminHeroImageInput {
  imageUrl: string;
  mobileImageUrl: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminHeroImageListItem {
  id: string;
  imageUrl: string;
  mobileImageUrl: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
}
