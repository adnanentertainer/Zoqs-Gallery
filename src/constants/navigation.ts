export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop?special=new" },
  { label: "Jewellery", href: "/shop" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Sale", href: "/shop?special=sale" },
];

export const mobileNavLinks: NavLink[] = [
  ...mainNavLinks,
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];
