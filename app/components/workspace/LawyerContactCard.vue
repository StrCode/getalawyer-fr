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
  <article class="flex flex-col rounded-card border border-border bg-card p-[clamp(1.1rem,2vw,1.35rem)]">
    <div class="flex items-center gap-[0.8rem]">
      <span class="grid size-[3rem] flex-none place-items-center overflow-hidden rounded-[1rem] bg-mint font-display font-bold text-deep">
        <img v-if="lawyer.image" :src="lawyer.image" alt="" class="size-full object-cover">
        <template v-else>{{ initials(lawyer.name) }}</template>
      </span>
      <span class="min-w-0">
        <NuxtLink
          v-if="lawyer.lawyerProfileId"
          :to="`/lawyers/${lawyer.lawyerProfileId}`"
          class="block truncate font-display text-[1.1rem] font-[650] tracking-[-0.02em] transition-colors hover:text-brand"
        >{{ lawyer.name }}</NuxtLink>
        <b v-else class="block truncate font-display text-[1.1rem] font-[650] tracking-[-0.02em]">{{ lawyer.name }}</b>
        <span class="block text-[0.9rem] text-muted-foreground">{{ lawyerTie(lawyer) }}</span>
      </span>
    </div>
    <div class="mt-auto flex gap-[0.4rem] pt-[0.9rem]">
      <Button v-if="lawyer.conversationId" as-child variant="line" size="pill-sm" class="flex-1">
        <NuxtLink :to="`/dashboard/messages?conversation=${lawyer.conversationId}`">Message</NuxtLink>
      </Button>
      <Button v-if="lawyer.lawyerProfileId" as-child variant="canopy" size="pill-sm" class="flex-1 shadow-none hover:translate-y-0">
        <NuxtLink :to="`/lawyers/${lawyer.lawyerProfileId}/book`">{{ lawyer.bookingCount ? 'Book again' : 'Book' }}</NuxtLink>
      </Button>
    </div>
  </article>
</template>
