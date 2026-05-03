<script setup lang="ts">
/**
 * Canonical directory listing moved to `/find-lawyers`.
 * Keeps `/lawyers` bookmarks and external links working.
 */
const route = useRoute()

await navigateTo(
  { path: '/find-lawyers', query: route.query, hash: route.hash },
  { replace: true },
)
</script>

<template>
  <div class="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
    Redirecting…
  </div>
</template>
