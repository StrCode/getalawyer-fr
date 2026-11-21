<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { ClientLawyerContact } from '~/lib/client-derived-lawyers'
import { initials, lawyerTie } from '~/lib/client-overview'

/**
 * A lawyer the client already has (booked with or messaged): who they are,
 * what ties them to the client, and the two things to do next. Shown on the
 * client's overview and on My lawyers.
 *
 * A lawyer known only through messages has no profile id here, so there is no
 * profile link or Book button for them, only Message.
 */
defineProps<{ lawyer: ClientLawyerContact }>()
</script>

<template>
  <article class="flex flex-col rounded-card border border-border bg-card p-4.5 lg:p-5 xl:p-5.5">
    <div class="flex items-center gap-3.25">
      <span class="grid size-12 flex-none place-items-center overflow-hidden rounded-lg bg-mint font-display font-medium text-deep">
        <img v-if="lawyer.image" :src="lawyer.image" alt="" class="size-full object-cover">
        <template v-else>{{ initials(lawyer.name) }}</template>
      </span>
      <span class="min-w-0">
        <NuxtLink
          v-if="lawyer.lawyerProfileId"
          :to="`/lawyers/${lawyer.lawyerProfileId}`"
          class="block truncate font-display text-base font-normal tracking-tight transition-colors hover:text-brand"
        >{{ lawyer.name }}</NuxtLink>
        <b v-else class="block truncate font-display text-base font-normal tracking-tight">{{ lawyer.name }}</b>
        <span class="block text-sm text-muted-foreground">{{ lawyerTie(lawyer) }}</span>
      </span>
    </div>
    <div class="mt-auto flex gap-1.5 pt-3.5">
      <Button v-if="lawyer.conversationId" as-child variant="line" size="pill-sm" class="flex-1">
        <NuxtLink :to="`/dashboard/messages?conversation=${lawyer.conversationId}`">Message</NuxtLink>
      </Button>
      <Button v-if="lawyer.lawyerProfileId" as-child variant="canopy" size="pill-sm" class="flex-1 shadow-none hover:translate-y-0">
        <NuxtLink :to="`/lawyers/${lawyer.lawyerProfileId}/book`">{{ lawyer.bookingCount ? 'Book again' : 'Book' }}</NuxtLink>
      </Button>
    </div>
  </article>
</template>
