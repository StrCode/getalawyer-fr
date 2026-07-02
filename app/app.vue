<script setup lang="ts">
/**
 * Sonner host — import `toast` from `vue-sonner` anywhere. @see https://shadcn-vue.com/docs/components/sonner
 * Styles: `vue-sonner/style.css` in `assets/css/main.css`
 */
import { Toaster } from '~/components/ui/sonner'

const route = useRoute()

/** Dashboard: instant switches (no blur/fade). Rest of app keeps the default page transition. */
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
