export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Seller", href: "/best-sellers" },
  { label: "Accessories", href: "/category/accessories" },
];

export const mobileNavLinks: NavLink[] = [
  ...mainNavLinks,
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];
