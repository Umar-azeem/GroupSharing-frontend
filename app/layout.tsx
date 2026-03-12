import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "GroupShare – Discover & Share Instagram Communities",
  description: "Find and share the best Instagram group links. Discover communities for Tech, Gaming, Business, Education, Crypto and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
