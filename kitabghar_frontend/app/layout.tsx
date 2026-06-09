import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KitabGhar",
  description: "Buy and sell unwanted books",
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