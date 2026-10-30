import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

// Self-hosted and preloaded. `block` keeps the text hidden for a few ms instead of
// showing a fallback font that then changes size.
const onest = localFont({
  src: "./fonts/onest-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-onest",
  display: "block",
});

const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "block",
});

export const metadata: Metadata = {
  title: "zerospikes | interaction performance tests",
  description: "Performance limits for real browser interactions in Playwright.",
};

export const viewport: Viewport = { themeColor: "#1a1d1b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${onest.variable} ${mono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
