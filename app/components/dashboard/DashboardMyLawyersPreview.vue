<script setup lang="ts">
import type { ClientLawyerContact } from '~/lib/client-derived-lawyers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const props = defineProps<{
  lawyers: ClientLawyerContact[]
}>()

const previewLawyers = computed(() => props.lawyers.slice(0, 4))

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <Card class="py-0 shadow-xs">
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/40 px-4 py-4">
      <div>
        <span class="micro-label text-muted-foreground">
          My lawyers
        </span>
        <p class="mt-0.5 text-xs text-muted-foreground">
          People you have consulted or messaged
        </p>
      </div>
      <NuxtLink to="/dashboard/my-lawyers" class="group shrink-0 text-xs font-medium text-primary">View all<span class="ml-1 inline-block transition-transform duration-200 ease-luxe group-hover:translate-x-0.5" aria-hidden="true">→</span></NuxtLink>
    </CardHeader>

    <CardContent class="divide-y divide-border p-0">
      <div
        v-for="lawyer in previewLawyers"
        :key="lawyer.lawyerProfileId ?? lawyer.userId ?? lawyer.name"
        class="flex items-center gap-3 px-4 py-3"
      >
        <Avatar class="size-10 shrink-0">
          <AvatarImage
            v-if="lawyer.image"
            :src="lawyer.image"
            :alt="lawyer.name"
          />
          <AvatarFallback class="bg-primary/10 text-primary text-sm">
            {{ initials(lawyer.name) }}
          </AvatarFallback>
        </Avatar>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground">
            {{ lawyer.name }}
          </p>
          <p class="text-xs text-muted-foreground">
            <template v-if="lawyer.bookingCount > 0">
              {{ lawyer.bookingCount }} {{ lawyer.bookingCount === 1 ? 'booking' : 'bookings' }}
            </template>
            <template v-else>
              Messaged
            </template>
          </p>
        </div>

        <Badge
          v-if="lawyer.hasActiveCase"
          variant="verified"
          class="shrink-0"
        >
          Active case
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>
