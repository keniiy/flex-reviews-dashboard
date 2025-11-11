import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flex-reviews.local"),
  title: {
    default: "Flex Living · Reviews Dashboard",
    template: "%s · Flex Living Reviews",
  },
  description:
    "Operational dashboard for curating Hostaway reviews and publishing high-confidence guest testimonials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-primary text-fg min-h-screen`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
