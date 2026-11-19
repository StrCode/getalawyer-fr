<script setup lang="ts">
import { WELCOME_HOME } from '~/lib/setup-paths'

/** `/welcome` has no screen of its own: it opens the first welcome step. */
definePageMeta({ middleware: ['auth'] })

await navigateTo(WELCOME_HOME, { replace: true })
</script>

<template>
  <div />
</template>
