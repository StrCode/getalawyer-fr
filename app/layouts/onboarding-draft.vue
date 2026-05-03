<script setup lang="ts">
</script>

<template>
  <AppLayout>
    <AppHeader show-brand-name hide-navigation hide-header-actions />
    <slot />
    <ClientOnly>
      <AuthModal />
    </ClientOnly>
  </AppLayout>
</template>
