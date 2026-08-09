<script setup lang="ts">
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const props = defineProps<{
  specializations: Array<{ id: string; name: string }>
}>()

const allAreasQuery = computed(() =>
  lawyersListingQueryFromParts({
    practiceAreas: props.specializations.map((spec) => spec.id),
  }),
)

function areaQuery(id: string) {
  return lawyersListingQueryFromParts({ practiceAreas: [id] })
}
</script>

<template>
  <Card class="py-0">
    <CardHeader class="border-b border-foreground/15 px-6 py-4">
      <span class="micro-label text-muted-foreground">
        Your legal interests
      </span>
      <p class="mt-0.5 text-xs text-muted-foreground">
        Find lawyers who match the areas you care about.
      </p>
    </CardHeader>
    <CardContent class="space-y-4 px-6 py-5">
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="spec in specializations"
          :key="spec.id"
          as-child
          variant="outline"
          size="sm"
          class="cursor-pointer"
        >
          <NuxtLink :to="{ path: '/find-lawyers', query: areaQuery(spec.id) }">
            {{ spec.name }}
          </NuxtLink>
        </Button>
      </div>
      <Button
        as-child
        size="sm"
        class="cursor-pointer"
      >
        <NuxtLink
          :to="{ path: '/find-lawyers', query: allAreasQuery }"
          class="gap-2"
        >
          <HugeiconsIcon
            :icon="Search01Icon"
            class="size-4"
          />
          Browse matching lawyers
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>
