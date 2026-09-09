"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { LogoutButton } from "@/components/auth";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface AdminShellProps {
  adminLabel: string;
  children: ReactNode;
}

export function AdminShell({ adminLabel, children }: AdminShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(isDrawerOpen, () => setIsDrawerOpen(false));
  useBodyScrollLock(isDrawerOpen);

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-beige bg-white lg:flex">
        <Link
          href="/admin"
          className="flex h-16 items-center border-b border-beige px-6 font-heading text-lg font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {siteConfig.name}
          <span className="ml-2 rounded-full bg-gold px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </Link>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
          <AdminNavLinks />
          <div className="flex flex-col gap-1 border-t border-beige pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 font-body text-sm font-medium text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
              View Store
            </Link>
            <LogoutButton className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-left font-body text-sm font-medium text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              Logout
            </LogoutButton>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          !isDrawerOpen && "pointer-events-none",
        )}
      >
        <div
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-primary/40 transition-opacity duration-300",
            isDrawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          aria-hidden={!isDrawerOpen}
          className={cn(
            "absolute inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
            isDrawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-beige px-6 py-5">
            <span className="font-heading text-lg font-semibold text-primary">
              {siteConfig.name} Admin
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close admin navigation"
              tabIndex={isDrawerOpen ? 0 : -1}
              className="rounded-sm p-2 text-primary hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
            <AdminNavLinks onNavigate={() => setIsDrawerOpen(false)} />
            <div className="flex flex-col gap-1 border-t border-beige pt-4">
              <Link
                href="/"
                onClick={() => setIsDrawerOpen(false)}
                tabIndex={isDrawerOpen ? 0 : -1}
                className="flex items-center gap-3 rounded-sm px-3 py-2.5 font-body text-sm font-medium text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
                View Store
              </Link>
              <LogoutButton
                tabIndex={isDrawerOpen ? 0 : -1}
                className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-left font-body text-sm font-medium text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Logout
              </LogoutButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-beige bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-label="Open admin navigation"
            className="inline-flex items-center justify-center rounded-sm p-2 text-primary hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="font-body text-sm text-muted">{adminLabel}</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
