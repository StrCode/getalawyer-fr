<script setup lang="ts">
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import ExceptionsPanel from '@/components/availability/ExceptionsPanel.vue'
import WeeklySchedulePanel from '@/components/availability/WeeklySchedulePanel.vue'
import type { LawyerAvailabilitySchedule } from '~/types/availability'

/**
 * When clients can book: the hours a lawyer works each week, and the dates
 * that differ (time off, or extra hours). The second tab is addressable as
 * `?tab=exceptions`.
 */
definePageMeta({
  layout: 'workspace',
  middleware: ['auth'],
})

type AvailabilityTab = 'weekly' | 'exceptions'

const route = useRoute()
const router = useRouter()

const activeTab = computed<AvailabilityTab>(() => (route.query.tab === 'exceptions' ? 'exceptions' : 'weekly'))

/** Deep-linkable tabs: `?tab=exceptions` selects the exceptions tab; the default tab keeps a clean URL. */
function handleTabChange(value: string | number) {
  const tab = value === 'exceptions' ? 'exceptions' : undefined
  if (tab === (route.query.tab === 'exceptions' ? 'exceptions' : undefined)) return
  const { tab: _omit, ...rest } = route.query
  router.replace({ query: tab ? { ...rest, tab } : rest })
}

useHead({ title: () => (activeTab.value === 'exceptions' ? 'Time off and extra hours' : 'Availability') })
useSeoMeta({ robots: 'noindex, nofollow' })

const { useAvailabilitySchedule } = useAvailability()
const { data: schedules, isPending } = useAvailabilitySchedule()

const availableDaysCount = computed(
  () => (schedules.value ?? []).filter((s: LawyerAvailabilitySchedule) => s.isAvailable).length,
)
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-[clamp(1.25rem,2.4vw,2rem)]">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Availability"
      description="The hours clients can book you each week, and the dates that are different."
    >
      <template #actions>
        <span
          v-if="!isPending"
          class="rounded-full px-[0.85rem] py-[0.3rem] text-[0.88rem] font-bold"
          :class="availableDaysCount > 0 ? 'bg-mint text-deep' : 'bg-muted text-foreground'"
        >{{ availableDaysCount === 0 ? 'No days open' : `${availableDaysCount} ${availableDaysCount === 1 ? 'day' : 'days'} open each week` }}</span>
      </template>
    </DashboardPageHeader>

    <div role="group" aria-label="Part of availability" class="flex gap-[0.35rem]">
      <button
        v-for="option in [{ key: 'weekly', label: 'Weekly hours' }, { key: 'exceptions', label: 'Time off and extra hours' }]"
        :key="option.key"
        type="button"
        :aria-pressed="activeTab === option.key"
        class="inline-flex min-h-[2.75rem] cursor-pointer items-center rounded-full border px-[1rem] font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-200 ease-canopy"
        :class="activeTab === option.key ? 'border-forest bg-forest text-white dark:border-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/45 hover:text-foreground'"
        @click="handleTabChange(option.key)"
      >
        {{ option.label }}
      </button>
    </div>

    <WeeklySchedulePanel v-if="activeTab === 'weekly'" />
    <ExceptionsPanel v-else />
  </div>
</template>
