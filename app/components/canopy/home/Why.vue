<script setup lang="ts">
/** "Why getalawyer": five tiles in two rows; one photo tile with an example slot picker. */
const slots = ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM']
const picked = ref(1)
const states = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Enugu', 'Kaduna', 'Delta']
const checks = ['National Identification Number', 'Supreme Court enrolment number']

// Class lists shared by the tiles (full strings, so Tailwind sees them).
const tile = 'flex min-h-[17.5rem] min-w-0 flex-col gap-[0.7rem] rounded-tile transition-transform duration-[900ms] ease-canopy hover:-translate-y-1'
const pad = 'p-[clamp(1.25rem,2vw,1.75rem)]'
const wide = 'col-span-5 max-tab:col-span-6 max-sm:col-span-12 max-sm:min-h-[15rem]'
const narrow = 'col-span-3 max-tab:col-span-6 max-sm:col-span-12 max-sm:min-h-[15rem]'
const kicker = 'text-[0.8125rem] font-bold tracking-[0.08em] uppercase'
const tileTitle = 'text-[clamp(1.4rem,1.9vw,1.75rem)] leading-[1.08] font-[650] tracking-[-0.03em]'
const bubble = 'max-w-[88%] rounded-[1.1rem] px-[0.9rem] py-[0.65rem] text-[1rem] leading-[1.4]'
</script>

<template>
  <section id="why" class="scroll-mt-24 py-[clamp(3.5rem,7vw,6.5rem)] [#lawyers+&]:pt-0">
    <CanopySectionHead kicker="Why getalawyer" title="Built so you can check before you trust.">
      <p class="max-w-[34rem] flex-[0_1_24rem] text-muted-foreground">Who is listed, what it costs to ask, and what the platform takes. Each one is stated plainly.</p>
    </CanopySectionHead>

    <div class="grid grid-cols-12 gap-[1.1rem]">
      <!-- Consultations: photo with an example slot picker -->
      <div data-rise data-surface="forest" :class="[tile, 'group/tile relative col-span-4 row-span-2 overflow-hidden bg-forest text-white max-tab:col-span-12 max-tab:row-auto max-tab:min-h-[24rem] max-sm:min-h-[27rem]']">
        <NuxtImg
          src="/images/canopy/meet.jpg"
          width="1200"
          height="800"
          sizes="480px"
          alt="A lawyer in a blazer smiling across a table during a consultation"
          loading="lazy"
          class="absolute inset-0 size-full object-cover object-[86%_50%] transition-transform duration-[1100ms] ease-canopy group-hover/tile:scale-[1.04] max-tab:object-[50%_35%] max-sm:object-[86%_50%]"
        />
        <span aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] tile-foot-fade" />
        <div class="relative z-1 px-[clamp(1.25rem,2vw,1.75rem)] pt-[clamp(1.25rem,2vw,1.75rem)] pb-[4.5rem] tile-cap-fade">
          <div :class="[kicker, 'text-lime']">Consultations</div>
          <h3 :class="[tileTitle, 'mt-[0.7rem]']">Video, phone or in person.</h3>
        </div>
        <div class="relative z-1 mx-[0.7rem] mt-auto mb-[0.7rem] rounded-[1.35rem] bg-card p-[0.9rem] text-foreground shadow-book max-tab:ml-auto max-tab:w-[min(20rem,calc(100%-1.4rem))] max-sm:ml-[0.7rem] max-sm:w-auto">
          <div class="flex items-baseline justify-between gap-2 text-[0.85rem] text-muted-foreground">
            <b class="font-display text-[1.05rem] font-[650] tracking-[-0.02em] text-foreground">Thu 19 Nov</b><span>Pick a time</span>
          </div>
          <div role="group" aria-label="Example time slots" class="mt-[0.6rem] grid grid-cols-2 gap-[0.4rem]">
            <button
              v-for="(slot, index) in slots"
              :key="slot"
              type="button"
              class="min-h-11 cursor-pointer rounded-[0.8rem] bg-background px-[0.4rem] text-[0.9rem] font-bold text-foreground shadow-[inset_0_0_0_1px_var(--border)] [transition:transform_0.25s_cubic-bezier(0.22,0.8,0.26,1),background-color_0.2s,color_0.2s] hover:-translate-y-0.5 aria-pressed:bg-primary aria-pressed:text-white"
              :aria-pressed="picked === index"
              @click="picked = index"
            >
              {{ slot }}
            </button>
          </div>
        </div>
      </div>

      <!-- Verification -->
      <div data-rise data-surface="forest" :class="[tile, pad, wide, 'bg-forest text-white']">
        <div :class="[kicker, 'text-lime']">Verification</div>
        <h3 :class="tileTitle">Checked against official records before listing.</h3>
        <ul class="mt-auto grid gap-[0.55rem]">
          <li v-for="check in checks" :key="check" class="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-forest-2 px-[0.9rem] py-[0.7rem] font-semibold">
            <span class="grid size-[1.6rem] flex-none place-items-center rounded-full bg-lime text-forest"><CanopyGlyph name="tick" :size="14" :stroke="3.2" /></span>
            {{ check }}<small class="ml-auto text-[0.8rem] font-semibold text-on-forest">Checked</small>
          </li>
        </ul>
      </div>

      <!-- Messaging -->
      <div data-rise :class="[tile, pad, narrow, 'bg-sand']">
        <div :class="[kicker, 'text-deep']">Messaging</div>
        <h3 :class="tileTitle">Ask first, free.</h3>
        <div class="mt-auto flex flex-col gap-2">
          <p :class="[bubble, 'self-start rounded-bl-[0.3rem] bg-card text-muted-foreground']">My landlord won’t return my deposit. Where do I stand?</p>
          <p :class="[bubble, 'self-end rounded-br-[0.3rem] bg-primary text-white']">Send me the agreement and I’ll tell you your options.</p>
        </div>
      </div>

      <!-- Fees -->
      <div data-rise :class="[tile, pad, narrow, 'border border-border bg-card']">
        <div :class="[kicker, 'text-deep']">Fees</div>
        <div class="mt-auto font-display text-[clamp(4rem,6.4vw,5.6rem)] leading-[0.9] font-[750] tracking-[-0.06em] text-brand">0%</div>
        <h3 :class="tileTitle">commission on your fee.</h3>
        <div aria-hidden="true" class="relative h-[0.9rem] rounded-full bg-primary" />
        <div class="flex flex-wrap justify-between gap-x-2 gap-y-[0.15rem] text-[0.85rem] font-bold"><span>Your lawyer keeps 100%</span><span>getalawyer 0%</span></div>
      </div>

      <!-- Coverage -->
      <div data-rise :class="[tile, pad, wide, 'bg-stone']">
        <div :class="[kicker, 'text-deep']">Coverage</div>
        <h3 :class="tileTitle">Lawyers in all 36 states and the FCT.</h3>
        <p class="text-[1rem] text-muted-foreground">Filter the directory by the state you are in.</p>
        <div class="mt-auto flex flex-wrap gap-[0.4rem] text-[0.88rem] font-semibold">
          <span v-for="state in states" :key="state" class="rounded-full bg-card px-[0.8rem] py-[0.4rem]">{{ state }}</span>
          <span class="rounded-full bg-forest px-[0.8rem] py-[0.4rem] text-white">+ 29 more</span>
        </div>
      </div>
    </div>
  </section>
</template>
