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
  },
  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/leaflet',
    '@nuxtjs/seo',
    '@peterbud/nuxt-query',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      betterAuthUrl: process.env.NUXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3001/api/auth',
    },
  },
})