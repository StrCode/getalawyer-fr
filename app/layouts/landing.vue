<script setup lang="ts">
const route = useRoute()
const showFooter = computed(() => route.meta.landingFooter !== false)
</script>

<template>
  <AppLayout>
    <div class="bg-background font-sans text-foreground antialiased">
      <LandingNav />
      <main>
        <slot />
      </main>
      <LandingFooter v-if="showFooter" />
    </div>
  </AppLayout>
</template>
