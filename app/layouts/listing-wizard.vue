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
        class="h-10 shrink-0 border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/60 sm:h-11 sm:px-5"
        as-child
      >
        <NuxtLink to="/">
          Home
        </NuxtLink>
      </Button>
    </header>

    <main
      ref="scrollContainer"
      class="relative flex-1 overflow-y-auto bg-card"
    >
      <div class="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:px-12 lg:py-16">
        <slot />
      </div>
    </main>

    <footer class="z-40 shrink-0 border-t border-border/40 bg-background pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sm">
      <div class="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-12">
        <slot name="footer-note">
          <p class="text-center text-sm leading-snug text-muted-foreground">
            By using Getalawyer you agree to our Terms of Use and Privacy Policy.
          </p>
        </slot>
      </div>
    </footer>
    <Toaster position="top-right" />
  </div>
</template>
