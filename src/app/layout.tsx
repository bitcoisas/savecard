import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const pixel = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Savecard",
  description:
    "Create shareable images from your Backloggd game logs for Instagram, X, Bluesky, Reddit and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${pixel.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
