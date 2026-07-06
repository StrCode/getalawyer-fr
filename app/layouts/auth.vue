<script setup lang="ts">
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
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

</script>

<template>
  <div class="flex min-h-dvh w-full overflow-hidden bg-background">
    <!-- LEFT PANEL: Ink editorial -->
    <aside
      class="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-[url('/auth-login-bg.jpg')] bg-cover bg-center px-10 py-10 text-background lg:flex lg:w-[40%]"
    >
      <div class="pointer-events-none absolute inset-0 bg-black/60" />

      <div class="relative z-10 drop-shadow-md">
        <LandingBrandLogo
          to="/"
          on-dark
          class="text-background"
        />
      </div>

      <div class="relative z-10 flex w-full max-w-xl flex-1 flex-col justify-center py-10">
        <p class="mb-4 text-sm text-background/50">
          Verified legal representation
        </p>
       <h2 class="text-4xl font-medium leading-[1.05] tracking-[-0.025em] lg:text-[2.75rem] xl:text-5xl">
          {{ authTitle }}
        </h2>
        <p class="mt-6 max-w-md text-base leading-relaxed text-background/65 lg:text-lg">
          {{ authDescription }}
        </p>

      </div>
    </aside>

    <!-- RIGHT PANEL: Form -->
    <main
      class="relative flex min-h-dvh w-full flex-1 flex-col overflow-y-auto bg-background lg:w-[60%]"
    >
      <div class="absolute left-6 right-6 top-6 z-10 flex justify-between sm:left-8 sm:right-8 sm:top-8">
        <!-- Removed Back to website link -->
      </div>

      <div class="flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-16 sm:px-10 lg:px-14 lg:py-14 xl:px-16">
        <div class="relative z-10 w-full max-w-md">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
