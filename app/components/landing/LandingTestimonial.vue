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
  <section class="bg-background py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <!-- Section header -->
      <div class="mb-10 max-w-2xl">
        <p class="text-xs font-medium uppercase tracking-widest mb-4 text-primary">Trusted across Nigeria</p>
       <h2 class="text-3xl font-medium md:text-4xl text-foreground">
          Real clients, real outcomes.
        </h2>
      </div>

      <!-- Feature quote -->
      <div class="relative overflow-hidden rounded-2xl border border-background/20 bg-foreground p-10 text-left md:p-14 lg:p-16">
        <blockquote class="relative z-10 max-w-4xl font-heading text-[clamp(1.5rem,3.5vw,2.625rem)] leading-tight tracking-tight text-background">
          "I needed a property lawyer urgently for a tenancy dispute.
          <em class="italic text-primary">Booked one within 30 minutes</em> — the credentials were already verified, the fees were clear. No back-and-forth, no guesswork."
        </blockquote>

        <div class="relative z-10 mt-10 inline-flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20 font-heading font-medium text-primary ring-2 ring-primary/30">
            TA
          </div>
          <div>
            <strong class="block font-medium text-background">Tobi Adeyemi</strong>
            <span class="text-sm text-background/70">Client · Lekki, Lagos</span>
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
          <span class="mb-3 text-sm leading-none text-primary" aria-hidden="true">★★★★★</span>
          <blockquote class="flex-1 text-lg leading-relaxed text-foreground">
            "{{ t.quote }}"
          </blockquote>
          <figcaption class="mt-6 flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-medium text-primary">
              {{ t.initials }}
            </div>
            <div>
              <strong class="block text-sm font-medium text-foreground">{{ t.name }}</strong>
              <span class="text-xs text-muted-foreground">{{ t.meta }}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
