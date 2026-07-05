<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  <Card class="py-0 shadow-xs">
    <CardHeader class="border-b border-border/60 px-4 py-4">
      <CardTitle class="text-base">
        Your legal interests
      </CardTitle>
      <p class="text-sm text-muted-foreground">
        Find lawyers who match the areas you care about.
      </p>
    </CardHeader>
    <CardContent class="space-y-4 px-4 py-4">
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
          <AppIcon
            :icon="appIcons.magnifyingGlass"
            class="size-4"
          />
          Browse matching lawyers
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>
