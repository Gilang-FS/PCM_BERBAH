// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false }, // Dimatikan untuk keamanan & performa production
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  srcDir: '.',
  dir: {
    pages: 'pages',
    layouts: 'layouts',
    middleware: 'middleware',
    plugins: 'plugins',
    assets: 'assets',
    public: 'public',
  },

  // Konfigurasi Runtime Variables
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      users: process.env.NUXT_PUBLIC_USERS
    }
  },

  // Security Headers
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com; frame-src https://www.google.com; connect-src 'self' http://localhost:3001 https://fonts.googleapis.com https://fonts.gstatic.com",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    },
    '/admin/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      title: 'Sistem Informasi PCM Berbah',
      meta: [
        { name: 'description', content: 'Sistem Informasi Keuangan, Wakaf, dan Keanggotaan Pimpinan Cabang Muhammadiyah Berbah' },
        { name: 'theme-color', content: '#1B5E20' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@700;800&display=swap' }
      ]
    }
  }
})
