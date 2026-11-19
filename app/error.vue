<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Shown when a page throws or an address cannot be resolved. It uses the site
 * layout, so the header, menu and footer are all there to move on with (Nuxt
 * clears the error on the next navigation). Addresses that simply do not exist
 * are served by pages/[...slug].vue, which shows the same panel.
 */
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => (props.error?.statusCode ?? props.error?.status) === 404)

useHead({
  title: () => (isNotFound.value ? 'Page not found' : 'Something went wrong'),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <NuxtLayout name="site">
    <CanopyErrorPanel
      :kind="isNotFound ? 'missing' : 'failed'"
      :message="error.statusMessage"
      @retry="clearError()"
    />
  </NuxtLayout>
</template>
