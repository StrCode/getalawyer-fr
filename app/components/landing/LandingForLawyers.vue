<script setup lang="ts">
const features = [
  {
    title: 'Bar-verified credentials',
    desc: 'NIN and SCN verified. Build instant trust with clients.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    title: 'Smart booking',
    desc: 'Calendar that syncs with yours. Reduce no-shows.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>`,
  },
  {
    title: 'Direct messaging',
    desc: 'Talk to clients before and after consultations.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    title: 'Zero commission',
    desc: 'Keep 100% of what you charge. Flat subscription only.',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
]
</script>

<template>
  <section id="lawyers" class="relative overflow-hidden bg-foreground py-12 text-background md:py-24">
    <!-- Subtle accent glow -->
    <div class="pointer-events-none absolute -top-48 -right-48 size-[600px] rounded-full bg-primary/5 blur-3xl" />

    <div class="relative mx-auto max-w-7xl px-6 md:px-8">
      <div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">

        <!-- Left: copy -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">For legal professionals</p>
         <h2 class="text-4xl font-medium md:text-5xl max-w-2xl text-background">
            Grow your practice. <em class="font-heading italic font-normal text-background/70">Keep every naira you earn.</em>
          </h2>
          <p class="mt-6 mb-9 max-w-lg text-xl leading-normal text-background/70">
            Join verified lawyers across Nigeria reaching clients who are ready to book. Zero commission. Flat monthly subscription. Your bar-verified credentials, displayed prominently.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <Button variant="brass" size="lg" as-child>
              <NuxtLink to="/register?role=lawyer">Register as a lawyer</NuxtLink>
            </Button>
            <Button
              variant="outline"
              size="lg"
              as-child
              class="border-background/20 bg-transparent text-background hover:border-background/60 hover:bg-white/5 hover:text-background"
            >
              <NuxtLink to="/for-lawyers">Learn more</NuxtLink>
            </Button>
          </div>
        </div>

        <!-- Right: 2×2 feature grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="group rounded-2xl border border-background/20 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div
              class="mb-4 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105"
              v-html="feat.icon"
            />
           <h4 class="mb-1.5 text-base font-semibold text-background">{{ feat.title }}</h4>
            <p class="text-sm leading-normal text-background/70">{{ feat.desc }}</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
