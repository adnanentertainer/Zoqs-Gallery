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
  // Displayed on the checkout Easypaisa/JazzCash payment options and the
  // Contact Us page.
  mobileWalletNumber: "0331 6668233",
  socialLinks: {
    instagram: "https://instagram.com/zoqsgallery",
    facebook: "https://www.facebook.com/profile.php?id=61593653865604",
    tiktok: "#",
    whatsapp: "https://wa.me/923316668233",
  },
  // Where "a new order was placed" notification emails are sent from/to.
  // The from-address must be on a domain verified in Resend — that's
  // mail.zoqsgallery.com, not the bare zoqsgallery.com root domain.
  orderNotificationFromEmail:
    "ZOQ's Gallery Orders <orders@mail.zoqsgallery.com>",
  orderNotificationToEmail: "zoqsgallery@gmail.com",
} as const;

export type SiteConfig = typeof siteConfig;
