import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatbotWidget from "./_components/ChatbotWidget";

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
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
          <UserProvider>
            {children}
            <ChatbotWidget />
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}