<script setup lang="ts">
import LawyerDirectoryCommandPalette from '~/components/app/LawyerDirectoryCommandPalette.vue'
</script>

<template>
  <div>
    <slot />
    <ClientOnly>
      <LawyerDirectoryCommandPalette />
    </ClientOnly>
  </div>
</template>
