"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/** Shared with ProductActions.tsx's mobile sticky Add to Cart bar (which
 * stacks directly above this) and the floating WhatsApp/toast positions
 * (which clear it) -- the bar's own content height, excluding the iOS home
 * indicator safe area added on top via padding. Keep this value in sync
 * with any "4rem" bottom offsets in those files if it ever changes. */
const BAR_HEIGHT_REM = 4;

interface TabDefinition {
  label: string;
  href: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
}

const navTabs: TabDefinition[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    isActive: (pathname) => pathname === "/",
  },
  {
    label: "Shop",
    href: "/shop",
    icon: Store,
    isActive: (pathname) => pathname === "/shop" || pathname.startsWith("/category/"),
  },
  {
    label: "Categories",
    href: "/products",
    icon: LayoutGrid,
    isActive: (pathname) => pathname === "/products",
  },
];

/**
 * Fixed mobile-only bottom navigation -- quick-access to the four
 * destinations a shopper reaches for most, so core navigation doesn't
 * require opening the hamburger menu. Desktop keeps the header's full nav
 * (lg:hidden here matches the header's own xl:hidden mobile-menu trigger
 * breakpoint convention used elsewhere for "mobile" across the site).
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const cart = useCart();
  const { isAuthenticated } = useAuth();

  const accountHref = isAuthenticated ? "/account" : "/login";
  const isAccountActive =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/login" ||
    pathname === "/signup";
  const isCartActive = !cart.isDrawerOpen && pathname === "/cart";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-beige bg-white/95 shadow-[0_-4px_20px_rgba(31,31,31,0.08)] backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="mx-auto grid max-w-md grid-cols-5 items-stretch"
        style={{ height: `${BAR_HEIGHT_REM}rem` }}
      >
        {navTabs.map((tab) => (
          <TabLink
            key={tab.label}
            label={tab.label}
            href={tab.href}
            Icon={tab.icon}
            isActive={tab.isActive(pathname)}
          />
        ))}

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
          className={tabStyles(cart.isDrawerOpen || isCartActive)}
        >
          <span className="relative">
            <ShoppingBag className="h-[22px] w-[22px]" aria-hidden="true" />
            {cart.totalQuantity > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-body text-[9px] font-semibold text-white"
              >
                {cart.totalQuantity > 99 ? "99+" : cart.totalQuantity}
              </span>
            )}
          </span>
          <span className="font-body text-[10px] font-medium uppercase tracking-wide">
            Cart
          </span>
        </button>

        <TabLink
          label="Account"
          href={accountHref}
          Icon={User}
          isActive={isAccountActive}
        />
      </div>
    </nav>
  );
}

function tabStyles(isActive: boolean) {
  return cn(
    "group relative flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold",
    isActive ? "text-gold" : "text-muted hover:text-primary",
  );
}

function TabLink({
  label,
  href,
  Icon,
  isActive,
}: {
  label: string;
  href: string;
  Icon: typeof Home;
  isActive: boolean;
}) {
  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} className={tabStyles(isActive)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
          isActive && "bg-gold/10",
        )}
      >
        <Icon className="h-[22px] w-[22px]" aria-hidden="true" strokeWidth={isActive ? 2.25 : 2} />
      </span>
      <span className="font-body text-[10px] font-medium uppercase tracking-wide">
        {label}
      </span>
    </Link>
  );
}
