<template>
  <SettingsSectionCard
    title="Case history"
    description="Past and ongoing consultations with lawyers on GetALawyer."
  >
    <div
      v-if="cases.length === 0"
      class="py-10 text-center text-sm text-muted-foreground"
    >
      No consultations yet.
      <NuxtLink
        to="/find-lawyers"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        Find a lawyer
      </NuxtLink>
    </div>

    <ul
      v-else
      class="divide-y divide-border/80"
    >
      <li
        v-for="item in cases"
        :key="item.id"
        class="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-medium text-foreground">
              {{ item.lawyer }}
            </p>
            <Badge :variant="statusVariant(item.status)">
              {{ item.status }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ item.firm }} · {{ item.type }}
          </p>
          <p class="text-sm text-muted-foreground">
            {{ item.description }}
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <Button
            v-if="item.status === 'Closed'"
            type="button"
            variant="outline"
            size="sm"
          >
            Leave review
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="rehire(item.lawyerId)"
          >
            Re-hire
          </Button>
        </div>
      </li>
    </ul>
  </SettingsSectionCard>
</template>

<script setup lang="ts">
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const cases = ref([
  {
    id: '1',
    lawyer: 'Adv. Chioma Okafor',
    lawyerId: 'lawyer-1',
    firm: 'Okafor & Partners',
    type: 'Property law',
    description: 'Review of commercial lease terms',
    status: 'Active' as const,
  },
  {
    id: '2',
    lawyer: 'Barr. Emeka Nwosu',
    lawyerId: 'lawyer-2',
    firm: 'Nwosu Legal',
    type: 'Employment',
    description: 'Wrongful termination advisory',
    status: 'Closed' as const,
  },
  {
    id: '3',
    lawyer: 'Adv. Fatima Bello',
    lawyerId: 'lawyer-3',
    firm: 'Bello Chambers',
    type: 'Family law',
    description: 'Custody consultation — pending scheduling',
    status: 'Pending' as const,
  },
])

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'Active') return 'default'
  if (status === 'Pending') return 'secondary'
  return 'outline'
}

function rehire(lawyerId: string) {
  toast.info('Re-hire flow', { description: `Opening booking for ${lawyerId} (coming soon).` })
}
</script>
