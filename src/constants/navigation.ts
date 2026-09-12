export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?special=new" },
  { label: "Jewellery", href: "/shop" },
  { label: "Accessories", href: "/category/accessories" },
];

export const mobileNavLinks: NavLink[] = [
  ...mainNavLinks,
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];
