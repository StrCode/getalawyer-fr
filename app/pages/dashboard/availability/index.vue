<script setup lang="ts">
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import ExceptionsPanel from '@/components/availability/ExceptionsPanel.vue'
import WeeklySchedulePanel from '@/components/availability/WeeklySchedulePanel.vue'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { LawyerAvailabilitySchedule } from '~/types/availability'

definePageMeta({
  layout: 'dashboard',
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

useHead({
  title: computed(() => (activeTab.value === 'exceptions' ? 'Availability exceptions - GetALawyer' : 'Availability - GetALawyer')),
})

const { useAvailabilitySchedule } = useAvailability()
const { data: schedules, isPending } = useAvailabilitySchedule()

const availableDaysCount = computed(
  () => (schedules.value ?? []).filter((s: LawyerAvailabilitySchedule) => s.isAvailable).length,
)
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <DashboardPageHeader
      eyebrow="Practice"
      title="Availability"
      description="Your recurring hours for client bookings, plus date-specific exceptions."
    >
      <template #actions>
        <Badge
          v-if="!isPending"
          variant="outline"
          class="rounded-full border-foreground/15 px-3 py-1 text-xs font-semibold tabular-nums"
          :class="availableDaysCount > 0 ? 'border-primary/40 bg-primary/10 text-primary' : 'text-muted-foreground'"
        >
          {{ availableDaysCount }} {{ availableDaysCount === 1 ? 'day' : 'days' }} open
        </Badge>
      </template>
    </DashboardPageHeader>

    <Tabs
      :model-value="activeTab"
      class="w-full"
      @update:model-value="handleTabChange"
    >
      <TabsList>
        <TabsTrigger value="weekly">
          Weekly hours
        </TabsTrigger>
        <TabsTrigger value="exceptions">
          Exceptions
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="weekly"
        class="mt-4"
      >
        <WeeklySchedulePanel />
      </TabsContent>

      <TabsContent
        value="exceptions"
        class="mt-4"
      >
        <ExceptionsPanel />
      </TabsContent>
    </Tabs>
  </div>
</template>
