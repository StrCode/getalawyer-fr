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
  <div class="flex h-screen flex-col overflow-hidden bg-background font-sans selection:bg-primary/15 selection:text-primary">
    <header
      class="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background px-4 py-4 transition-all duration-200 sm:px-8 sm:py-5 md:px-12"
      :class="isScrolled ? 'shadow-sm' : ''"
    >
      <AuthLogo class="min-w-0 shrink" />

      <Button
        variant="outline"
        class="h-10 shrink-0 rounded-full border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/60 sm:h-11 sm:px-5"
        as-child
      >
        <NuxtLink to="/">
          Home
        </NuxtLink>
      </Button>
    </header>

    <main
      ref="scrollContainer"
      class="relative flex-1 overflow-y-auto bg-brand-cream-warm"
    >
      <div class="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:px-12 lg:py-16">
        <slot />
      </div>
    </main>

    <footer class="z-40 shrink-0 border-t border-border/60 bg-background pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.04)]">
      <div class="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-12">
        <slot name="footer-note">
          <p class="text-center text-sm leading-snug text-muted-foreground">
            By using Getalawyer you agree to our
            <NuxtLink to="/terms" class="text-primary hover:underline">Terms of Use</NuxtLink>
            and
            <NuxtLink to="/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>.
          </p>
        </slot>
      </div>
    </footer>
    <Toaster position="top-right" />
  </div>
</template>
