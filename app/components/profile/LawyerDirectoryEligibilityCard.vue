<script setup lang="ts">
import { Alert01Icon, CheckmarkCircle01Icon, CircleIcon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  LawyerDirectoryEligibility,
  LawyerProfileStrengthSummary,
} from '~/types/lawyer-directory-eligibility'
import { getTier1IncompleteItems } from '~/lib/profile-check-catalog'
const props = defineProps<{
  eligibility: LawyerDirectoryEligibility | null | undefined
  profileStrength: LawyerProfileStrengthSummary | null | undefined
}>()

type GateRow = {
  id: string
  label: string
  passed: boolean
  ctaLabel?: string
  ctaHref?: string
  soft?: boolean
}

const gateRows = computed((): GateRow[] => {
  const e = props.eligibility
  if (!e) return []

  const blockers = new Set(e.blockers)

  return [
    {
      id: 'approval',
      label: 'Application approved',
      passed: !blockers.has('approval'),
      ctaLabel: blockers.has('approval') ? 'View status' : undefined,
      ctaHref: blockers.has('approval') ? '/dashboard' : undefined,
    },
    {
      id: 'subscription',
      label:
        e.subscriptionGate === 'payment_issue'
          ? 'Payment method active'
          : 'Subscription active',
      passed:
        e.subscriptionGate === 'pass' &&
        !blockers.has('subscription_inactive') &&
        !blockers.has('payment_issue'),
      soft: e.subscriptionGate === 'payment_issue',
      ctaLabel:
        e.subscriptionGate === 'payment_issue'
          ? 'Update payment'
          : blockers.has('subscription_inactive')
            ? 'Renew subscription'
            : undefined,
      ctaHref:
        e.subscriptionGate === 'payment_issue' ||
        blockers.has('subscription_inactive')
          ? '/dashboard/subscription'
          : undefined,
    },
    {
      id: 'profile',
      label: 'Required profile details (Tier 1)',
      passed: e.tier1Complete && !blockers.has('profile'),
      ctaLabel: blockers.has('profile') ? 'Complete below' : undefined,
    },
  ]
})

const isVisible = computed(() => props.eligibility?.isDirectoryVisible ?? false)

const strengthPercent = computed(() => props.profileStrength?.percent ?? 0)

const tier1Incomplete = computed(() => getTier1IncompleteItems(props.profileStrength))

const showTier1Details = computed(
  () => !gateRows.value.find((g) => g.id === 'profile')?.passed && tier1Incomplete.value.length > 0,
)
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>
            Directory visibility
          </CardTitle>
          <CardDescription>
            Clients can find your listing in search when all gates pass.
          </CardDescription>
        </div>
        <div
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="
            isVisible
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          "
        >
          <HugeiconsIcon :icon="ViewIcon" v-if="isVisible" class="size-3.5" aria-hidden="true" />
          <HugeiconsIcon :icon="ViewOffIcon" v-else class="size-3.5" aria-hidden="true" />
          {{ isVisible ? 'Visible in search' : 'Hidden from search' }}
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-5">
      <ul class="grid gap-2">
        <li
          v-for="gate in gateRows"
          :key="gate.id"
          class="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <HugeiconsIcon :icon="CheckmarkCircle01Icon"
            v-if="gate.passed"
            class="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <HugeiconsIcon :icon="Alert01Icon"
            v-else-if="gate.soft"
            class="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden="true"
          />
          <HugeiconsIcon :icon="CircleIcon"
            v-else
            class="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <p :class="gate.passed ? 'text-foreground' : 'text-muted-foreground'">
              {{ gate.label }}
            </p>
            <p
              v-if="!gate.passed && gate.soft"
              class="mt-0.5 text-xs text-warning"
            >
              Payment issue — update your card to restore visibility.
            </p>
          </div>
          <NuxtLink
            v-if="!gate.passed && gate.ctaHref"
            :to="gate.ctaHref"
            class="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {{ gate.ctaLabel }}
          </NuxtLink>
          <span
            v-else-if="!gate.passed && gate.ctaLabel && !gate.ctaHref"
            class="shrink-0 text-xs text-muted-foreground"
          >
            {{ gate.ctaLabel }}
          </span>
        </li>
      </ul>

      <div
        v-if="showTier1Details"
        class="rounded-lg border border-dashed border-border bg-muted/30 p-3"
      >
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tier 1 still needed
        </p>
        <ul class="mt-2 space-y-1.5">
          <li
            v-for="item in tier1Incomplete"
            :key="item.id"
            class="flex items-center justify-between gap-2 text-sm"
          >
            <span class="text-muted-foreground">{{ item.label }}</span>
            <NuxtLink
              :to="item.href"
              class="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Set up
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div
        v-if="profileStrength"
        class="space-y-2 rounded-lg bg-muted/40 p-3"
      >
        <div class="flex items-end justify-between gap-2">
          <p class="text-sm font-medium text-foreground">
            Listing strength
          </p>
          <p class="text-sm tabular-nums text-muted-foreground">
            {{ strengthPercent }}%
            <span
              v-if="profileStrength.isStrong"
              class="text-primary"
            > · Strong</span>
          </p>
        </div>
        <div
          class="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          :aria-valuenow="strengthPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="h-full rounded-full bg-primary/70 transition-all duration-500"
            :style="{ width: `${strengthPercent}%` }"
          />
        </div>
        <p class="text-xs text-muted-foreground">
          Strength is a quality nudge only — it does not gate directory visibility.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
