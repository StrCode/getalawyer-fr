<script setup lang="ts">
import { getSessionUserType } from '~/lib/session-user'

/**
 * The overview: one address, a different page for a lawyer and for a client.
 * Both are on the `workspace` layout, whose bars follow who is signed in.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))

useHead({ title: 'Overview' })
useSeoMeta({ description: 'Your getalawyer overview.', robots: 'noindex, nofollow' })
</script>

<template>
  <WorkspaceLawyerOverview v-if="role === 'lawyer'" />
  <WorkspaceClientOverview v-else-if="role === 'client'" />
  <!-- neither (an admin account, or a session still arriving): nothing to show yet -->
  <div v-else role="status" aria-label="Loading your overview" class="h-88 animate-pulse rounded-panel bg-muted max-sm:rounded-2xl" />
</template>
