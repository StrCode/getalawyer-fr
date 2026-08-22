<script setup lang="ts">
import ButtonBusy from '@/components/ButtonBusy.vue'
import { MICRO, PANEL, PANEL_HEADER } from '@/lib/dashboard-panel'
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  /** Formatted amount due at this checkout (first-year total or renewal price). */
  priceLabel: string | null
  /** Renewals are membership-only; first checkout adds the verification fee. */
  isRenewal: boolean
  /** Formatted verification fee, shown only on first checkout. */
  verificationFeeLabel: string | null
  buttonLabel: string
  loading?: boolean
}>()

const emit = defineEmits<{
  pay: []
}>()

const benefits = [
  'Public directory listing',
  'Client bookings and messaging',
  'Keep 100% of consultation fees',
] as const
</script>

<template>
  <section :class="cn(PANEL)">
    <div :class="PANEL_HEADER">
      <div>
        <span :class="cn(MICRO, 'text-muted-foreground')">
          Checkout
        </span>
        <p class="mt-1 text-base font-semibold tracking-tight text-foreground">
          {{ title }}
        </p>
      </div>
      <p
        v-if="priceLabel"
        class="shrink-0 text-xl font-semibold tabular-nums tracking-tight text-foreground"
      >
        {{ priceLabel }}
        <span class="text-xs font-normal text-muted-foreground">
          {{ isRenewal ? '/ year' : '/ first year' }}
        </span>
      </p>
    </div>
    <div class="space-y-4 px-6 py-5">
      <ul class="space-y-1.5 text-sm text-muted-foreground">
        <li
          v-for="item in benefits"
          :key="item"
          class="flex items-start gap-2"
        >
          <span
            class="mt-[0.55rem] size-1 shrink-0 rounded-full bg-primary"
            aria-hidden="true"
          />
          {{ item }}
        </li>
      </ul>
      <p
        v-if="!isRenewal && verificationFeeLabel"
        class="text-xs leading-relaxed text-muted-foreground"
      >
        Includes a one-time {{ verificationFeeLabel }} verification fee — if verification fails, the membership fee is refunded and the verification fee is kept.
      </p>
      <ButtonBusy
        class="cursor-pointer"
        :loading="loading"
        @click="emit('pay')"
      >
        {{ buttonLabel }}
      </ButtonBusy>
    </div>
  </section>
</template>
