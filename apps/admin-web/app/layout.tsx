import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneStay360 | India's Smartest Co-Living & PG Management Platform",
  description:
    "Discover verified PGs with 360° virtual tours and 0% UPI fee rent payments. The automated operating system for modern PG owners and tenants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
