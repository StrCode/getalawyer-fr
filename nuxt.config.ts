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

/**
 * Pages rebuilt in the Canopy design (see app/assets/css/canopy.css). Only these
 * follow the visitor's light / dark / system choice; every other page is pinned
 * to light until it is rebuilt and checked in dark. Add a route path here when
 * its page moves to the `site` (or rebuilt `auth`) layout.
 */
const THEMED_ROUTES = new Set<string>(['/', '/find-lawyers'])

/** A committed variable font in public/fonts, self-hosted through @nuxt/fonts. */
function localVariableFont(name: string, file: string, weight: string, fallbacks?: string[]) {
  return {
    name,
    src: [
      {
        // `url` is what the CSS points at; `originalURL` lets @nuxt/fonts read the
        // file for fallback metrics (size-adjust etc.), which it can't do from a web path.
        url: `/fonts/${file}`,
        originalURL: new URL(`./public/fonts/${file}`, import.meta.url).href,
        format: 'woff2' as const,
      },
    ],
    weight,
    style: 'normal' as const,
    display: 'swap' as const,
    ...(fallbacks ? { fallbacks } : {}),
  }
}

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
  modules: ['@nuxt/image', '@nuxtjs/seo', '@peterbud/nuxt-query', '@pinia/nuxt', 'nuxt-viewport', 'shadcn-nuxt', '@nuxt/fonts', '@nuxtjs/color-mode'],
  // Light / dark / system. `classSuffix: ''` puts a plain `dark` class on <html>,
  // which is what the Tailwind `dark:` variant and the shadcn-vue tokens key on.
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'getalawyer-theme',
  },
  hooks: {
    // Pin every page that has not been rebuilt to light. The colour-mode module
    // reads `route.meta.colorMode` on the server and the client, so this is the
    // same as writing `definePageMeta({ colorMode: 'light' })` in each file.
    'pages:extend'(pages) {
      const pin = (list: typeof pages, parent = '') => {
        for (const page of list) {
          const path = page.path.startsWith('/') ? page.path : `${parent}/${page.path}`.replace(/\/+/g, '/')
          if (!THEMED_ROUTES.has(path)) {
            page.meta = { ...page.meta, colorMode: page.meta?.colorMode ?? 'light' }
          }
          if (page.children?.length) pin(page.children, path)
        }
      }
      pin(pages)
    },
  },
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
      // Canopy (marketing + sign-in) type: Bricolage Grotesque for display, Onest
      // for text. Both are OFL variable fonts committed in public/fonts, so the
      // build makes no font requests. Each family has two files: Latin, and
      // Latin Extended (which holds the naira sign). This @nuxt/fonts version
      // emits one face per manual family with no unicode-range, so the extended
      // file is its own family and sits next in the font stack; the browser only
      // fetches it for a character the Latin file lacks.
      localVariableFont('Bricolage Grotesque', 'BricolageGrotesque-Variable-latin.woff2', '200 800', ['Helvetica Neue', 'Arial', 'Segoe UI', 'Noto Sans']),
      localVariableFont('Bricolage Grotesque Ext', 'BricolageGrotesque-Variable-latin-ext.woff2', '200 800'),
      localVariableFont('Onest', 'Onest-Variable-latin.woff2', '100 900', ['Helvetica Neue', 'Arial', 'Segoe UI', 'Noto Sans']),
      localVariableFont('Onest Ext', 'Onest-Variable-latin-ext.woff2', '100 900'),
    ],
    // All web fonts are committed files; skip the remote providers' metadata fetches
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