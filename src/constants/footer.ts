import type { NavLink } from "@/constants/navigation";

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "New Arrivals", href: "/shop?special=new" },
      { label: "Best Sellers", href: "/shop?special=best-seller" },
      { label: "Jewellery", href: "/category/jewellery-sets" },
      { label: "Accessories", href: "/category/accessories" },
      { label: "Sale", href: "/shop?special=sale" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", href: "#contact" },
      { label: "Delivery Information", href: "#delivery-information" },
      { label: "Returns & Exchanges", href: "#returns-exchanges" },
      { label: "Track Order", href: "#track-order" },
      { label: "FAQs", href: "#faqs" },
    ],
  },
  {
    title: "About ZOQ's Gallery",
    links: [
      { label: "Our Story", href: "#our-story" },
      { label: "Privacy Policy", href: "#privacy-policy" },
      { label: "Terms & Conditions", href: "#terms-and-conditions" },
    ],
  },
];
