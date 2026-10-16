import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/constants/site";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FestivalCountdownBanner } from "@/components/layout/FestivalCountdownBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { PromoStatusProvider } from "@/context/PromoStatusContext";
import { getShippingSettings } from "@/lib/checkout/getShippingSettings";
import { hasActivePromoCode } from "@/lib/services/promoCodeService";
import { getBlessedFridayOffer } from "@/lib/services/blessedFridayOfferService";
import { META_PIXEL_ID } from "@/constants/meta";
import { safeJsonLd } from "@/lib/utils";
import "../styles/globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const organizationJsonLd = {
  "@context": "https://schema.org/",
  "@type": "Organization",
  name: siteConfig.name,
  url: baseUrl,
  logo: `${baseUrl}/icon.png`,
  sameAs: [
    siteConfig.socialLinks.instagram,
    siteConfig.socialLinks.facebook,
    siteConfig.socialLinks.whatsapp,
  ],
};

// Lets Google show a sitelinks search box directly in search results,
// submitting to the real /search?q= route the app already serves.
const websiteJsonLd = {
  "@context": "https://schema.org/",
  "@type": "WebSite",
  name: siteConfig.name,
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Resolves relative Open Graph/canonical URLs against the real production
  // origin. Without this, NEXT_PUBLIC_SITE_URL was defined in .env.example
  // but never actually read anywhere, and Next.js falls back to inferring a
  // base URL (unreliable behind a proxy/custom domain in production).
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: "/",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
  verification: {
    // Confirms domain ownership for Google Search Console — do not remove,
    // even after verification succeeds, or Search Console loses access.
    google: "NG2dySLIOEj5PqZ1xPGXemAW9vxmYRvEwNJPN-rEiCQ",
    // Confirms domain ownership for Meta Business Manager — do not remove,
    // even after verification succeeds, or Meta re-flags the domain unverified.
    other: {
      "facebook-domain-verification": "08n8l2hki0x2dfea7nuyrgt7zyy4pf",
    },
  },
};

// Declares this site as light-only. Without it, some Android browsers
// (Xiaomi/MIUI's among them) apply their own forced-dark-mode heuristic to
// the whole page, which auto-inverts near-black elements to white — that's
// what was turning the TikTok icon's dark circle into a blank white one.
export const viewport: Viewport = {
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [shippingSettings, promoActive, blessedFridayOffer] =
    await Promise.all([
      getShippingSettings(),
      hasActivePromoCode(),
      getBlessedFridayOffer(),
    ]);

  // Same override checkout applies (see CheckoutForm's effectiveShippingSettings)
  // — while the Blessed Friday offer is on, the evergreen free-shipping perk
  // is suspended store-wide, so the cart drawer/page must never promise free
  // shipping it won't actually deliver at checkout.
  const effectiveShippingSettings = blessedFridayOffer.enabled
    ? { ...shippingSettings, freeShippingThreshold: Number.MAX_SAFE_INTEGER }
    : shippingSettings;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-body text-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <PromoStatusProvider hasActivePromoCode={promoActive}>
                <CartProvider
                  shippingSettings={effectiveShippingSettings}
                  blessedFridayOfferEnabled={blessedFridayOffer.enabled}
                >
                  <FestivalCountdownBanner />
                  <AnnouncementBar />
                  <Header />
                  <main className="flex flex-1 flex-col">{children}</main>
                  <Footer />
                </CartProvider>
              </PromoStatusProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
        <Analytics />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
