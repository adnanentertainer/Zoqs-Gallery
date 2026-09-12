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
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
