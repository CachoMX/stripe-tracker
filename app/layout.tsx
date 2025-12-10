import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./theme.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Payment Tracker SaaS - Track Stripe Payments with Hyros",
  description: "Multi-tenant SaaS for tracking Stripe payments with Hyros integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
