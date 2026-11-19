<script setup lang="ts">
/**
 * The lawyer's application home after it has been submitted. The same page
 * shape as the home they filled in (see components/application/DraftHome.vue),
 * now showing where the application stands: waiting for payment, in review,
 * needing changes, or failed verification. The sections are listed as
 * submitted, then the membership row, then whatever the state needs (default
 * slot): the plan picker, a timeline, or the review team's feedback.
 */
withDefaults(defineProps<{
  kicker: string
  title: string
  description?: string
  /** Small status mark beside the title. */
  pill?: { label: string, tone: 'ok' | 'warn' | 'bad' } | null
  /** Where membership stands. */
  membership: 'due' | 'paid' | 'refunding' | 'refunded' | 'later'
  /** What to call the four sections' state. */
  sectionsState?: 'submitted' | 'reopen'
}>(), { description: '', pill: null, sectionsState: 'submitted' })

// When an application is reopened, everything typed comes back except the NIN,
// which is removed and has to be entered again.
const SECTIONS = [
  { title: 'About you', reopen: 'Kept for you' },
  { title: 'Identity', reopen: 'Enter your NIN again' },
  { title: 'Bar credentials', reopen: 'Kept for you' },
  { title: 'How you practise', reopen: 'Kept for you' },
]

const PILL = {
  ok: 'bg-mint text-deep',
  warn: 'border border-warning/30 bg-warning/10 text-warning-subtle-foreground',
  bad: 'border border-destructive/30 bg-destructive/10 text-destructive',
} as const

const MEMBERSHIP = {
  due: { status: 'Next', text: 'Choose a plan and pay. Refunded if verification does not pass.' },
  paid: { status: 'Paid', text: 'You are covered while we finish the review.' },
  refunding: { status: 'Refund on its way', text: 'Your membership fee is being returned to you.' },
  refunded: { status: 'Refunded', text: 'Your membership fee has been returned to you.' },
  later: { status: 'After you resubmit', text: 'Choose a plan and pay once your application is back with us.' },
} as const
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div class="min-w-0">
        <p class="text-[0.8125rem] font-bold tracking-[0.08em] text-brand uppercase">{{ kicker }}</p>
        <h1 class="mt-[0.6rem] text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[1.04] font-[650] tracking-[-0.035em] text-balance">{{ title }}</h1>
      </div>
      <span v-if="pill" class="inline-flex items-center gap-[0.4rem] rounded-full px-[0.7rem] py-1 text-[0.74rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase" :class="PILL[pill.tone]">
        <i class="size-[0.45rem] rounded-full bg-current" />{{ pill.label }}
      </span>
    </div>
    <p v-if="description || $slots.description" class="mt-[0.6rem] max-w-[38rem] text-muted-foreground">
      <slot name="description">{{ description }}</slot>
    </p>

    <ul class="mt-[1.4rem] grid gap-[0.5rem]">
      <li
        v-for="section in SECTIONS"
        :key="section.title"
        class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-[0.9rem] rounded-[1.1rem] border border-border bg-card px-4 py-[0.7rem]"
      >
        <span class="grid size-[2.2rem] place-items-center rounded-[0.8rem]" :class="sectionsState === 'submitted' ? 'bg-primary text-white' : 'bg-background text-deep'">
          <CanopyGlyph name="tick" :size="14" :stroke="3.2" />
        </span>
        <b class="font-display text-[1.05rem] font-[650] tracking-[-0.02em]">{{ section.title }}</b>
        <span class="text-[0.85rem] font-semibold whitespace-nowrap text-muted-foreground">{{ sectionsState === 'submitted' ? 'Submitted' : section.reopen }}</span>
      </li>
      <li
        class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-[0.9rem] rounded-[1.1rem] border px-4 py-[0.7rem] max-sm:grid-cols-[2.2rem_minmax(0,1fr)]"
        :class="membership === 'due' ? 'border-brand bg-mint text-deep' : membership === 'later' ? 'border-dashed border-border' : 'border-border bg-card'"
      >
        <span class="grid size-[2.2rem] place-items-center rounded-[0.8rem] font-display font-bold" :class="membership === 'paid' ? 'bg-primary text-white' : 'bg-background text-deep'">
          <CanopyGlyph v-if="membership === 'paid'" name="tick" :size="14" :stroke="3.2" />
          <template v-else>5</template>
        </span>
        <span class="min-w-0">
          <b class="block font-display text-[1.05rem] font-[650] tracking-[-0.02em]">Membership</b>
          <small class="block text-[0.86rem] opacity-80">{{ MEMBERSHIP[membership].text }}</small>
        </span>
        <span class="text-[0.85rem] font-semibold whitespace-nowrap max-sm:col-start-2" :class="membership === 'due' ? '' : 'text-muted-foreground'">{{ MEMBERSHIP[membership].status }}</span>
      </li>
    </ul>

    <div class="mt-[1.6rem] grid gap-[1.1rem]">
      <slot />
    </div>
  </div>
</template>
