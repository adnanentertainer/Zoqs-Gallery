/** A single slide in the homepage hero carousel, as consumed by the public
 * HeroSection variants. */
export interface HeroImage {
  id: string;
  imageUrl: string;
  altText: string;
}

/** Shape submitted from the admin create/edit form. */
export interface AdminHeroImageInput {
  imageUrl: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminHeroImageListItem {
  id: string;
  imageUrl: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
}
