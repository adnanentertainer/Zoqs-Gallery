import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  Warehouse,
  Truck,
  ClipboardList,
  FileBarChart,
  Star,
  Images,
  Share2,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Suppliers", href: "/admin/suppliers", icon: Truck },
  { label: "Purchases", href: "/admin/purchases", icon: ClipboardList },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Follow Our Style", href: "/admin/social-posts", icon: Images },
  { label: "Social Auto-Post", href: "/admin/social-media", icon: Share2 },
  { label: "Reels", href: "/admin/reels", icon: Clapperboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
