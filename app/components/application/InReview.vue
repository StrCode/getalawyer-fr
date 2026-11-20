<script setup lang="ts">
import { Button } from '@/components/ui/button'

/**
 * The application home once it is submitted and paid for: waiting for the
 * review team. The page that shows this keeps checking for a decision.
 */
const props = defineProps<{
  /** When the application was submitted (ISO date), if known. */
  submittedAt: string | null
}>()

defineEmits<{ refresh: [] }>()

// The first time this screen is seen (right after paying) the steps arrive one
// after another. After that it is a status page someone checks, so it is still.
const SEEN_KEY = 'gal_review_seen'
let firstView = false
if (import.meta.client) {
  try {
    firstView = localStorage.getItem(SEEN_KEY) !== '1'
    localStorage.setItem(SEEN_KEY, '1')
  }
  catch {
    // Storage blocked: show the page without the entrance.
  }
}

const submittedLabel = computed(() => {
  if (!props.submittedAt) return null
  try {
    return new Date(props.submittedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  catch {
    return null
  }
})

/** What happens from here, in order. "now" marks where the application is. */
const timeline = computed(() => [
  { state: 'done', title: 'Application submitted', note: submittedLabel.value ?? 'Received' },
  { state: 'done', title: 'Membership paid', note: 'You are covered while we finish the review.' },
  { state: 'now', title: 'Identity and enrolment checks', note: 'In progress' },
  { state: 'next', title: 'Decision by email', note: `Usually within ${REVIEW_TIME}` },
  { state: 'next', title: 'Your profile goes live', note: 'Clients can find and message you' },
])
</script>

<template>
  <ApplicationStatus
    kicker="Application submitted"
    title="Application in review"
    :pill="{ label: 'In review', tone: 'ok' }"
    membership="paid"
  >
    <template #description>
      We are checking your credentials. You will get an email when there is a decision, usually within {{ REVIEW_TIME }}.
    </template>

    <section aria-labelledby="timeline-title" class="rounded-card border border-border bg-card p-[clamp(1.1rem,2.4vw,1.5rem)]">
      <h2 id="timeline-title" class="text-[1.3rem] font-[650] tracking-[-0.02em]">What happens next</h2>
      <ol class="mt-4 grid">
        <li
          v-for="(item, index) in timeline"
          :key="item.title"
          class="relative grid grid-cols-[1.9rem_minmax(0,1fr)] gap-[0.8rem] pb-[1.1rem] last:pb-0"
          :class="firstView ? 'animate-step-in' : ''"
          :style="firstView ? { animationDelay: `${index * 50}ms` } : undefined"
        >
          <i v-if="index < timeline.length - 1" aria-hidden="true" class="absolute top-[1.9rem] bottom-0 left-[0.92rem] w-[2px] bg-border" />
          <span
            class="grid size-[1.9rem] place-items-center rounded-full border-2 text-[0.8rem] font-bold"
            :class="item.state === 'done' ? 'border-primary bg-primary text-white' : item.state === 'now' ? 'border-primary text-brand ring-4 ring-mint' : 'border-border text-muted-foreground'"
          >
            <CanopyGlyph v-if="item.state === 'done'" name="tick" :size="12" :stroke="3.4" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <div>
            <b class="block">{{ item.title }}</b>
            <small class="text-[0.88rem] text-muted-foreground">{{ item.note }}</small>
          </div>
        </li>
      </ol>
    </section>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[0.9rem] text-muted-foreground">
      <p>
        This page checks for a decision by itself. Questions?
        <a :href="`mailto:${SUPPORT_EMAIL}`" :class="authLink">{{ SUPPORT_EMAIL }}</a>
      </p>
      <Button variant="line" size="pill-sm" @click="$emit('refresh')">Refresh status</Button>
    </div>
  </ApplicationStatus>
</template>
