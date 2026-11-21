<template>
  <div v-if="authPending" role="status" aria-label="Loading your profile" class="grid gap-4 lg:gap-5 xl:gap-6">
    <div class="h-36 animate-pulse rounded-card bg-muted" />
    <div class="h-64 animate-pulse rounded-card bg-muted" />
  </div>

  <LawyerProfileEditorShell v-else-if="isLawyer" />

  <ClientProfileEditorShell v-else-if="isClient" />
</template>

<script setup lang="ts">
import ClientProfileEditorShell from '@/components/profile/ClientProfileEditorShell.vue'
import LawyerProfileEditorShell from '@/components/profile/LawyerProfileEditorShell.vue'
import { getSessionUserType } from '~/lib/session-user'

definePageMeta({
  layout: 'workspace',
  middleware: 'auth',
})

const { session, isPending: authPending } = useAuth()
const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')
const isClient = computed(() => getSessionUserType(session.value?.user) === 'client')

useHead(() => ({
  title: 'Your profile',
  meta: [
    {
      name: 'description',
      content: isLawyer.value
        ? 'Edit your public profile'
        : 'Manage your profile and contact details',
    },
  ],
}))
</script>
