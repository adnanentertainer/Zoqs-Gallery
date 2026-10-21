"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset, Heart, Menu, ShoppingBag, Sparkles } from "lucide-react";
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

interface HeaderProps {
  /** Hides the "Wedding Collection" nav link (desktop and mobile) whenever
   * the Wedding Season Promotion is turned off in Admin → Settings — the
   * page itself (/wedding-collection) stays reachable directly either way,
   * only its nav entry is tied to this toggle. */
  weddingCollectionEnabled: boolean;
}

export function Header({ weddingCollectionEnabled }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();
  const pathname = usePathname();
  const visibleNavLinks = weddingCollectionEnabled
    ? mainNavLinks
    : mainNavLinks.filter((link) => link.href !== "/wedding-collection");

  // Clicking "Home" while already on the home page is otherwise a no-op --
  // Next.js doesn't re-navigate to the current route. Scroll to top instead,
  // matching what a shopper actually expects from clicking it.
  function handleNavLinkClick(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (href === "/" && pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-beige bg-white/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4 lg:h-20">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4 lg:gap-10">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav"
              aria-label="Open menu"
              className={cn("inline-flex shrink-0 xl:hidden", iconButtonStyles)}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <Link
              href="/"
              className="shrink-0 whitespace-nowrap rounded-sm font-heading text-lg font-semibold tracking-wider text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-2xl lg:text-[1.75rem]"
              style={{
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(0,0,0,0.35)",
              }}
            >
              {siteConfig.name}
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-5 xl:flex"
            >
              {visibleNavLinks.map((link) => {
                const isWeddingLink = link.href === "/wedding-collection";
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={(event) => handleNavLinkClick(event, link.href)}
                    className={cn(
                      "group/navlink relative inline-flex items-center gap-1 whitespace-nowrap rounded-sm py-2 font-body text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                      isWeddingLink
                        ? "text-gold hover:text-maroon"
                        : "text-primary hover:text-gold",
                    )}
                  >
                    {isWeddingLink && (
                      <Sparkles
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 transition-transform duration-300 group-hover/navlink:scale-x-100",
                        isWeddingLink ? "bg-maroon" : "bg-gold",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <SearchTrigger className={iconButtonStyles} />
            <Link
              href="/contact"
              aria-label="Contact Us"
              className={cn("inline-flex", iconButtonStyles)}
            >
              <Headset className="h-5 w-5" aria-hidden="true" />
            </Link>
            <AccountMenu
              className={cn("hidden xl:inline-flex", iconButtonStyles)}
            />
            <Link
              href="/wishlist"
              aria-label={
                wishlist.count > 0
                  ? `Wishlist, ${wishlist.count} saved item${wishlist.count === 1 ? "" : "s"}`
                  : "Wishlist"
              }
              className={cn("inline-flex", iconButtonStyles)}
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
        weddingCollectionEnabled={weddingCollectionEnabled}
      />
      <CartDrawer />
    </>
  );
}
