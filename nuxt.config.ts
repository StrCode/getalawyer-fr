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
const THEMED_ROUTES = new Set<string>([
  '/',
  '/find-lawyers',
  '/lawyers/:id()',
  '/lawyers/:id()/book',
  '/pricing',
  '/for-lawyers',
  '/practice-areas',
  '/contact',
  '/privacy',
  '/terms',
  '/ndpa',
  // dashboard pages rebuilt on the `workspace` layout
  // the overview, for lawyers and for clients
  '/dashboard',
  '/dashboard/appointments',
  '/dashboard/appointments/:id()',
  '/dashboard/bookings',
  '/dashboard/bookings/:id()',
  '/dashboard/bookings/:id()/reschedule',
  '/dashboard/my-lawyers',
  '/dashboard/cases',
  '/dashboard/cases/:id()',
  '/dashboard/messages',
  '/dashboard/notifications',
  '/dashboard/settings',
  '/dashboard/availability',
  '/dashboard/consultation-types',
  '/dashboard/profile',
  '/dashboard/subscription',
  '/dashboard/subscription/receipts/:id()',
  // sign-in group (the `auth` layout)
  '/login',
  '/register',
  '/forgot-password',
  '/verify-otp',
  '/reset-password',
  // any address that is not a page (pages/[...slug].vue)
  '/:slug(.*)*',
  // a client's welcome steps (the `welcome` layout)
  '/welcome/location',
  '/welcome/legal-needs',
  // a lawyer's application (the `application` layout)
  '/application',
  '/application/about-you',
  '/application/identity',
  '/application/bar-credentials',
  '/application/practice',
  '/application/membership',
  // back from Paystack (the `focus` layout)
  '/verify-payment',
])

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
      '/application',
      '/application/**',
      '/welcome/**',
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
      link: [
        // The mark as a vector; the .ico is for browsers that do not take SVG icons.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', sizes: '64x64', href: '/favicon.ico' },
      ],
    },
    // Enter-only fades (see the `.page-enter-*` rules): no `out-in`, so a new
    // page never waits for the old one to fade away first.
    pageTransition: { name: 'page' },
    layoutTransition: { name: 'layout' },
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
    // The families are named once, in main.css (`--font-sans`, `--font-display`).
    // Nuxt Fonts finds them there, downloads them from Google Fonts at build
    // time and serves them from this site, with fallback metrics. Both are
    // variable fonts; latin-ext carries the naira sign. Builds need to reach
    // Google Fonts.
    families: [
      { name: 'Onest', provider: 'google', weights: ['100 900'] },
      { name: 'Mona Sans', provider: 'google', weights: ['200 900'] },
    ],
    providers: {
      googleicons: false,
      bunny: false,
      fontsource: false,
      fontshare: false,
      adobe: false,
    },
    defaults: {
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
  },
  runtimeConfig: {
    public: {
      apiUrl,
      betterAuthUrl,
    },
  },
})