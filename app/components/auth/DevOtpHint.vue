<template>
  <p
    v-if="show"
    class="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-center text-xs text-amber-800 dark:text-amber-200"
  >
    Dev mode: check server console for the OTP code.
  </p>
</template>

<script setup lang="ts">
const show = computed(() => import.meta.dev);
</script>
