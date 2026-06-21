<template>
  <div class="flex min-h-dvh w-full overflow-hidden bg-canvas">
    <!-- LEFT PANEL: Ink editorial -->
    <aside
      class="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-ink px-10 py-10 text-ink-foreground lg:flex lg:w-1/2"
    >
      <div class="relative z-10">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5 text-ink-foreground no-underline">
          <span class="flex size-9 items-center justify-center rounded-xl bg-white/6 ring-1 ring-white/10">
            <svg class="size-5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <polygon points="0,20 38,42 38,82 0,60" fill="currentColor" />
              <polygon points="62,42 100,20 100,60 62,82" fill="currentColor" opacity="0.55" />
            </svg>
          </span>
          <span class="font-heading text-xl font-semibold lowercase tracking-tight">getalawyer</span>
        </NuxtLink>
      </div>

      <div class="relative z-10 flex w-full max-w-xl flex-1 flex-col justify-center py-10">
        <p class="text-eyebrow mb-5 text-brass">Verified legal representation</p>
        <h2 class="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] lg:text-5xl">
          {{ authTitle }}
        </h2>
        <p class="mt-6 max-w-md text-base leading-relaxed text-ink-foreground/65 lg:text-lg">
          {{ authDescription }}
        </p>
      </div>

      <div class="relative z-10 flex w-full flex-col gap-4 border-t border-ink-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="mb-1 text-sm font-semibold text-ink-foreground">
            Take GetaLawyer with you
          </p>
          <p class="text-sm leading-relaxed text-ink-foreground/60">
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
      class="relative flex min-h-dvh w-full flex-1 flex-col overflow-y-auto bg-canvas lg:w-1/2 lg:border-l lg:border-border"
    >
      <div class="absolute left-6 right-6 top-6 z-10 flex justify-between sm:left-auto sm:right-8 sm:top-8 sm:justify-end">
        <NuxtLink
          to="/"
          class="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span class="transition-transform duration-300 lg:-translate-x-1 lg:group-hover:translate-x-0">←</span>
          <span class="lg:hidden">Back</span>
          <span class="hidden lg:inline">Back to website</span>
        </NuxtLink>
      </div>

      <div class="flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-16 sm:px-10 lg:px-14 lg:py-14 xl:px-16">
        <div
          class="relative z-10 w-full"
          :class="authWide ? 'max-w-2xl' : 'max-w-md'"
        >
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

const authWide = computed(() => route.meta.authWide === true)
</script>
