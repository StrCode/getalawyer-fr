<script setup lang="ts">
const steps = [
  {
    num: '01',
    title: 'Search & filter',
    desc: 'Find lawyers by practice area, location, language, and consultation type. Narrow down to a shortlist that fits.',
  },
  {
    num: '02',
    title: 'Compare profiles',
    desc: 'Review verified credentials, experience, and transparent fees. See exactly who you\'re hiring before you commit.',
  },
  {
    num: '03',
    title: 'Ask a question',
    desc: 'Message a lawyer for free. They can answer in chat and optionally request a consultation fee if you need more help.',
  },
  {
    num: '04',
    title: 'Consult & resolve',
    desc: 'Connect by video, phone, or in person. Message your lawyer before and after to keep things moving.',
  },
]
</script>

<template>
  <section id="how-it-works" class="scroll-mt-23 bg-background section-y">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <!-- Header -->
      <p class="eyebrow mb-4 text-primary-strong">How it works</p>
     <h2 class="text-4xl font-medium md:text-5xl mb-6 max-w-2xl text-foreground">
        From your first search to your first consultation.
      </h2>
      <p class="max-w-xl text-xl leading-normal text-muted-foreground">
        Four steps. No calls. No paperwork. Just verified lawyers ready when you need them.
      </p>

      <!-- Step cards -->
      <div class="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="step in steps"
          :key="step.num"
          class="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <!-- Vignette -->
          <div class="relative mb-6 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border/60" aria-hidden="true">
            <!-- 01 · Search bar mock -->
            <div v-if="step.num === '01'" class="flex w-[78%] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0 text-primary"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="h-2 w-2/3 rounded-full bg-muted-foreground/30" />
            </div>

            <!-- 02 · Stacked profile rows -->
            <div v-else-if="step.num === '02'" class="flex w-[78%] flex-col gap-2">
              <div v-for="r in 2" :key="r" class="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 shadow-xs">
                <span class="size-6 shrink-0 rounded-full bg-primary/15" />
                <span class="flex flex-1 flex-col gap-1">
                  <span class="h-1.5 w-2/3 rounded-full bg-muted-foreground/30" />
                  <span class="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="shrink-0 text-primary"><path d="M20 6 9 17l-5-5"/></svg><span class="h-1.5 w-1/3 rounded-full bg-muted-foreground/20" /></span>
                </span>
              </div>
            </div>

            <!-- 03 · Chat mock -->
            <div v-else-if="step.num === '03'" class="flex w-[70%] flex-col gap-1.5">
              <span class="h-5 w-3/4 self-start rounded-lg rounded-bl-sm border border-border bg-card shadow-xs" />
              <span class="h-5 w-2/3 self-end rounded-lg rounded-br-sm bg-primary/80" />
            </div>

            <!-- 04 · Video tile mock -->
            <div v-else class="relative flex h-[68%] w-[78%] items-center justify-center rounded-lg bg-foreground">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background/80"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              <span class="absolute right-2 bottom-2 size-5 rounded-md bg-primary" />
            </div>
          </div>

          <!-- Numbered badge + title -->
          <div class="mb-2 flex items-center gap-3">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-medium tabular-nums text-primary">
              {{ step.num }}
            </span>
           <h3 class="text-lg font-medium text-foreground">{{ step.title }}</h3>
          </div>
          <p class="text-sm leading-[1.55] text-muted-foreground">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
