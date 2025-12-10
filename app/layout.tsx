import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./theme.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ping - Payment Tracking Precision Refined",
  description: "Track every Stripe payment with surgical precision. Multi-tenant SaaS platform with Hyros integration, custom domains, and real-time analytics.",
  icons: {
    icon: '/images/ping-favicon.svg',
    apple: '/images/ping-app-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
