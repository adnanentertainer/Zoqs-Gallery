const UNSPLASH_BASE = "https://images.unsplash.com";

function unsplash(photoId: string, width: number) {
  return `${UNSPLASH_BASE}/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/**
 * Centralized jewellery/fashion placeholder photography. Swap these ids for
 * real product photography when the catalog goes live — every consumer of
 * this module reads from here, so no other file needs to change.
 */
export const galleryImages = {
  pearlNecklaceBox: unsplash("1515562141207-7a88fb7ce338", 1200),
  goldInfinityBracelet: unsplash("1611591437281-460bfbe1220a", 1200),
  silverRhinestoneBracelet: unsplash("1573408301185-9146fe634ad0", 1200),
  goldRingBangleStack: unsplash("1543294001-f7cd5d7fb516", 1200),
  gemstoneClusterRing: unsplash("1602751584552-8ba73aad10e1", 1200),
  traditionalGoldSet: unsplash("1601121141461-9d6647bca1ed", 1200),
  layeredPendantNecklaces: unsplash("1599643478518-a784e5dc4c8f", 1200),
  hangingPendantDisplay: unsplash("1506630448388-4e683c67ddb0", 1200),
  statementEarringsLeaf: unsplash("1535632066927-ab7c9ab60908", 1200),
  modelWearingNecklace: unsplash("1611652022419-a9419f74343d", 1200),
  roseGoldWatch: unsplash("1524592094714-0f0654e20314", 1200),
  weddingGoldRingsPair: unsplash("1622398925373-3f91b1e275f5", 1200),
  goldBangleStackArm: unsplash("1583292650898-7d22cd27ca6f", 1200),
  goldHoopEarrings: unsplash("1617038260897-41a1f14a8ca0", 1200),
  goldHoopEarringsAlt: unsplash("1617038220319-276d3cfab638", 1200),
  modelWearingPendant: unsplash("1611085583191-a3b181a88401", 1200),
} as const;

export const heroImage = unsplash("1694062045776-f48d9b6de57e", 1600);
export const promoBannerImage = unsplash("1611085583191-a3b181a88401", 1600);
export const bridalBannerImage = unsplash("1610173827043-9db50e0d8ef9", 1600);
