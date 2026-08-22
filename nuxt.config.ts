import tailwindcss from "@tailwindcss/vite";
import {
  DEV_API_URL,
  DEV_BETTER_AUTH_URL,
  PROD_API_URL,
  PROD_BETTER_AUTH_URL,
} from "./app/lib/api-config";

const isProduction = process.env.NODE_ENV === "production";

const apiUrl = process.env.NUXT_PUBLIC_API_URL || (isProduction ? PROD_API_URL : DEV_API_URL);
const betterAuthUrl =
  process.env.NUXT_PUBLIC_BETTER_AUTH_URL || (isProduction ? PROD_BETTER_AUTH_URL : DEV_BETTER_AUTH_URL);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: !isProduction },

  site: {
    url: process.env.NUXT_SITE_URL || 'https://getalawyer.ng',
    name: 'getalawyer',
  },
  sitemap: {
    // Auth-gated and transactional routes have no business in the sitemap.
    exclude: [
      '/dashboard/**',
      '/onboarding/**',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify',
      '/verify-otp',
      '/verify-payment',
    ],
  },

  routeRules: {
    // Exceptions moved onto the Availability page as a tab.
    '/dashboard/availability/exceptions': { redirect: { to: '/dashboard/availability?tab=exceptions', statusCode: 301 } },
  },

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
      'import.meta.env.VITE_NUXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.NUXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_NUXT_PUBLIC_BETTER_AUTH_URL': JSON.stringify(betterAuthUrl),
      'import.meta.env.NUXT_PUBLIC_BETTER_AUTH_URL': JSON.stringify(betterAuthUrl),
    },
  },
  modules: ['@nuxt/image', '@nuxtjs/seo', '@peterbud/nuxt-query', '@pinia/nuxt', 'nuxt-viewport', 'shadcn-nuxt', '@nuxt/fonts'],
  app: {
    head: {
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
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
    // Satoshi (Indian Type Foundry, Fontshare) — the variable face committed in
    // public/fonts; byte-identical to Fontshare's CDN file. @nuxt/fonts owns the
    // @font-face and fallback metrics. Not fetched through the Fontshare provider:
    // that only exposes the static cuts (no 600, five files) and makes the build
    // depend on the CDN. No italics are used in the UI.
    families: [
      {
        name: 'Satoshi',
        src: [
          {
            // `url` is what the CSS points at; `originalURL` lets @nuxt/fonts read the
            // file for fallback metrics (size-adjust etc.), which it can't do from a web path.
            url: '/fonts/Satoshi-Variable.woff2',
            originalURL: new URL('./public/fonts/Satoshi-Variable.woff2', import.meta.url).href,
            format: 'woff2',
          },
        ],
        weight: '300 900',
        style: 'normal',
        display: 'swap',
        fallbacks: ['Helvetica Neue', 'Arial', 'Segoe UI', 'Noto Sans'],
      },
    ],
    // Satoshi is the only web font; skip the remote providers' metadata fetches
    // so builds don't depend on fonts.google.com / bunny / fontsource being reachable.
    providers: {
      google: false,
      googleicons: false,
      bunny: false,
      fontsource: false,
      fontshare: false,
      adobe: false,
    },
    defaults: {
      weights: [400, 500],
      styles: ['normal'],
    },
  },
  runtimeConfig: {
    public: {
      apiUrl,
      betterAuthUrl,
    },
  },
})