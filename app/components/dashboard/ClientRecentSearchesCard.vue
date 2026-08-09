<script setup lang="ts">
import { ArrowRight01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  type RecentLawyerDirectoryEntry,
  useRecentLawyerDirectorySearches,
} from '~/composables/useRecentLawyerDirectorySearches'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const { listStoredOnly, hasStoredSearches } = useRecentLawyerDirectorySearches()

const searches = computed(() => listStoredOnly())
const showCard = computed(() => hasStoredSearches() && searches.value.length > 0)

function searchLabel(entry: RecentLawyerDirectoryEntry): string {
  if (entry.keywords.trim()) return entry.keywords.trim()
  if (entry.location.trim()) return entry.location.trim()
  if (entry.practiceAreas.length > 0) return 'Practice area search'
  return 'Directory search'
}

function searchSubtitle(entry: RecentLawyerDirectoryEntry): string {
  const parts: string[] = []
  if (entry.keywords.trim() && entry.location.trim()) parts.push(entry.location.trim())
  if (entry.consultationTypes.length > 0) parts.push(entry.consultationTypes.join(', '))
  return parts.join(' · ')
}

function searchQuery(entry: RecentLawyerDirectoryEntry) {
  return lawyersListingQueryFromParts({
    keywords: entry.keywords,
    location: entry.location,
    consultationTypes: entry.consultationTypes,
    practiceAreas: entry.practiceAreas,
  })
}
</script>

<template>
  <Card
    v-if="showCard"
    class="py-0"
  >
    <CardHeader class="flex flex-row items-baseline justify-between gap-3 space-y-0 border-b border-foreground/15 px-6 py-4">
      <div>
        <span class="micro-label text-muted-foreground">
          Recent searches
        </span>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Pick up where you left off
        </p>
      </div>
      <Button
        as-child
        variant="ghost"
        size="sm"
        class="cursor-pointer"
      >
        <NuxtLink to="/find-lawyers">
          New search
        </NuxtLink>
      </Button>
    </CardHeader>

    <CardContent class="divide-y divide-foreground/15 p-0">
      <NuxtLink
        v-for="entry in searches"
        :key="entry.id"
        :to="{ path: '/find-lawyers', query: searchQuery(entry) }"
        class="ease-luxe group flex items-center gap-3 px-6 py-3.5 transition-colors duration-220 hover:bg-muted/40"
      >
        <span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <HugeiconsIcon
            :icon="Search01Icon"
            class="size-4"
          />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-foreground group-hover:text-primary">
            {{ searchLabel(entry) }}
          </span>
          <span
            v-if="searchSubtitle(entry)"
            class="block truncate text-xs text-muted-foreground"
          >
            {{ searchSubtitle(entry) }}
          </span>
        </span>
        <HugeiconsIcon
          :icon="ArrowRight01Icon"
          class="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
        />
      </NuxtLink>
    </CardContent>
  </Card>
</template>
