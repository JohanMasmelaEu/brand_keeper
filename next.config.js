/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Optimizaciones para Vercel
  poweredByHeader: false,
  compress: true,
  // Nota: Vercel maneja el output automáticamente, no necesitamos 'standalone'
  // que puede causar problemas de permisos en Windows durante el build local
}

module.exports = nextConfig

