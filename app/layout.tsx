import type { Metadata } from "next";
import "./globals.css";
import { DevBadge } from "@/components/dev-badge";

export const metadata: Metadata = {
  title: "Brand Keeper - Plataforma de Gestión de Marca",
  description: "Plataforma corporativa para centralizar, gestionar y distribuir elementos de marca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <DevBadge />
      </body>
    </html>
  );
}

