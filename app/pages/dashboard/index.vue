<script setup lang="ts">
import { getSessionUserType } from '~/lib/session-user'
import { Button } from '@/components/ui/button'

/**
 * The overview: one address, a different page for a lawyer and for a client.
 * Both are on the `workspace` layout, whose bars follow who is signed in.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

const { session, isPending } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user))
const { handleSignOut, isSigningOut } = useSignOut()

useHead({ title: 'Overview' })
useSeoMeta({ description: 'Your getalawyer overview.', robots: 'noindex, nofollow' })
</script>

<template>
  <WorkspaceLawyerOverview v-if="role === 'lawyer'" />
  <WorkspaceClientOverview v-else-if="role === 'client'" />
  <!-- the session is still arriving -->
  <LoadingOverview v-else-if="isPending || !session" />
  <!-- a staff account (admin, reviewer): this dashboard has nothing for it -->
  <section v-else aria-labelledby="staff-title" class="rounded-panel border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center max-sm:rounded-2xl">
    <h1 id="staff-title" class="font-display text-xl leading-none font-normal tracking-tight">This dashboard is for lawyers and clients.</h1>
    <p class="mx-auto mt-2 max-w-136 text-muted-foreground">
      You are signed in with a staff account. Applications, lawyers and payments are managed in the admin site. To use this one, sign in as a lawyer or a client.
    </p>
    <Button variant="line" size="pill" class="mt-5" :disabled="isSigningOut" :aria-busy="isSigningOut" @click="() => handleSignOut('login')">
      {{ isSigningOut ? 'Signing out…' : 'Sign out' }}
    </Button>
  </section>
</template>
