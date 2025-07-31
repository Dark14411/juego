/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  output: 'standalone',
  trailingSlash: true,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXT_TELEMETRY_DISABLED: '1'
  }
}

export default nextConfig
