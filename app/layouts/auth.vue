<template>
  <div class="flex min-h-dvh w-full overflow-hidden bg-[oklch(0.98_0.008_85)]">
    <!-- LEFT PANEL: Rich Green Editorial -->
    <aside
      class="hidden lg:flex lg:w-1/2 flex-col min-h-dvh justify-between bg-brand-green-900 px-10 py-10 relative overflow-hidden text-brand-cream"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-brand-green-700/30 to-transparent mix-blend-overlay" />

      <div class="relative z-10">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5 no-underline text-brand-cream">
          <svg class="w-7 h-7 shrink-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,20 38,42 38,82 0,60" fill="currentColor"/>
            <polygon points="62,42 100,20 100,60 62,82" fill="currentColor" opacity="0.55"/>
          </svg>
          <span class="font-sans font-bold text-xl tracking-[-0.5px] lowercase text-brand-cream">getalawyer</span>
        </NuxtLink>
      </div>

      <div class="relative z-10 flex flex-col justify-center flex-1 w-full max-w-xl py-8">
        <h2 class="font-heading text-4xl lg:text-5xl font-medium leading-tight mb-6">
          {{ authTitle }}
        </h2>
        <p class="text-brand-cream-warm/80 text-lg leading-relaxed">
          {{ authDescription }}
        </p>
      </div>

      <div
        class="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-brand-green-700/50 w-full"
      >
        <div class="min-w-0">
          <p class="mb-1 font-semibold text-brand-cream text-sm">
            Take GetaLawyer with you
          </p>
          <p class="text-brand-cream/70 text-sm leading-relaxed">
            Find verified lawyers on our mobile app for iOS and Android.
          </p>
        </div>
        <div class="shrink-0">
          <AuthQRCode />
        </div>
      </div>
    </aside>

    <!-- RIGHT PANEL: Form — vertically centered -->
    <main
      class="relative flex flex-col flex-1 lg:w-1/2 w-full min-h-dvh overflow-y-auto bg-[oklch(0.98_0.008_85)] lg:border-l border-border"
    >
      <div
        class="pointer-events-none absolute inset-0 hidden lg:block"
        style="background: radial-gradient(circle at 50% 30%, rgba(134,194,142,0.04) 0%, transparent 55%);"
      />

      <div class="absolute top-6 left-6 right-6 sm:top-8 sm:left-auto sm:right-8 z-10 flex justify-between sm:justify-end">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          ← Back
        </NuxtLink>
        <NuxtLink
          to="/"
          class="hidden lg:inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span class="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">←</span>
          Back to website
        </NuxtLink>
      </div>

      <div class="flex flex-1 flex-col justify-center items-center px-6 sm:px-10 lg:px-14 xl:px-16 pt-14 pb-10 sm:pt-16 sm:pb-12 lg:py-14">
        <div class="w-full max-w-[420px] relative z-10">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()

const authTitle = computed(() => {
  return (route.meta.authTitle as string) || 'The most trusted way to find top-tier legal representation.'
})

const authDescription = computed(() => {
  return (route.meta.authDescription as string) || 'Join thousands of businesses and individuals connecting with verified legal professionals every day.'
})
</script>
