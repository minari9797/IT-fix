import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // Ignore TOUTES les erreurs TypeScript au déploiement
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore TOUTES les erreurs ESLint au déploiement
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
