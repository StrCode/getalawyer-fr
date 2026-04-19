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
    'shadcn-nuxt',
  ],
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
    defaults: {
      weights: [200, 300, 400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: [
        'cyrillic-ext',
        'cyrillic',
        'greek-ext',
        'greek',
        'vietnamese',
        'latin-ext',
        'latin',
      ]
    },
    families: [
      {
        name: 'Inter',
        provider: 'google',
        weights: [200, 300, 400, 500, 600, 700],
        styles: ['normal', 'italic'],
        subsets: ['latin'],
      },
      {
        name: 'Poppins',
        provider: 'google',
        weights: [200, 300, 400, 500, 600, 700],
        styles: ['normal', 'italic'],
        subsets: ['latin'],
      },
      {
        name: 'DM Sans',
        provider: 'google',
        weights: [400, 500, 700],
        styles: ['normal'],
        subsets: ['latin'],
      },

      {
        name: 'SuisseIntl',
        src: '/fonts/SuisseIntl-Regular.woff2',
        weight: '400',
        style: 'normal',
      },

      {
        name: 'SuisseIntl',
        src: '/fonts/SuisseIntl-Medium.woff2',
        weight: '500',
        style: 'normal',
      },
      {
        name: 'SuisseIntl',
        src: '/fonts/SuisseIntl-SemiBold.woff2',
        weight: '600',
        style: 'normal',
      },
      {
        name: 'SuisseIntl',
        src: '/fonts/SuisseIntl-Bold.woff2',
        weight: '700',
        style: 'normal',
      },
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