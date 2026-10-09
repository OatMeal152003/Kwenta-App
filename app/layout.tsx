import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

// Friendly + trustworthy pairing, self-hosted so the PWA works offline:
// Plus Jakarta Sans (rounded geometric headings), Inter (legible numbers/body).
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F766E",
};

export const metadata: Metadata = {
  title: "Kwenta — Offline Money Tracker",
  description: "Offline-first personal money tracker for Filipino users.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Kwenta" },
  icons: {
    icon: [
      { url: "/brand/kwenta-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

import TabBar from "@/components/layout/TabBar";
import AppLock from "@/components/settings/AppLock";
import IntroSplash from "@/components/IntroSplash";
import OnboardingName from "@/components/OnboardingName";
import ThemeProvider from "@/components/ThemeProvider";

// No-flash boot: apply stored theme before first paint (mirrors lib/theme.ts).
const themeBoot = `(function(){try{var t=localStorage.getItem("kwenta-theme");if(t==="light"||t==="dark"){document.documentElement.classList.toggle("dark",t==="dark")}else{document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme: dark)").matches)}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="font-body bg-bg text-ink"><ThemeProvider><IntroSplash /><OnboardingName /><AppLock>{children}</AppLock><TabBar /></ThemeProvider></body>
    </html>
  );
}
