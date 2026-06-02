<script setup lang="ts">
/** Legacy Paystack callback path — forwards to verify-payment. */
const route = useRoute()

await navigateTo(
  {
    path: '/verify-payment',
    query: route.query,
  },
  { replace: true },
)
</script>

<template>
  <div class="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Redirecting…
  </div>
</template>
