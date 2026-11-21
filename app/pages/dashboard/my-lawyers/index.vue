<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
useSeoMeta({ description: 'Lawyers you have booked or messaged.' })

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
  <div class="grid grid-cols-1 gap-5 lg:gap-6.25 xl:gap-7.75">
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div class="min-w-0">
        <p class="text-xs font-medium tracking-widest text-brand uppercase">Your lawyers</p>
        <h1 class="mt-2.5 text-2xl md:text-3xl leading-none font-normal tracking-tighter">My lawyers</h1>
        <p class="mt-2.5 text-base text-muted-foreground">{{ loading ? 'Loading your lawyers…' : summary }}</p>
      </div>
      <Button as-child variant="canopy" size="pill">
        <NuxtLink to="/find-lawyers">Find a lawyer<CanopyArrowChip /></NuxtLink>
      </Button>
    </header>

    <LoadingRegion v-if="loading" label="Loading your lawyers" class="grid grid-cols-1 gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <div v-for="n in 3" :key="n" class="flex flex-col rounded-card border border-border bg-card p-4.5 lg:p-5 xl:p-5.5">
        <div class="flex items-center gap-3.25">
          <Skeleton class="size-12 flex-none rounded-lg" />
          <div class="min-w-0 grow">
            <LoadingLine class="w-32" />
            <LoadingLine size="sm" class="w-40" />
          </div>
        </div>
        <div class="flex gap-1.5 pt-3.5">
          <Skeleton class="h-11 flex-1 rounded-full" />
          <Skeleton class="h-11 flex-1 rounded-full" />
        </div>
      </div>
    </LoadingRegion>

    <section v-else-if="failed" class="rounded-card border border-border bg-card p-6 md:p-7.75 lg:p-10.25 xl:p-12 text-center">
      <h2 class="font-display text-xl leading-none font-normal tracking-tight">We could not load your lawyers.</h2>
      <p class="mt-2 text-muted-foreground">Nothing has changed. Check your connection and try again.</p>
      <Button variant="canopy" size="pill" class="mt-5" @click="reload">Try again</Button>
    </section>

    <section v-else-if="lawyers.length === 0" class="rounded-card border border-border bg-card px-5.25 py-7.25 md:py-7.75 lg:py-10.25 xl:py-12 text-center">
      <h2 class="font-display text-xl leading-none font-normal tracking-tight">No lawyers yet.</h2>
      <p class="mx-auto mt-2 max-w-128 text-muted-foreground">Once you book a consultation or message a lawyer, they show here so you can reach them again quickly.</p>
      <Button as-child variant="line" size="pill-sm" class="mt-4"><NuxtLink to="/find-lawyers">Find a lawyer</NuxtLink></Button>
    </section>

    <div v-else class="grid gap-3 sm:grid-cols-2 tab:grid-cols-3">
      <WorkspaceLawyerContactCard v-for="lawyer in lawyers" :key="lawyer.userId ?? lawyer.lawyerProfileId ?? lawyer.name" :lawyer="lawyer" />
    </div>
  </div>
</template>
