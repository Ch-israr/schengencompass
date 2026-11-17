import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_URL } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Schengen 90/180 Day Calculator — SchengenCompass",
    template: "%s — SchengenCompass",
  },
  description:
    "Free Schengen 90/180-day calculator. Enter your past trips and see how many days you have left, your longest legal stay, and your earliest safe re-entry date.",
  openGraph: {
    siteName: "SchengenCompass",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SchengenCompass — Schengen 90/180-day calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>
          <div className="container">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
