<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { deriveClientLawyers } from '~/lib/client-derived-lawyers'

/**
 * The lawyers a client already has: everyone they have booked with or
 * messaged, most recent first. From here they message a lawyer or book again.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

useHead({ title: 'My lawyers' })
useSeoMeta({ description: 'Lawyers you have booked or messaged.', robots: 'noindex, nofollow' })

const { session } = useAuth()
const userId = computed(() => session.value?.user.id ?? null)

const { useClientBookings } = useBookings()
const { data: bookings, isPending: bookingsPending, isError: bookingsFailed, refetch: refetchBookings } = useClientBookings()

const { useConversations } = useMessaging()
const { data: conversations, isPending: conversationsPending, isError: conversationsFailed, refetch: refetchConversations } = useConversations()

const lawyers = computed(() => deriveClientLawyers(bookings.value ?? [], conversations.value ?? [], userId.value))
const loading = computed(() => bookingsPending.value || conversationsPending.value)
// One source failing still leaves the lawyers known through the other; only both failing is an error.
const failed = computed(() => bookingsFailed.value && conversationsFailed.value)

function reload() {
  void refetchBookings()
  void refetchConversations()
}

const summary = computed(() => {
  const count = lawyers.value.length
  if (count === 0) return 'Lawyers you book with or message show here.'
  return count === 1 ? 'One lawyer you have booked or messaged.' : `${count} lawyers you have booked or messaged, most recent first.`
})
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-[clamp(1.25rem,2.4vw,2rem)]">
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div class="min-w-0">
        <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">Your lawyers</p>
        <h1 class="mt-[0.6rem] text-[clamp(1.6rem,2.6vw,2rem)] leading-[1.03] font-[620] tracking-[-0.04em]">My lawyers</h1>
        <p class="mt-[0.6rem] text-[1.05rem] text-muted-foreground">{{ loading ? 'Loading your lawyers…' : summary }}</p>
      </div>
      <Button as-child variant="canopy" size="pill">
        <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip /></NuxtLink>
      </Button>
    </header>

    <div v-if="loading" role="status" aria-label="Loading your lawyers" class="grid gap-[0.75rem] sm:grid-cols-2 tab:grid-cols-3">
      <div v-for="n in 3" :key="n" class="h-[9rem] animate-pulse rounded-card bg-muted" />
    </div>

    <section v-else-if="failed" class="rounded-card border border-border bg-card p-[clamp(1.5rem,4vw,3rem)] text-center">
      <h2 class="font-display text-[1.3rem] leading-[1.1] font-[650] tracking-[-0.03em]">We could not load your lawyers.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="reload">Try again</Button>
    </section>

    <section v-else-if="lawyers.length === 0" class="rounded-card border border-border bg-card px-[1.3rem] py-[clamp(1.8rem,4vw,3rem)] text-center">
      <h2 class="font-display text-[1.3rem] leading-[1.1] font-[650] tracking-[-0.03em]">No lawyers yet.</h2>
      <p class="mx-auto mt-2 max-w-[32rem] text-muted-foreground">Once you book a consultation or message a lawyer, they show here so you can reach them again quickly.</p>
      <Button as-child variant="line" size="pill-sm" class="mt-[1rem]"><NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink></Button>
    </section>

    <div v-else class="grid gap-[0.75rem] sm:grid-cols-2 tab:grid-cols-3">
      <WorkspaceLawyerContactCard v-for="lawyer in lawyers" :key="lawyer.userId ?? lawyer.lawyerProfileId ?? lawyer.name" :lawyer="lawyer" />
    </div>
  </div>
</template>
