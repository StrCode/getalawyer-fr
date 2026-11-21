<script setup lang="ts">
/**
 * Sonner host — import `toast` from `vue-sonner` anywhere. @see https://shadcn-vue.com/docs/components/sonner
 * Styles: `vue-sonner/style.css` in `assets/css/main.css`
 */
import type { TransitionProps } from 'vue'
import { Toaster } from '~/components/ui/sonner'

const route = useRoute()

const pageTransition = computed<TransitionProps | false>(() =>
  route.path.startsWith('/dashboard') ? false : { name: 'page' },
)

// The site and its search, for search engines. The organisation behind it is
// `schemaOrg.identity` in nuxt.config; pages add their own nodes.
useSchemaOrg([
  defineWebSite({
    potentialAction: [
      defineSearchAction({ target: '/find-lawyers?keywords={search_term_string}' }),
    ],
  }),
])

</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
  <ClientOnly>
    <Toaster position="top-right" />
  </ClientOnly>
</template>

