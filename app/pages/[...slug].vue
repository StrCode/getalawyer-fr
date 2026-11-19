<script setup lang="ts">
/** Any address that is not a page: the "not found" panel inside the site, with a 404 status. */
definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Page not found',
  description: 'The page you are looking for does not exist. Find a verified Nigerian lawyer or go back to the homepage.',
  robots: 'noindex, nofollow',
})

setResponseStatus(404)
</script>

<template>
  <CanopyErrorPanel />
</template>
