import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DevBadge } from "@/components/dev-badge";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Brand Keeper - Plataforma de Gestión de Marca",
  description: "Plataforma corporativa para centralizar, gestionar y distribuir elementos de marca",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        {children}
        <DevBadge />
        <SpeedInsights />
      </body>
    </html>
  );
}

