"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { cn } from "@/lib/utils";

const menuItemStyles =
  "block rounded-sm px-4 py-2 text-left font-body text-sm text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold";

interface AccountMenuProps {
  className?: string;
}

export function AccountMenu({ className }: AccountMenuProps) {
  const { isAuthenticated, user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEscapeKey(isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Account"
        className={className}
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-sm border border-beige bg-white py-2 shadow-lg"
        >
          {isAuthenticated ? (
            <>
              <div className="border-b border-beige px-4 py-2">
                <p className="truncate font-body text-xs text-muted">
                  Signed in as
                </p>
                <p className="truncate font-body text-sm font-medium text-primary">
                  {user?.email}
                </p>
              </div>
              <Link
                role="menuitem"
                href="/account"
                onClick={() => setIsOpen(false)}
                className={menuItemStyles}
              >
                My Account
              </Link>
              <Link
                role="menuitem"
                href="/account/profile"
                onClick={() => setIsOpen(false)}
                className={menuItemStyles}
              >
                Profile
              </Link>
              <Link
                role="menuitem"
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className={menuItemStyles}
              >
                Wishlist
              </Link>
              {profile?.role === "admin" && (
                <Link
                  role="menuitem"
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={menuItemStyles}
                >
                  Admin Dashboard
                </Link>
              )}
              <LogoutButton
                role="menuitem"
                onBeforeLogout={() => setIsOpen(false)}
                className={cn(menuItemStyles, "w-full")}
              >
                Logout
              </LogoutButton>
            </>
          ) : (
            <>
              <Link
                role="menuitem"
                href="/login"
                onClick={() => setIsOpen(false)}
                className={menuItemStyles}
              >
                Login
              </Link>
              <Link
                role="menuitem"
                href="/signup"
                onClick={() => setIsOpen(false)}
                className={menuItemStyles}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
