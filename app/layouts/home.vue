<script setup lang="ts">
</script>

<template>
  <AppLayout>
    <AppHeader show-brand-name />
    <slot />
    <ClientOnly>
      <AuthModal />
    </ClientOnly>
  </AppLayout>
</template>
