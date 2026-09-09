"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { mainNavLinks } from "@/constants/navigation";
import { siteConfig } from "@/constants/site";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AccountMenu } from "@/components/auth";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const iconButtonStyles =
  "relative items-center justify-center rounded-sm p-2 text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

const badgeStyles =
  "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-body text-[10px] font-semibold text-white";

export function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-beige bg-white/95 backdrop-blur">
        <Container className="relative flex h-16 items-center justify-between gap-4 lg:h-20">
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav"
              aria-label="Open menu"
              className={cn("inline-flex lg:hidden", iconButtonStyles)}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-8 lg:flex"
            >
              {mainNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-sm font-body text-sm font-medium tracking-wide text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-heading text-xl font-semibold tracking-wide text-primary sm:text-2xl"
          >
            {siteConfig.name}
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <SearchTrigger className={iconButtonStyles} />
            <AccountMenu
              className={cn("hidden lg:inline-flex", iconButtonStyles)}
            />
            <Link
              href="/wishlist"
              aria-label={
                wishlist.count > 0
                  ? `Wishlist, ${wishlist.count} saved item${wishlist.count === 1 ? "" : "s"}`
                  : "Wishlist"
              }
              className={cn("hidden lg:inline-flex", iconButtonStyles)}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {wishlist.count > 0 && (
                <span className={badgeStyles} aria-hidden="true">
                  {wishlist.count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={cart.toggleDrawer}
              aria-expanded={cart.isDrawerOpen}
              aria-controls="cart-drawer"
              aria-label={
                cart.totalQuantity > 0
                  ? `Shopping cart, ${cart.totalQuantity} item${cart.totalQuantity === 1 ? "" : "s"}`
                  : "Shopping cart"
              }
              className={cn("inline-flex", iconButtonStyles)}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cart.totalQuantity > 0 && (
                <span className={badgeStyles} aria-hidden="true">
                  {cart.totalQuantity}
                </span>
              )}
            </button>
          </div>
        </Container>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      <CartDrawer />
    </>
  );
}
