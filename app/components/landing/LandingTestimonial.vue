<script setup lang="ts">
const secondary = [
  {
    quote: 'The fee was agreed upfront and the consultation happened over video the same evening. Exactly what I needed.',
    initials: 'NE',
    name: 'Ngozi E.',
    meta: 'Client · Enugu',
  },
  {
    quote: 'I could see every credential before booking. It made choosing a corporate lawyer genuinely simple.',
    initials: 'MS',
    name: 'Musa S.',
    meta: 'Founder · Abuja',
  },
]
</script>

<template>
  <section class="bg-canvas py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <!-- Section header -->
      <div class="mb-10 max-w-2xl">
        <p class="text-eyebrow mb-4 text-brass">Trusted across Nigeria</p>
        <h2 class="display-lg text-foreground">
          Real clients, real outcomes.
        </h2>
      </div>

      <!-- Feature quote -->
      <div class="relative overflow-hidden rounded-2xl border border-ink-border bg-ink p-10 text-left md:p-14 lg:p-16">
        <blockquote class="relative z-10 max-w-4xl font-display text-[clamp(1.5rem,3.5vw,2.625rem)] leading-tight tracking-tight text-ink-foreground">
          "I needed a property lawyer urgently for a tenancy dispute.
          <em class="italic text-brass">Booked one within 30 minutes</em> — the credentials were already verified, the fees were clear. No back-and-forth, no guesswork."
        </blockquote>

        <div class="relative z-10 mt-10 inline-flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brass/20 font-display font-semibold text-brass ring-2 ring-brass/30">
            TA
          </div>
          <div>
            <strong class="block font-semibold text-ink-foreground">Tobi Adeyemi</strong>
            <span class="text-sm text-ink-muted">Client · Lekki, Lagos</span>
          </div>
        </div>
      </div>

      <!-- Secondary voices -->
      <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <figure
          v-for="t in secondary"
          :key="t.name"
          class="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm"
        >
          <span class="mb-3 text-sm leading-none text-brass" aria-hidden="true">★★★★★</span>
          <blockquote class="flex-1 text-lg leading-relaxed text-foreground">
            "{{ t.quote }}"
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
              {{ t.initials }}
            </div>
            <div>
              <strong class="block text-sm font-semibold text-foreground">{{ t.name }}</strong>
              <span class="text-xs text-muted-foreground">{{ t.meta }}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
