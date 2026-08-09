<script setup lang="ts">
import { ArrowRight01Icon, Briefcase01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import type { Case } from '~/types/case'

const props = defineProps<{
  caseItem: Case
  personName?: string
}>()

const emit = defineEmits<{
  click: []
}>()

const counterpartyName = computed(() =>
  props.personName
  ?? props.caseItem.client?.name
  ?? props.caseItem.lawyer?.name
  ?? 'Participant',
)

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    active: 'Active',
    closed: 'Closed',
    reopened: 'Reopened',
    archived: 'Archived',
  }
  return labels[props.caseItem.status] ?? props.caseItem.status
})

const statusVariant = computed(() => {
  if (props.caseItem.status === 'active' || props.caseItem.status === 'reopened') {
    return 'verified' as const
  }
  return 'soft' as const
})
</script>

<template>
  <button
    type="button"
    class="ease-luxe group flex w-full cursor-pointer items-start gap-4 px-6 py-4 text-left transition-colors duration-220 hover:bg-muted/40"
    @click="emit('click')"
  >
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-muted/40 text-primary"
    >
      <HugeiconsIcon
        :icon="Briefcase01Icon"
        class="size-4"
      />
    </span>

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex flex-wrap items-center gap-2">
        <Badge :variant="statusVariant">
          {{ statusLabel }}
        </Badge>
        <span class="text-xs text-muted-foreground tabular-nums">
          {{ caseItem.caseNumber }}
        </span>
      </div>
      <p class="font-medium tracking-tight text-foreground">
        {{ (caseItem as { caseTitle?: string }).caseTitle || caseItem.title }}
      </p>
      <p class="mt-0.5 text-sm text-muted-foreground">
        With {{ counterpartyName }}
      </p>
    </div>

    <HugeiconsIcon
      :icon="ArrowRight01Icon"
      class="ease-luxe mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-220 group-hover:translate-x-0.5 group-hover:text-foreground"
    />
  </button>
</template>
