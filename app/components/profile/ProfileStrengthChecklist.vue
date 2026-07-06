<script setup lang="ts">
import { CheckmarkCircle01Icon, CircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buildProfileChecklist } from '~/lib/profile-check-catalog'
import type { LawyerProfileStrengthSummary } from '~/types/lawyer-directory-eligibility'
const props = defineProps<{
  profileStrength: LawyerProfileStrengthSummary | null | undefined
}>()

const tierGroups = computed(() => buildProfileChecklist(props.profileStrength))

const hasStrength = computed(() => Boolean(props.profileStrength))
</script>

<template>
  <Card v-if="hasStrength">
    <CardHeader class="pb-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <CardTitle class="text-base">
            Profile checklist
          </CardTitle>
          <CardDescription>
            Tier 1 gates directory visibility. Tiers 2–3 improve how your page looks.
          </CardDescription>
        </div>
        <Badge
          v-if="profileStrength?.isStrong"
          variant="secondary"
          class="border-primary/20 bg-primary/10 text-primary"
        >
          Strong profile
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <section
        v-for="group in tierGroups"
        :key="group.tier"
        class="space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-foreground">
              {{ group.title }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ group.description }}
            </p>
          </div>
          <Badge
            v-if="group.tier === 1"
            :variant="group.incompleteCount === 0 ? 'secondary' : 'outline'"
          >
            {{ group.incompleteCount === 0 ? 'Complete' : `${group.incompleteCount} remaining` }}
          </Badge>
        </div>

        <ul class="grid gap-2 sm:grid-cols-2">
          <li
            v-for="item in group.items"
            :key="item.id"
            class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <HugeiconsIcon :icon="CheckmarkCircle01Icon"
              v-if="item.complete"
              class="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <HugeiconsIcon :icon="CircleIcon"
              v-else
              class="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span :class="item.complete ? 'text-foreground' : 'text-muted-foreground'">
              {{ item.label }}
            </span>
            <NuxtLink
              v-if="!item.complete"
              :to="item.href"
              class="ml-auto shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Set up
            </NuxtLink>
          </li>
        </ul>
      </section>
    </CardContent>
  </Card>
</template>
