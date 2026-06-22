import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext";

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
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}