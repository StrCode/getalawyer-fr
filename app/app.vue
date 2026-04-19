<script setup lang="ts">
/**
 * Sonner host — import `toast` from `vue-sonner` anywhere. @see https://shadcn-vue.com/docs/components/sonner
 * Styles: `vue-sonner/style.css` in `assets/css/main.css`
 */
import { Toaster } from '~/components/ui/sonner'
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
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
