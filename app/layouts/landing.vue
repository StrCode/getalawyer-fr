<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const isScrolled = ref(false)
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 20
      ticking = false
    })
    ticking = true
  }
}
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div class="font-sans text-foreground bg-background antialiased">
    <LandingNav :is-scrolled="isScrolled" />
    <main>
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
