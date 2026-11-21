<script setup lang="ts">
/**
 * Shown across the dashboard while a lawyer's membership is not on: says what
 * still works, what does not, and where to put it right. Hidden on the
 * membership page itself, which says the same thing in full.
 *
 * Used by both dashboard layouts (the new `workspace` and the older
 * `dashboard`), so it relies only on colour tokens both have.
 */
const route = useRoute()
const { readOnly, neverPaid } = useMembershipAccess()
const show = computed(() => readOnly.value && route.path !== '/dashboard/subscription')
</script>

<template>
  <aside
    v-if="show"
    role="status"
    class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-card border border-warning-border bg-warning-subtle px-4.5 py-3.5 text-warning-subtle-foreground"
  >
    <p class="min-w-0 grow basis-88 text-sm">
      <b class="font-medium">{{ neverPaid ? 'You do not have a membership yet.' : 'Your membership is not active.' }}</b>
      You can read and reply to your clients, but you cannot take new bookings or change your profile until {{ neverPaid ? 'you join' : 'you renew' }}.
    </p>
    <NuxtLink
      to="/dashboard/subscription"
      class="inline-flex min-h-11 flex-none items-center rounded-full bg-foreground px-4.75 text-sm font-medium text-background transition-opacity duration-200 hover:opacity-90"
    >
      {{ neverPaid ? 'Choose a plan' : 'Renew membership' }}
    </NuxtLink>
  </aside>
</template>
