<template>
  <div v-if="authPending" class="mx-auto w-full max-w-5xl space-y-4">
    <Skeleton class="h-36 w-full rounded-xl" />
    <Skeleton class="h-64 w-full rounded-xl" />
  </div>

  <LawyerProfileEditorShell v-else-if="isLawyer" />

  <ClientProfileEditorShell v-else-if="isClient" />
</template>

<script setup lang="ts">
import ClientProfileEditorShell from '@/components/profile/ClientProfileEditorShell.vue'
import LawyerProfileEditorShell from '@/components/profile/LawyerProfileEditorShell.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { getSessionUserType } from '~/lib/session-user'

useHead({
  title: 'Profile - GetALawyer',
  meta: [
    { name: 'description', content: 'Manage your profile and contact details' },
  ],
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { session, isPending: authPending } = useAuth()
const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')
const isClient = computed(() => getSessionUserType(session.value?.user) === 'client')
</script>
