<script setup lang="ts">
/**
 * Sign-in group layout (sign in, create account, forgot password, enter code,
 * new password), in the Canopy design. The form sits on the ground at the
 * left; the brand's forest panel fills the right on wide screens and is left
 * out below the `tab` breakpoint, where the form is the whole page.
 *
 * The two-column shape follows the shadcn-vue `login-02` / `otp-02` blocks
 * (form column plus a cover column hidden on small screens).
 *
 * The panel is built the way the homepage hero is (a photo that fills it and
 * fades into the forest, with product cards on top) but with its own photos,
 * cards and words, and a version for whoever is on the page: a general one for
 * sign in and password recovery, one for clients and one for lawyers when an
 * account is being created, switching as soon as a role is picked.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

type Audience = 'general' | 'client' | 'lawyer'

const PANELS: Record<Audience, {
  photo: string
  /** The photo's real size. Asking the image service for another shape would crop it to the centre before `focus` applies. */
  size: [number, number]
  alt: string
  focus: string
  chip: string
  /** A small product card on the photo; `tags` adds a row of labels under it. */
  card: { icon: 'chat' | 'mail' | 'tick', label: string, value: string, tags?: string[] }
  kicker: string
  title: string
  accent: string
  body: string
}> = {
  general: {
    photo: '/images/canopy/desk.jpg',
    size: [1000, 1100],
    alt: 'A lawyer going through documents with a client at a desk',
    focus: 'object-[42%_30%]',
    chip: 'Private to you and your lawyer',
    card: { icon: 'chat', label: 'New reply', value: 'Your lawyer answered your question' },
    kicker: 'Welcome back',
    title: 'Pick up',
    accent: 'where you left off.',
    body: 'Your conversations, bookings and documents are where you left them.',
  },
  client: {
    photo: '/images/canopy/meet.jpg',
    size: [1200, 800],
    alt: 'A client and a lawyer talking across a table, both smiling',
    focus: 'object-[84%_50%]',
    chip: 'Free to message',
    card: { icon: 'tick', label: 'Verified lawyer', value: 'Family law · Lagos', tags: ['Video', 'Phone', 'In person'] },
    kicker: 'For clients',
    title: 'Ask a lawyer first.',
    accent: 'Decide after.',
    body: 'Write to any lawyer in the directory without paying. A fee comes in only if you book a consultation, and you agree it with the lawyer.',
  },
  lawyer: {
    photo: '/images/canopy/hero.jpg',
    size: [1201, 1800],
    alt: 'A lawyer seated between shelves of law books, smiling',
    focus: 'object-[50%_12%]',
    chip: 'No commission on your fees',
    card: { icon: 'mail', label: 'New enquiry', value: 'Tenancy dispute · Lagos', tags: ['Reply free', 'Offer a consultation'] },
    kicker: 'For lawyers',
    title: 'Clients find you.',
    accent: 'You keep your fees.',
    body: 'A verified profile, messages from clients and bookings, for one membership. Clients pay you directly.',
  },
}

// The create-account page reports the role picked there (client-side only);
// until it does, a `?role=` in the address decides, so the server render and
// the first client render always agree.
const route = useRoute()
const pickedRole = useState<'client' | 'lawyer' | null>('auth-panel-role', () => null)
const audience = computed<Audience>(() => {
  if (route.path !== '/register') return 'general'
  if (pickedRole.value) return pickedRole.value
  return route.query.role === 'lawyer' ? 'lawyer' : route.query.role === 'client' ? 'client' : 'general'
})
const panel = computed(() => PANELS[audience.value])
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
      :aria-label="`getalawyer: ${panel.kicker.toLowerCase()}`"
      data-surface="forest"
      class="sticky top-4 h-[calc(100svh-2rem)] min-h-[36rem] overflow-hidden rounded-[2.5rem] bg-forest text-white max-tab:hidden"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 ease-out"
        leave-to-class="opacity-0"
      >
        <div :key="audience" class="relative flex h-full flex-col justify-between gap-6 p-[clamp(1.5rem,3vw,2.75rem)]">
          <!-- the photo fills the panel and fades into it, as on the homepage hero -->
          <NuxtImg
            :src="panel.photo"
            :width="panel.size[0]"
            :height="panel.size[1]"
            sizes="46vw"
            :alt="panel.alt"
            class="absolute inset-0 size-full object-cover"
            :class="panel.focus"
          />
          <span aria-hidden="true" class="pointer-events-none absolute inset-0 auth-photo-fade" />

          <div class="relative inline-flex items-center gap-2 self-start rounded-full border border-white/14 bg-forest-2 px-[0.9rem] py-[0.4rem] text-[0.85rem] font-semibold">
            <i class="size-2 rounded-full bg-lime" />{{ panel.chip }}
          </div>

          <div class="relative">
            <div aria-hidden="true" class="mb-6 inline-grid max-w-full gap-[0.7rem] rounded-[1.25rem] bg-card p-[0.9rem] text-foreground shadow-widget">
              <div class="flex items-center gap-[0.7rem] pr-2">
                <span class="grid size-10 flex-none place-items-center rounded-full bg-primary text-white">
                  <CanopyGlyph :name="panel.card.icon" :size="18" :stroke="panel.card.icon === 'tick' ? 3.2 : 2" />
                </span>
                <span class="min-w-0 leading-[1.3]">
                  <small class="block text-[0.78rem] font-bold tracking-[0.06em] text-brand uppercase">{{ panel.card.label }}</small>
                  <b class="font-display text-[1.05rem] font-[650] tracking-[-0.02em]">{{ panel.card.value }}</b>
                </span>
              </div>
              <ul v-if="panel.card.tags" class="flex flex-wrap gap-[0.3rem] text-[0.72rem] font-bold tracking-[0.06em] text-deep uppercase">
                <li v-for="tag in panel.card.tags" :key="tag" class="rounded-[0.5rem] border border-border bg-background px-[0.55rem] py-[0.25rem]">{{ tag }}</li>
              </ul>
            </div>

            <div class="text-[0.8125rem] font-bold tracking-[0.08em] text-lime uppercase">{{ panel.kicker }}</div>
            <h2 class="mt-3 max-w-[28rem] text-[clamp(1.9rem,3vw,2.8rem)] leading-[1.02] font-[620] tracking-[-0.04em] text-balance">
              {{ panel.title }} <em class="text-lime not-italic">{{ panel.accent }}</em>
            </h2>
            <p class="mt-[0.9rem] max-w-[30rem] text-on-forest">{{ panel.body }}</p>
          </div>
        </div>
      </Transition>
    </aside>
  </div>
</template>
