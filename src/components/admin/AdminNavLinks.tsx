"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/components/admin/adminNav";

interface AdminNavLinksProps {
  onNavigate?: () => void;
  className?: string;
}

export function AdminNavLinks({ onNavigate, className }: AdminNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className={cn("flex flex-col gap-1", className)}
    >
      {adminNavItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              isActive
                ? "bg-primary text-white"
                : "text-primary hover:bg-beige",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
