import type { Metadata } from "next";
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
import "../styles/globals.css";

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
      </body>
    </html>
  );
}
