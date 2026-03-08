import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_NUXT_PUBLIC_API_URL': JSON.stringify(process.env.NUXT_PUBLIC_API_URL || 'https://api.getalawyer.ng'),
      'import.meta.env.NUXT_PUBLIC_API_URL': JSON.stringify(process.env.NUXT_PUBLIC_API_URL || 'https://api.getalawyer.ng'),
    },
  },
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@peterbud/nuxt-query',
    '@pinia/nuxt',
    'nuxt-viewport',
  ],
  leaflet: {
    markerCluster: false,
  },
  viewport: {
    breakpoints: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    defaultBreakpoints: {
      desktop: 'lg',
      mobile: 'xs',
      tablet: 'md',
    },
    fallbackBreakpoint: 'lg',
  },
  fonts: {
    families: [
      {
        name: 'Plus Jakarta Sans',
        provider: 'google',
        weights: [200, 300, 400, 500, 600, 700],
        styles: ['normal'],
        subsets: ['latin'],
      }
    ]
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      betterAuthUrl: process.env.NUXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3001/api/auth',
    },
  },
  icon: {
    provider: 'iconify',
    collections: ['hugeicons'],
    serverBundle: {
      collections: ['hugeicons']
    }
  },
})