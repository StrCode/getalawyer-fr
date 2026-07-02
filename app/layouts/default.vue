<script setup lang="ts">
</script>

<template>
  <AppLayout>
    <div class="font-sans text-foreground bg-background antialiased">
      <LandingNav />
      <main>
        <slot />
      </main>
    </div>
  </AppLayout>
</template>
