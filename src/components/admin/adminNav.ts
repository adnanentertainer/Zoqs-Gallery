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
  Ticket,
  Megaphone,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED } from "@/lib/features";

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
  { label: "Promo Codes", href: "/admin/promo-codes", icon: Ticket },
  { label: "Promo Banners", href: "/admin/promo-banners", icon: Megaphone },
  ...(SOCIAL_ENGAGEMENT_CAMPAIGNS_ENABLED
    ? [{ label: "Social Campaigns", href: "/admin/social-campaigns", icon: Gift }]
    : []),
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Follow Our Style", href: "/admin/social-posts", icon: Images },
  { label: "Social Auto-Post", href: "/admin/social-media", icon: Share2 },
  { label: "Reels", href: "/admin/reels", icon: Clapperboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
