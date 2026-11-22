<script setup lang="ts">
/**
 * The lawyer's application home after it has been submitted. The same page
 * shape as the home they filled in (see components/application/DraftHome.vue),
 * now showing where the application stands: waiting for payment, in review,
 * needing changes, or failed verification. The sections are listed as
 * submitted, then the membership row, then whatever the state needs (default
 * slot): the plan picker, a timeline, or the review team's feedback.
 */
const props = withDefaults(defineProps<{
  kicker: string
  title: string
  description?: string
  /** Small status mark beside the title. */
  pill?: { label: string, tone: 'ok' | 'warn' | 'bad' } | null
  /** Where membership stands. */
  membership: 'due' | 'paid' | 'kept' | 'refunding' | 'refunded' | 'later'
  /** What to call the four sections' state. */
  sectionsState?: 'submitted' | 'reopen'
}>(), { description: '', pill: null, sectionsState: 'submitted' })

const alreadyPaid = computed(() => props.membership === 'paid' || props.membership === 'kept')

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
  paid: { status: 'Paid', text: 'It starts the day you are approved.' },
  kept: { status: 'Paid', text: 'Your payment is kept. It starts the day you are approved.' },
  refunding: { status: 'Refund on its way', text: 'Your membership fee is being returned to you.' },
  refunded: { status: 'Refunded', text: 'Your membership fee has been returned to you.' },
  later: { status: 'After you resubmit', text: 'Choose a plan and pay once your application is back with us.' },
} as const
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div class="min-w-0">
        <p class="text-sm font-medium tracking-widest text-brand uppercase">{{ kicker }}</p>
        <h1 class="mt-2.5 text-3xl md:text-4xl leading-none font-normal tracking-tight text-balance">{{ title }}</h1>
      </div>
      <span v-if="pill" class="inline-flex items-center gap-1.5 rounded-full px-2.75 py-1 text-xs font-medium tracking-wider whitespace-nowrap uppercase" :class="PILL[pill.tone]">
        <i class="size-1.75 rounded-full bg-current" />{{ pill.label }}
      </span>
    </div>
    <p v-if="description || $slots.description" class="mt-2.5 max-w-152 text-muted-foreground">
      <slot name="description">{{ description }}</slot>
    </p>

    <ul class="mt-5.5 grid gap-2">
      <li
        v-for="section in SECTIONS"
        :key="section.title"
        class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-2.75"
      >
        <span class="grid size-8.75 place-items-center rounded-md" :class="sectionsState === 'submitted' ? 'bg-primary text-white' : 'bg-background text-deep'">
          <CanopyGlyph name="tick" :size="14" :stroke="3.2" />
        </span>
        <b class="font-display text-base font-normal tracking-tight">{{ section.title }}</b>
        <span class="text-sm font-medium whitespace-nowrap text-muted-foreground">{{ sectionsState === 'submitted' ? 'Submitted' : section.reopen }}</span>
      </li>
      <li
        class="grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg border px-4 py-2.75 max-sm:grid-cols-[2.2rem_minmax(0,1fr)]"
        :class="membership === 'due' ? 'border-brand bg-mint text-deep' : membership === 'later' ? 'border-dashed border-border' : 'border-border bg-card'"
      >
        <span class="grid size-8.75 place-items-center rounded-md font-display font-medium" :class="alreadyPaid ? 'bg-primary text-white' : 'bg-background text-deep'">
          <CanopyGlyph v-if="alreadyPaid" name="tick" :size="14" :stroke="3.2" />
          <template v-else>5</template>
        </span>
        <span class="min-w-0">
          <b class="block font-display text-base font-normal tracking-tight">Membership</b>
          <small class="block text-sm opacity-80">{{ MEMBERSHIP[membership].text }}</small>
        </span>
        <span class="text-sm font-medium whitespace-nowrap max-sm:col-start-2" :class="membership === 'due' ? '' : 'text-muted-foreground'">{{ MEMBERSHIP[membership].status }}</span>
      </li>
    </ul>

    <div class="mt-6.5 grid gap-4.5">
      <slot />
    </div>
  </div>
</template>
