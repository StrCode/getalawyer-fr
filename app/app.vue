<script setup lang="ts">
/**
 * Sonner host — import `toast` from `vue-sonner` anywhere. @see https://shadcn-vue.com/docs/components/sonner
 * Styles: `vue-sonner/style.css` in `assets/css/main.css`
 */
import { Toaster } from '~/components/ui/sonner'

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,WONK@0,9..144,100..900,1;1,9..144,100..900,1&display=swap'
    }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster position="top-right" />
  </ClientOnly>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.23, 1, 0.32, 1),
    filter 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition-property: opacity;
    transition-duration: 0.12s;
  }

  .page-enter-from,
  .page-leave-to {
    filter: none;
  }
}
</style>
