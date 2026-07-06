<script setup lang="ts">
import { ArrowLeft01Icon, Calendar01Icon, CheckmarkBadge01Icon, SecurityCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
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

const trustPoints = [
  { icon: CheckmarkBadge01Icon, label: 'Every lawyer NIN & SCN verified' },
  { icon: Calendar01Icon, label: 'Book consultations in minutes' },
  { icon: SecurityCheckIcon, label: 'Secure, encrypted sign-in' },
] as const
</script>

<template>
  <div class="flex min-h-dvh w-full overflow-hidden bg-background">
    <!-- LEFT PANEL: Ink editorial -->
    <aside
      class="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-foreground px-10 py-10 text-background lg:flex lg:w-[44%] xl:w-1/2"
    >
      <div class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/5" />

      <div class="relative z-10">
        <LandingBrandLogo
          to="/"
          on-dark
          class="text-background"
        />
      </div>

      <div class="relative z-10 flex w-full max-w-xl flex-1 flex-col justify-center py-10">
        <p class="text-xs font-semibold uppercase tracking-widest mb-5 text-primary">
          Verified legal representation
        </p>
        <h2 class="font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.025em] lg:text-[2.75rem] xl:text-5xl">
          {{ authTitle }}
        </h2>
        <p class="mt-6 max-w-md text-base leading-relaxed text-background/65 lg:text-lg">
          {{ authDescription }}
        </p>

        <ul class="mt-10 space-y-4">
          <li
            v-for="point in trustPoints"
            :key="point.label"
            class="flex items-center gap-3 text-sm text-background/75"
          >
            <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/6 ring-1 ring-white/10">
              <HugeiconsIcon :icon="point.icon" class="size-4 text-primary" aria-hidden="true" />
            </span>
            {{ point.label }}
          </li>
        </ul>
      </div>

      <div class="relative z-10 flex w-full flex-col gap-4 border-t border-background/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="mb-1 text-sm font-semibold text-background">
            Take GetaLawyer with you
          </p>
          <p class="text-sm leading-relaxed text-background/60">
            Find verified lawyers on our mobile app for iOS and Android.
          </p>
        </div>
        <div class="shrink-0">
          <AuthQRCode />
        </div>
      </div>
    </aside>

    <!-- RIGHT PANEL: Form -->
    <main
      class="relative flex min-h-dvh w-full flex-1 flex-col overflow-y-auto bg-background lg:w-[56%] xl:w-1/2"
    >
      <div class="absolute left-6 right-6 top-6 z-10 flex justify-between sm:left-8 sm:right-8 sm:top-8">
        <NuxtLink
          to="/"
          class="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" class="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
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
