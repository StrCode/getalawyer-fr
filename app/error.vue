<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => (props.error?.statusCode ?? props.error?.status) === 404)

useHead({
  title: computed(() =>
    isNotFound.value ? 'Page not found — getalawyer' : 'Something went wrong — getalawyer',
  ),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

function clearAndGo(path: string) {
  clearError({ redirect: path })
}
</script>

<template>
  <!-- Same shell as layouts/blank.vue — error.vue cannot use definePageMeta(layout) -->
  <div class="min-h-dvh bg-brand-cream font-sans text-brand-ink antialiased">
    <ErrorNotFoundContent v-if="isNotFound" />

    <section
      v-else
      class="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
    >
      <header class="absolute left-6 top-8 md:left-8 md:top-10">
        <LandingBrandLogo />
      </header>

      <div class="relative z-10 mx-auto max-w-md">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <PhIcon name="warning-circle" class="h-8 w-8" />
        </div>
        <h1 class="font-heading text-3xl font-medium tracking-tight text-brand-green-900">
          Something went wrong
        </h1>
        <p class="mt-3 text-brand-ink-soft">
          {{ error.statusMessage || error.message || 'An unexpected error occurred. Please try again.' }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-brand-green-700 px-6 py-3 font-sans text-sm font-semibold text-brand-cream transition-colors hover:bg-brand-green-900"
            @click="clearAndGo('/')"
          >
            Go home
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-brand-line bg-white px-6 py-3 font-sans text-sm font-medium text-brand-ink transition-colors hover:bg-brand-cream-warm"
            @click="clearError()"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
