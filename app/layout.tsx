import type { Metadata, Viewport } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { DevBadge } from "@/components/dev-badge";
import { DevReload } from "@/components/dev-reload";
import { SpeedInsightsWrapper } from "@/components/speed-insights-wrapper";
import { Toaster } from "@/components/ui/sonner";

const overpass = Overpass({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-overpass",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brand Keeper - Plataforma de Gestión de Marca",
  description: "Plataforma corporativa para centralizar, gestionar y distribuir elementos de marca",
};

// Configuración de viewport para evitar problemas de hidratación
// themeColor debe estar en viewport, no en metadata según Next.js 16
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      <body suppressHydrationWarning className={`${overpass.variable} font-sans min-h-screen antialiased`}>
        {children}
        <DevBadge />
        <DevReload />
        <SpeedInsightsWrapper />
        <Toaster />
      </body>
    </html>
  );
}

