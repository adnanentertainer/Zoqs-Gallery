export const siteConfig = {
  name: "ZOQ's Gallery",
  tagline: "Elegance That Defines Your ZOQ",
  description:
    "Premium artificial jewellery and fashion accessories in Pakistan.",
  currency: "PKR",
  country: "Pakistan",
  freeShippingThreshold: 3000,
  flatShippingCost: 250,
  announcement: "Free Delivery on Orders Above Rs. 3,000",
  socialLinks: {
    instagram: "#",
    facebook: "#",
    tiktok: "#",
    whatsapp: "#",
  },
} as const;

export type SiteConfig = typeof siteConfig;
