import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JeezBank — JMB · Banking, reimagined",
  description: "The next-generation digital bank. Send, save and spend with JeezBank.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "JeezBank" },
};

export const viewport: Viewport = {
  themeColor: "#07070d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen text-[var(--jmb-text)]">{children}</body>
    </html>
  );
}
