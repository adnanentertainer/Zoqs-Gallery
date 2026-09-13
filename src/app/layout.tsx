import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/constants/site";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { getServerUser } from "@/lib/auth/getServerUser";
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
  const initialUser = await getServerUser();

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
        <ToastProvider>
          <AuthProvider initialUser={initialUser}>
            <WishlistProvider>
              <CartProvider>
                <AnnouncementBar />
                <Header />
                <main className="flex flex-1 flex-col">{children}</main>
                <Footer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
