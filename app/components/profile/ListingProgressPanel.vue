<script setup lang="ts">
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  CircleIcon,
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MICRO, PANEL, PANEL_HEADER } from '@/lib/dashboard-panel'
import {
  getListingProgressTone,
  LISTING_PROGRESS_BAR_CLASS,
  LISTING_PROGRESS_TEXT_CLASS,
} from '@/lib/listing-progress'
import {
  buildProfileChecklist,
  getIncompleteListingItems,
  getTier1IncompleteItems,
} from '~/lib/profile-check-catalog'
import { cn } from '@/lib/utils'
import type {
  LawyerDirectoryEligibility,
  LawyerProfileStrengthSummary,
} from '~/types/lawyer-directory-eligibility'

const props = defineProps<{
  eligibility: LawyerDirectoryEligibility | null | undefined
  profileStrength: LawyerProfileStrengthSummary | null | undefined
}>()

const showAllChecks = ref(false)

const percent = computed(() => props.profileStrength?.percent ?? 0)
const progressTone = computed(() => getListingProgressTone(percent.value))
const isVisible = computed(() => props.eligibility?.isDirectoryVisible ?? false)
const tier1Incomplete = computed(() => getTier1IncompleteItems(props.profileStrength))
const incompleteItems = computed(() => getIncompleteListingItems(props.profileStrength))

const status = computed(() => {
  if (isVisible.value) {
    return {
      label: 'Live in search',
      class: 'border-primary/40 bg-primary/10 text-primary',
      icon: ViewIcon,
    }
  }
  if (tier1Incomplete.value.length > 0) {
    return {
      label: 'Needs setup',
      class: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-500',
      icon: ViewOffIcon,
    }
  }
  return {
    label: 'Hidden from search',
    class: 'border-foreground/15 bg-muted/50 text-muted-foreground',
    icon: ViewOffIcon,
  }
})

type GateRow = {
  id: string
  label: string
  passed: boolean
  href?: string
  cta?: string
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
    },
    {
      id: 'subscription',
      label:
        e.subscriptionGate === 'payment_issue'
          ? 'Payment method active'
          : 'Subscription active',
      passed:
        e.subscriptionGate === 'pass'
        && !blockers.has('subscription_inactive')
        && !blockers.has('payment_issue'),
      href:
        e.subscriptionGate === 'payment_issue' || blockers.has('subscription_inactive')
          ? '/dashboard/subscription'
          : undefined,
      cta:
        e.subscriptionGate === 'payment_issue'
          ? 'Update payment'
          : blockers.has('subscription_inactive')
            ? 'Renew'
            : undefined,
    },
    {
      id: 'profile',
      label: 'Required listing details',
      passed: e.tier1Complete && !blockers.has('profile'),
    },
  ]
})

const checklistPreview = computed(() => {
  const items = incompleteItems.value
  if (showAllChecks.value) return items
  return items.slice(0, 5)
})

const tierSummary = computed(() =>
  buildProfileChecklist(props.profileStrength)
    .map((group) => ({
      tier: group.tier,
      title: group.title,
      done: group.items.length - group.incompleteCount,
      total: group.items.length,
    })),
)

const nextHref = computed(() => incompleteItems.value[0]?.href ?? '#photo')
</script>

<template>
  <section
    v-if="profileStrength || eligibility"
    :class="PANEL"
  >
    <div :class="PANEL_HEADER">
      <div class="min-w-0">
        <span :class="cn(MICRO, 'text-muted-foreground')">
          Listing progress
        </span>
        <p class="mt-1 text-xs text-muted-foreground">
          Complete required items to appear in search.
        </p>
      </div>
      <Badge
        variant="outline"
        class="shrink-0 gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase"
        :class="status.class"
      >
        <HugeiconsIcon
          :icon="status.icon"
          class="size-3.5"
        />
        {{ status.label }}
      </Badge>
    </div>

    <div class="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div class="space-y-4">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p
              class="text-4xl font-semibold tracking-tight tabular-nums"
              :class="LISTING_PROGRESS_TEXT_CLASS[progressTone]"
            >
              {{ percent }}%
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ incompleteItems.length === 0 ? 'All checklist items done' : `${incompleteItems.length} remaining` }}
            </p>
          </div>
          <Button
            v-if="incompleteItems.length > 0"
            as-child
            size="sm"
            class="cursor-pointer"
          >
            <NuxtLink
              :to="nextHref"
              class="gap-1.5"
            >
              Continue
              <HugeiconsIcon
                :icon="ArrowRight01Icon"
                class="size-3.5"
              />
            </NuxtLink>
          </Button>
        </div>

        <div
          class="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          :aria-valuenow="percent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Listing completion"
        >
          <div
            class="h-full rounded-full transition-[width] duration-500 ease-luxe"
            :class="LISTING_PROGRESS_BAR_CLASS[progressTone]"
            :style="{ width: `${percent}%` }"
          />
        </div>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="tier in tierSummary"
            :key="tier.tier"
            class="rounded-full border border-foreground/15 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase tabular-nums"
          >
            T{{ tier.tier }} {{ tier.done }}/{{ tier.total }}
          </li>
        </ul>

        <ul
          v-if="gateRows.length > 0"
          class="space-y-2 border-t border-foreground/10 pt-4"
        >
          <li
            v-for="gate in gateRows"
            :key="gate.id"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span class="flex min-w-0 items-center gap-2">
              <HugeiconsIcon
                :icon="gate.passed ? CheckmarkCircle01Icon : CircleIcon"
                class="size-4 shrink-0"
                :class="gate.passed ? 'text-primary' : 'text-muted-foreground/50'"
              />
              <span :class="gate.passed ? 'text-muted-foreground' : 'text-foreground'">
                {{ gate.label }}
              </span>
            </span>
            <NuxtLink
              v-if="!gate.passed && gate.href && gate.cta"
              :to="gate.href"
              class="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              {{ gate.cta }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="space-y-3 lg:border-l lg:border-foreground/10 lg:pl-6">
        <p :class="cn(MICRO, 'text-muted-foreground')">
          Next up
        </p>

        <p
          v-if="incompleteItems.length === 0"
          class="text-sm text-muted-foreground"
        >
          Nothing left on the checklist. Keep your listing current as you grow.
        </p>

        <ul
          v-else
          class="divide-y divide-foreground/10 rounded-xl border border-foreground/15"
        >
          <li
            v-for="item in checklistPreview"
            :key="item.id"
          >
            <NuxtLink
              :to="item.href"
              class="ease-luxe flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors duration-220 hover:bg-muted/40"
            >
              <span class="flex min-w-0 items-center gap-2.5">
                <span
                  class="inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.6rem] font-semibold tabular-nums"
                  :class="item.tier === 1
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-500'
                    : 'border-foreground/15 text-muted-foreground'"
                >
                  {{ item.tier }}
                </span>
                <span class="truncate text-foreground">{{ item.label }}</span>
              </span>
              <HugeiconsIcon
                :icon="ArrowRight01Icon"
                class="size-3.5 shrink-0 text-muted-foreground"
              />
            </NuxtLink>
          </li>
        </ul>

        <button
          v-if="incompleteItems.length > 5"
          type="button"
          class="cursor-pointer text-xs font-medium text-primary underline-offset-4 hover:underline"
          @click="showAllChecks = !showAllChecks"
        >
          {{ showAllChecks ? 'Show less' : `Show all ${incompleteItems.length}` }}
        </button>
      </div>
    </div>
  </section>
</template>
