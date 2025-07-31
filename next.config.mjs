/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Render
  output: 'standalone',
  
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  
  // Configuración de PWA
  experimental: {
    // Optimizaciones de memoria
    optimizeCss: true
  },
  
  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false
  },
  
  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false
  },
  
  // Configuración de trailing slash
  trailingSlash: false,
  
  // Configuración de base path
  basePath: '',
  
  // Configuración de asset prefix
  assetPrefix: '',
  
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    // Configuración para archivos estáticos
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp)$/i,
      type: 'asset/resource'
    })
    
    // Optimizaciones de memoria para webpack
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de powered by header
  poweredByHeader: false,
  
  // Configuración de react strict mode
  reactStrictMode: true
}

export default nextConfig
