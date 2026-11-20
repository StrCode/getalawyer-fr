<script setup lang="ts">
import { getSessionUserType } from '~/lib/session-user'

/**
 * The overview. One address, two pages while the dashboard is being rebuilt:
 * a lawyer gets the new overview on the `workspace` layout; a client still
 * gets the older one on the `dashboard` layout until theirs is rebuilt.
 *
 * The layout is chosen here (not in the page meta) because it depends on who
 * is signed in. The auth middleware has the session on the server too, so the
 * right layout is rendered from the first byte.
 */
definePageMeta({
  layout: false,
  middleware: [
    'auth',
    // The client's overview has not been rebuilt for dark mode: keep it light,
    // as every page that has not been rebuilt is (see THEMED_ROUTES).
    (to) => {
      const { session } = useAuth()
      if (getSessionUserType(session.value?.user) !== 'lawyer') to.meta.colorMode = 'light'
    },
  ],
})

const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))

useHead({ title: 'Overview' })
useSeoMeta({ description: 'Your getalawyer overview.', robots: 'noindex, nofollow' })
</script>

<template>
  <NuxtLayout v-if="role === 'lawyer'" name="workspace">
    <WorkspaceLawyerOverview />
  </NuxtLayout>
  <NuxtLayout v-else name="dashboard">
    <ClientDashboard v-if="role === 'client'" />
    <DashboardOverviewSkeleton v-else class="pb-12" />
  </NuxtLayout>
</template>
