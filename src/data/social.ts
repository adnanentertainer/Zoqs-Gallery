import { siteConfig } from "@/constants/site";
import type { SocialPost } from "@/types";

// Real product photos from the catalog (not stock images), all linking to
// the Instagram profile -- see the "Follow Our Style" section on the home
// page.
export const socialPosts: SocialPost[] = [
  {
    id: "social-001",
    image:
      "https://res.cloudinary.com/mg0ric2u/image/upload/f_auto,q_auto/v1789077419/IMG_1190_2.jpg",
    alt: "Royal Gold Crystal Designer Bangle Set",
    href: siteConfig.socialLinks.instagram,
  },
  {
    id: "social-002",
    image:
      "https://res.cloudinary.com/mg0ric2u/image/upload/f_auto,q_auto/v1789325153/IMG_1401.jpg",
    alt: "Elegant Crystal Double-Drop Earrings & Colorful Safety Pin Brooch",
    href: siteConfig.socialLinks.instagram,
  },
  {
    id: "social-003",
    image:
      "https://res.cloudinary.com/mg0ric2u/image/upload/f_auto,q_auto/v1789324371/IMG_1411.jpg",
    alt: "Silver Crystal Bridal Jhumka Earrings",
    href: siteConfig.socialLinks.instagram,
  },
  {
    id: "social-004",
    image:
      "https://res.cloudinary.com/mg0ric2u/image/upload/f_auto,q_auto/v1789323602/IMG_1090.jpg",
    alt: "Multicolor Beaded Sahara Earrings",
    href: siteConfig.socialLinks.instagram,
  },
  {
    id: "social-005",
    image:
      "https://res.cloudinary.com/mg0ric2u/image/upload/f_auto,q_auto/v1789322746/IMG_1174.jpg",
    alt: "Golden Floral Pearl & Beaded Bridal Jewelry Set",
    href: siteConfig.socialLinks.instagram,
  },
  {
    id: "social-006",
    image:
      "https://res.cloudinary.com/mg0ric2u/image/upload/f_auto,q_auto/v1789324696/IMG_1375.jpg",
    alt: "Elegant Floral Crystal Stud Earrings with Safety Pins",
    href: siteConfig.socialLinks.instagram,
  },
];
