<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhCheckCircle, PhCircle } from '@phosphor-icons/vue'
import type { ProfileCompletenessResult } from '~/lib/profile-completeness'

const props = defineProps<{
  completeness: ProfileCompletenessResult
}>()

const incompletePreview = computed(() => props.completeness.incomplete.slice(0, 4))
const moreIncomplete = computed(() =>
  Math.max(0, props.completeness.incomplete.length - incompletePreview.value.length)
)
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <CardTitle class="text-base">
            Profile completeness
          </CardTitle>
          <CardDescription>
            Complete your profile so clients see a full picture when they find you.
          </CardDescription>
        </div>
        <p class="text-2xl font-semibold tabular-nums text-foreground">
          {{ completeness.percent }}%
        </p>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        class="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        :aria-valuenow="completeness.percent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full rounded-full bg-primary transition-all duration-500"
          :style="{ width: `${completeness.percent}%` }"
        />
      </div>

      <ul class="grid gap-2 sm:grid-cols-2">
        <li
          v-for="check in completeness.checks"
          :key="check.id"
          class="flex items-center gap-2 text-sm"
        >
          <PhCheckCircle
            v-if="check.complete"
            class="size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <PhCircle
            v-else
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span :class="check.complete ? 'text-foreground' : 'text-muted-foreground'">
            {{ check.label }}
          </span>
          <NuxtLink
            v-if="!check.complete && check.href"
            :to="check.href"
            class="ml-auto text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Set up
          </NuxtLink>
        </li>
      </ul>

      <p
        v-if="completeness.percent < 100 && incompletePreview.length"
        class="text-xs text-muted-foreground"
      >
        Next:
        <span
          v-for="(item, index) in incompletePreview"
          :key="item.id"
        >
          {{ item.label }}<span v-if="index < incompletePreview.length - 1"> · </span>
        </span>
        <span v-if="moreIncomplete"> · +{{ moreIncomplete }} more</span>
      </p>
    </CardContent>
  </Card>
</template>
