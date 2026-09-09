import { galleryImages } from "@/constants/images";
import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-earrings",
    name: "Earrings",
    slug: "earrings",
    image: galleryImages.statementEarringsLeaf,
    productCount: 42,
    description: "Studs, hoops and drops for every occasion.",
  },
  {
    id: "cat-necklaces",
    name: "Necklaces",
    slug: "necklaces",
    image: galleryImages.hangingPendantDisplay,
    productCount: 38,
    description: "Delicate pendants to statement chains.",
  },
  {
    id: "cat-bracelets",
    name: "Bracelets",
    slug: "bracelets",
    image: galleryImages.goldBangleStackArm,
    productCount: 27,
    description: "Bangles, cuffs and chain bracelets.",
  },
  {
    id: "cat-rings",
    name: "Rings",
    slug: "rings",
    image: galleryImages.gemstoneClusterRing,
    productCount: 31,
    description: "Everyday bands and statement cocktail rings.",
  },
  {
    id: "cat-jewellery-sets",
    name: "Jewellery Sets",
    slug: "jewellery-sets",
    image: galleryImages.goldRingBangleStack,
    productCount: 19,
    description: "Coordinated sets for effortless styling.",
  },
  {
    id: "cat-bridal-jewellery",
    name: "Bridal Jewellery",
    slug: "bridal-jewellery",
    image: galleryImages.weddingGoldRingsPair,
    productCount: 24,
    description: "Festive, elegant pieces for your big day.",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    image: galleryImages.roseGoldWatch,
    productCount: 16,
    description: "Watches and finishing touches.",
  },
];
