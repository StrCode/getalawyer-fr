<script setup lang="ts">
import type { ClientLawyerContact } from '~/lib/client-derived-lawyers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { PANEL_LINK, PANEL_LINK_ARROW } from '@/lib/dashboard-panel'

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
  <DashboardPanel
    label="My lawyers"
    meta="People you have consulted or messaged"
  >
    <template #headerMeta>
      <NuxtLink
        to="/dashboard/my-lawyers"
        :class="PANEL_LINK"
      >
        View all<span
          :class="PANEL_LINK_ARROW"
          aria-hidden="true"
        >→</span>
      </NuxtLink>
    </template>

    <ul class="divide-y divide-foreground/15">
      <li
        v-for="lawyer in previewLawyers"
        :key="lawyer.lawyerProfileId ?? lawyer.userId ?? lawyer.name"
        class="flex items-center gap-3 px-6 py-3.5"
      >
        <Avatar class="size-9 shrink-0">
          <AvatarImage
            v-if="lawyer.image"
            :src="lawyer.image"
            :alt="lawyer.name"
          />
          <AvatarFallback class="bg-primary/10 text-sm text-primary">
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
      </li>
    </ul>
  </DashboardPanel>
</template>
