import tailwindcss from "@tailwindcss/vite";
import { DEV_API_URL, DEV_BETTER_AUTH_URL } from "./app/lib/api-config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],
  vite: {
    ssr: {
      /** Zod 4 ESM + Vite SSR: avoid broken named export interop (`z` undefined). */
      noExternal: ['zod'],
    },
    plugins: [
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_NUXT_PUBLIC_API_URL': JSON.stringify(process.env.NUXT_PUBLIC_API_URL || DEV_API_URL),
      'import.meta.env.NUXT_PUBLIC_API_URL': JSON.stringify(process.env.NUXT_PUBLIC_API_URL || DEV_API_URL),
      'import.meta.env.VITE_NUXT_PUBLIC_BETTER_AUTH_URL': JSON.stringify(process.env.NUXT_PUBLIC_BETTER_AUTH_URL || DEV_BETTER_AUTH_URL),
      'import.meta.env.NUXT_PUBLIC_BETTER_AUTH_URL': JSON.stringify(process.env.NUXT_PUBLIC_BETTER_AUTH_URL || DEV_BETTER_AUTH_URL),
    },
  },
  modules: ['@nuxt/image', '@nuxtjs/seo', '@peterbud/nuxt-query', '@pinia/nuxt', 'nuxt-viewport', 'shadcn-nuxt', '@nuxt/fonts'],
  image: {
    inject: true,
  },
  build: {
    transpile: ['@nuxt/image'],
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
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
      // Neue Haas Grotesk Text — headings & display
      {
        name: 'Neue Haas Grotesk Text',
        src: '/fonts/neue-haas-grotesk-text-400.woff2',
        weight: 400,
        style: 'normal',
        global: true,
      },
      {
        name: 'Neue Haas Grotesk Text',
        src: '/fonts/neue-haas-grotesk-text-400-italic.woff2',
        weight: 400,
        style: 'italic',
        global: true,
      },
      {
        name: 'Neue Haas Grotesk Text',
        src: '/fonts/neue-haas-grotesk-text-500.woff2',
        weight: 500,
        style: 'normal',
        global: true,
      },
      {
        name: 'Neue Haas Grotesk Text',
        src: '/fonts/neue-haas-grotesk-text-500-italic.woff2',
        weight: 500,
        style: 'italic',
        global: true,
      },

      // CursorGothic — body copy
      {
        name: 'CursorGothic',
        src: '/fonts/CursorGothic-Regular.woff2',
        weight: 400,
        style: 'normal',
        global: true,
      },
      {
        name: 'CursorGothic',
        src: '/fonts/CursorGothic-Italic.woff2',
        weight: 400,
        style: 'italic',
        global: true,
      },
      {
        name: 'CursorGothic',
        src: '/fonts/CursorGothic-Bold.woff2',
        weight: 700,
        style: 'normal',
        global: true,
      },
      {
        name: 'CursorGothic',
        src: '/fonts/CursorGothic-BoldItalic.woff2',
        weight: 700,
        style: 'italic',
        global: true,
      },
    ],
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || DEV_API_URL,
      betterAuthUrl: process.env.NUXT_PUBLIC_BETTER_AUTH_URL || DEV_BETTER_AUTH_URL,
    },
  },
})