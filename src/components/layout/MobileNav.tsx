"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavLinks } from "@/constants/navigation";
import { siteConfig } from "@/constants/site";
import { LogoutButton } from "@/components/auth";
import { useAuth } from "@/context/AuthContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinkStyles =
  "rounded-sm px-3 py-3 font-body text-base text-primary transition-colors hover:bg-beige hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        !isOpen && "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-primary/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        className={cn(
          "absolute inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-beige px-6 py-5">
          <span className="font-heading text-lg font-semibold text-primary">
            {siteConfig.name}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            tabIndex={isOpen ? 0 : -1}
            className="rounded-sm p-2 text-primary hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav
          aria-label="Mobile navigation links"
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6"
        >
          {mobileNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              tabIndex={isOpen ? 0 : -1}
              className={navLinkStyles}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-3 border-t border-beige" />

          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={navLinkStyles}
              >
                My Account
              </Link>
              <Link
                href="/account/profile"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={navLinkStyles}
              >
                Profile
              </Link>
              <Link
                href="/wishlist"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={navLinkStyles}
              >
                Wishlist
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={navLinkStyles}
              >
                Cart
              </Link>
              <LogoutButton
                onBeforeLogout={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={cn(navLinkStyles, "text-left")}
              >
                Logout
              </LogoutButton>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={navLinkStyles}
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className={navLinkStyles}
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
