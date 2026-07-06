<script setup lang="ts">
/**
 * Sonner host — import `toast` from `vue-sonner` anywhere. @see https://shadcn-vue.com/docs/components/sonner
 * Styles: `vue-sonner/style.css` in `assets/css/main.css`
 */
import { Toaster } from '~/components/ui/sonner'

const route = useRoute()

/** 
 * Dashboard: instant switches (no lag for heavy web apps). 
 * Rest of app keeps the smooth default page transition. 
 */
const pageTransition = computed(() =>
  route.path.startsWith('/dashboard') ? false : { name: 'page', mode: 'out-in' },
)



</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
  <ClientOnly>
    <Toaster position="top-right" />
  </ClientOnly>
</template>

