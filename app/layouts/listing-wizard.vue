<script setup lang="ts">
const scrollContainer = ref<HTMLElement | null>(null)
const isScrolled = ref(false)

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  isScrolled.value = target.scrollTop > 5
}

const scrollOpts: AddEventListenerOptions = { passive: true }

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', handleScroll, scrollOpts)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll, scrollOpts)
})
</script>

<template>
  <div
    class="flex h-screen flex-col overflow-hidden bg-white font-sans selection:bg-primary-100 selection:text-primary-900"
  >
    <header
      class="z-30 flex shrink-0 items-center justify-between px-8 py-5 transition-all duration-200 md:px-12"
      :class="isScrolled ? 'border-b border-gray-100 bg-white/80 backdrop-blur-md' : ''"
    >
      <AppHeaderBrand variant="wordmark" />

      <div class="flex items-center gap-2">
        <Button variant="ghost" class="font-medium text-gray-600 hover:text-gray-900" as-child>
          <NuxtLink to="/dashboard"> Dashboard </NuxtLink>
        </Button>
      </div>
    </header>

    <main
      ref="scrollContainer"
      class="relative flex-1 overflow-y-auto border-t border-gray-50 bg-white"
    >
      <div
        class="relative z-10 mx-auto w-full max-w-4xl px-6 py-12 transition-all duration-300 sm:px-10 lg:px-12"
      >
        <slot />
      </div>
    </main>

    <!-- No step progress bar — slim footer only -->
    <footer
      class="z-40 shrink-0 border-t border-gray-100 bg-white pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.03)]"
    >
      <div class="mx-auto max-w-6xl px-6 py-5">
        <slot name="footer-note">
          <p class="text-center text-3 leading-snug text-gray-400 lg:mx-auto lg:max-w-md">
            By using Getalawyer you agree to our
            <a href="#" class="text-primary hover:underline">Terms of Use</a>
            and
            <a href="#" class="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </slot>
      </div>
    </footer>
    <Toaster position="top-right" />
  </div>
</template>
