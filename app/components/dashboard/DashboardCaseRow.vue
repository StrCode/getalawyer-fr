<script setup lang="ts">
import { ArrowRight01Icon, Briefcase01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  <Card class="group py-0 shadow-xs transition-colors hover:border-primary/30">
    <CardContent class="flex items-start gap-4 p-4">
      <button
        type="button"
        class="flex min-w-0 flex-1 cursor-pointer items-start gap-4 text-left"
        @click="emit('click')"
      >
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <HugeiconsIcon :icon="Briefcase01Icon" class="size-5" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <Badge :variant="statusVariant">
              {{ statusLabel }}
            </Badge>
            <span class="text-xs text-muted-foreground">
              {{ caseItem.caseNumber }}
            </span>
          </div>
          <p class="font-medium text-foreground">
            {{ (caseItem as { caseTitle?: string }).caseTitle || caseItem.title }}
          </p>
          <p class="mt-0.5 text-sm text-muted-foreground">
            With {{ counterpartyName }}
          </p>
        </div>

        <HugeiconsIcon
          :icon="ArrowRight01Icon"
          class="mt-2 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </button>
    </CardContent>
  </Card>
</template>
