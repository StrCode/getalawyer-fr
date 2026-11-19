<script setup lang="ts">
/**
 * Sign-in group layout (sign in, create account, forgot password, enter code,
 * new password), in the Canopy design. The form sits on the ground at the
 * left; the brand's forest panel fills the right on wide screens and is left
 * out below the `tab` breakpoint, where the form is the whole page.
 *
 * The two-column shape follows the shadcn-vue `login-02` / `otp-02` blocks
 * (form column plus a cover column hidden on small screens).
 */
useHead({ bodyAttrs: { class: 'canopy' } })

const proof = ['Free to message', 'No commission on fees', 'All 36 states + FCT']
</script>

<template>
  <div class="mx-auto grid min-h-svh max-w-[92rem] grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] gap-[clamp(1rem,3vw,2.5rem)] pt-[max(16px,env(safe-area-inset-top,0px))] pb-[max(16px,env(safe-area-inset-bottom,0px))] font-text safe-x max-tab:grid-cols-1">
    <div class="flex min-w-0 flex-col px-[clamp(0rem,3vw,2.5rem)] py-[0.4rem]">
      <div class="flex items-center justify-between gap-4">
        <!-- the mark alone: these screens are about the form, and the panel carries the brand -->
        <CanopyBrand condensed large />
        <CanopyThemeToggle />
      </div>

      <main class="m-auto w-[min(100%,25.5rem)] py-10 max-tab:py-8">
        <slot />
      </main>

      <p class="flex justify-center gap-[1.4rem] text-[0.85rem] text-muted-foreground">
        <NuxtLink to="/privacy" class="inline-flex min-h-11 items-center hover:text-brand">Privacy</NuxtLink>
        <NuxtLink to="/terms" class="inline-flex min-h-11 items-center hover:text-brand">Terms</NuxtLink>
        <NuxtLink to="/contact" class="inline-flex min-h-11 items-center hover:text-brand">Contact</NuxtLink>
      </p>
    </div>

    <aside
      aria-label="About getalawyer"
      data-surface="forest"
      class="sticky top-4 flex h-[calc(100svh-2rem)] min-h-[36rem] flex-col justify-between gap-6 overflow-hidden rounded-[2.5rem] bg-forest p-[clamp(1.5rem,3vw,2.75rem)] text-white max-tab:hidden"
    >
      <!-- the photo fills the panel and fades into it, as on the homepage hero -->
      <NuxtImg
        src="/images/canopy/hero.jpg"
        width="1201"
        height="1800"
        sizes="46vw"
        alt="A lawyer seated between shelves of law books, smiling"
        class="absolute inset-0 size-full object-cover object-[50%_12%]"
      />
      <span aria-hidden="true" class="pointer-events-none absolute inset-0 auth-photo-fade" />

      <div class="relative flex items-start justify-between gap-4">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/14 bg-forest-2 px-[0.9rem] py-[0.4rem] text-[0.85rem] font-semibold">
          <i class="size-2 rounded-full bg-lime" />Every lawyer NIN &amp; SCN verified
        </div>
        <div aria-hidden="true" class="relative size-[6rem] flex-none">
          <svg viewBox="0 0 120 120" class="size-full animate-seal">
            <defs><path id="auth-seal-ring" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" /></defs>
            <circle cx="60" cy="60" r="59" fill="#CDF36B" />
            <text font-size="10.5" font-weight="700" letter-spacing="2.1" fill="#0B3327"><textPath href="#auth-seal-ring">NIN VERIFIED · SCN VERIFIED · </textPath></text>
          </svg>
          <div class="absolute inset-0 grid place-items-center text-forest"><CanopyGlyph name="tick" :size="28" :stroke="3" /></div>
        </div>
      </div>

      <div class="relative">
        <div aria-hidden="true" class="mb-6 inline-flex items-center gap-[0.7rem] rounded-[1.25rem] bg-card px-4 py-[0.8rem] text-[0.95rem] font-semibold text-foreground shadow-widget">
          <span class="grid size-9 flex-none place-items-center rounded-full bg-mint text-deep"><CanopyGlyph name="calendar" :size="18" /></span>
          <span><small class="block text-[0.78rem] font-normal text-muted-foreground">Consultation booked</small>Thu, 10:30 AM</span>
        </div>
        <h2 class="max-w-[26rem] text-[clamp(1.9rem,3vw,2.8rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
          Legal help <em class="text-lime not-italic">without the runaround.</em>
        </h2>
        <ul class="mt-[1.1rem] flex flex-wrap gap-x-5 gap-y-2 text-[0.78rem] font-bold tracking-[0.08em] uppercase">
          <li v-for="item in proof" :key="item" class="inline-flex items-center gap-[0.45rem]">
            <CanopyGlyph name="tick" :stroke="3" class="flex-none text-lime" />{{ item }}
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>
