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
    class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[1.25rem] border border-warning-border bg-warning-subtle px-[1.1rem] py-[0.9rem] text-warning-subtle-foreground"
  >
    <p class="min-w-0 flex-[1_1_22rem] text-[0.98rem]">
      <b class="font-semibold">{{ neverPaid ? 'You do not have a membership yet.' : 'Your membership is not active.' }}</b>
      You can read and reply to your clients, but you cannot take new bookings or change your profile until {{ neverPaid ? 'you join' : 'you renew' }}.
    </p>
    <NuxtLink
      to="/dashboard/subscription"
      class="inline-flex min-h-11 flex-none items-center rounded-full bg-foreground px-[1.2rem] text-[0.95rem] font-semibold text-background transition-opacity duration-200 hover:opacity-90"
    >
      {{ neverPaid ? 'Choose a plan' : 'Renew membership' }}
    </NuxtLink>
  </aside>
</template>
