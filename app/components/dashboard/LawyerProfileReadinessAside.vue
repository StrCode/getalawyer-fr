<script setup lang="ts">
import { CircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { LawyerDirectoryEligibility, LawyerProfileStrengthSummary } from '~/types/lawyer-directory-eligibility'
import { getTier1IncompleteItems } from '~/lib/profile-check-catalog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  profileStrength: LawyerProfileStrengthSummary | null | undefined
  eligibility: LawyerDirectoryEligibility | null | undefined
}>()

const percent = computed(() => props.profileStrength?.percent ?? 0)

const tier1Incomplete = computed(() => getTier1IncompleteItems(props.profileStrength))

const showCard = computed(
  () => Boolean(props.profileStrength) && (!props.eligibility?.tier1Complete || percent.value < 100),
)

const previewItems = computed(() => tier1Incomplete.value.slice(0, 4))
</script>

<template>
  <Card
    v-if="showCard"
    class="py-0 shadow-xs"
  >
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-4">
      <div>
        <CardTitle class="text-base">
          Publish readiness
        </CardTitle>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Required to appear in search
        </p>
      </div>
      <Badge
        variant="secondary"
        class="shrink-0 font-normal tabular-nums"
      >
        {{ percent }}%
      </Badge>
    </CardHeader>

    <CardContent class="px-4 py-4">
      <div class="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full bg-primary transition-all duration-500"
          :style="{ width: `${percent}%` }"
        />
      </div>

      <ul
        v-if="previewItems.length > 0"
        class="mt-3 space-y-1.5"
      >
        <li
          v-for="item in previewItems"
          :key="item.id"
          class="flex items-center gap-2 text-xs"
        >
          <HugeiconsIcon
            :icon="CircleIcon"
            class="size-3.5 shrink-0 text-muted-foreground/50"
          />
          <NuxtLink
            :to="item.href"
            class="text-muted-foreground hover:text-primary hover:underline"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <p
        v-else
        class="mt-3 text-xs text-muted-foreground"
      >
        Tier 1 checks are complete. Keep building your profile for better conversion.
      </p>

      <Button
        as-child
        variant="outline"
        size="sm"
        class="mt-4 w-full cursor-pointer"
      >
        <NuxtLink to="/dashboard/profile">
          Complete profile
        </NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>
