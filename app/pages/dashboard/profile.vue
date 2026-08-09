<template>
  <div
    v-if="authPending"
    class="space-y-4"
  >
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

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { session, isPending: authPending } = useAuth()
const isLawyer = computed(() => getSessionUserType(session.value?.user) === 'lawyer')
const isClient = computed(() => getSessionUserType(session.value?.user) === 'client')

useHead(() => ({
  title: isLawyer.value ? 'Listing - GetALawyer' : 'Profile - GetALawyer',
  meta: [
    {
      name: 'description',
      content: isLawyer.value
        ? 'Edit your public directory listing'
        : 'Manage your profile and contact details',
    },
  ],
}))
</script>
