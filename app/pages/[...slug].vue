<script setup lang="ts">
definePageMeta({ layout: 'blank' })

useSeoMeta({
  title: 'Page not found — getalawyer',
  description: 'The page you’re looking for doesn’t exist. Find verified Nigerian lawyers or return to the homepage.',
  robots: 'noindex, nofollow',
})

setResponseStatus(404)
</script>

<template>
  <ErrorNotFoundContent />
</template>
