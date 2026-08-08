<script setup lang="ts">
import type { ClientLawyerContact } from '~/lib/client-derived-lawyers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  lawyers: ClientLawyerContact[]
}>()

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <Card
      v-for="lawyer in lawyers"
      :key="lawyer.lawyerProfileId ?? lawyer.userId ?? lawyer.name"
      class="py-0"
    >
      <CardContent class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <Avatar class="size-12 shrink-0">
            <AvatarImage
              v-if="lawyer.image"
              :src="lawyer.image"
              :alt="lawyer.name"
            />
            <AvatarFallback class="bg-primary/10 text-primary">
              {{ initials(lawyer.name) }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <p class="font-medium text-foreground">
              {{ lawyer.name }}
            </p>
            <p class="text-sm text-muted-foreground">
              <template v-if="lawyer.bookingCount > 0">
                {{ lawyer.bookingCount }} {{ lawyer.bookingCount === 1 ? 'consultation' : 'consultations' }}
              </template>
              <template v-else>
                Messaged on GetALawyer
              </template>
              <template v-if="formatWhen(lawyer.lastInteractionAt)">
                · Last contact {{ formatWhen(lawyer.lastInteractionAt) }}
              </template>
            </p>
            <Badge
              v-if="lawyer.hasActiveCase"
              variant="verified"
              class="mt-2"
            >
              Active case
            </Badge>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            v-if="lawyer.lawyerProfileId"
            as-child
            size="sm"
            variant="outline"
            class="cursor-pointer"
          >
            <NuxtLink :to="`/lawyers/${lawyer.lawyerProfileId}`">
              View profile
            </NuxtLink>
          </Button>
          <Button
            v-if="lawyer.lawyerProfileId"
            as-child
            size="sm"
            class="cursor-pointer"
          >
<NuxtLink :to="`/lawyers/${lawyer.lawyerProfileId}/book`">
              Book again
            </NuxtLink>
          </Button>
          <Button
            v-if="lawyer.conversationId"
            as-child
            size="sm"
            variant="outline"
            class="cursor-pointer"
          >
            <NuxtLink :to="`/dashboard/messages?conversation=${lawyer.conversationId}`">
              Message
            </NuxtLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
