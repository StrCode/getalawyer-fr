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
  // An invitation says who it is for once it has loaded.
  if (route.path.startsWith('/invite/')) return pickedRole.value ?? 'general'
  if (route.path !== '/register') return 'general'
  if (pickedRole.value) return pickedRole.value
  return route.query.role === 'lawyer' ? 'lawyer' : route.query.role === 'client' ? 'client' : 'general'
})
const panel = computed(() => PANELS[audience.value])
</script>

<template>
  <div class="mx-auto grid min-h-svh max-w-368 grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] gap-4 md:gap-5.75 lg:gap-7.75 xl:gap-9.5 pt-[max(16px,env(safe-area-inset-top,0px))] pb-[max(16px,env(safe-area-inset-bottom,0px))] font-sans safe-x max-tab:grid-cols-1">
    <div class="flex min-w-0 flex-col px-0 md:px-5.75 lg:px-7.75 xl:px-9.5 py-1.5">
      <div class="flex items-center justify-between gap-4">
        <!-- the mark alone: these screens are about the form, and the panel carries the brand -->
        <CanopyBrand condensed large />
        <CanopyThemeToggle />
      </div>

      <main class="m-auto w-[min(100%,25.5rem)] py-10 max-tab:py-8">
        <slot />
      </main>

      <p class="flex justify-center gap-5.5 text-sm text-muted-foreground">
        <NuxtLink to="/privacy" class="inline-flex min-h-11 items-center hover:text-brand">Privacy</NuxtLink>
        <NuxtLink to="/terms" class="inline-flex min-h-11 items-center hover:text-brand">Terms</NuxtLink>
        <NuxtLink to="/contact" class="inline-flex min-h-11 items-center hover:text-brand">Contact</NuxtLink>
      </p>
    </div>

    <aside
      :aria-label="`getalawyer: ${panel.kicker.toLowerCase()}`"
      data-surface="forest"
      class="sticky top-4 h-[calc(100svh-2rem)] min-h-144 overflow-hidden rounded-2xl bg-forest text-white max-tab:hidden"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 ease-out"
        leave-to-class="opacity-0"
      >
        <div :key="audience" class="relative flex h-full flex-col justify-between gap-6 p-6 lg:p-7.75 xl:p-9.5">
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

          <div class="relative inline-flex items-center gap-2 self-start rounded-full border border-white/14 bg-forest-2 px-3.5 py-1.5 text-sm font-medium">
            <i class="size-2 rounded-full bg-lime" />{{ panel.chip }}
          </div>

          <div class="relative">
            <div aria-hidden="true" class="mb-6 inline-grid max-w-full gap-2.75 rounded-card bg-card p-3.5 text-foreground shadow-widget">
              <div class="flex items-center gap-2.75 pr-2">
                <span class="grid size-10 flex-none place-items-center rounded-full bg-primary text-white">
                  <CanopyGlyph :name="panel.card.icon" :size="18" :stroke="panel.card.icon === 'tick' ? 3.2 : 2" />
                </span>
                <span class="min-w-0 leading-tight">
                  <small class="block text-xs font-medium tracking-wider text-brand uppercase">{{ panel.card.label }}</small>
                  <b class="font-display text-base font-normal tracking-tight">{{ panel.card.value }}</b>
                </span>
              </div>
              <ul v-if="panel.card.tags" class="flex flex-wrap gap-1.25 text-xs font-medium tracking-wider text-deep uppercase">
                <li v-for="tag in panel.card.tags" :key="tag" class="rounded-md border border-border bg-background px-2.25 py-1">{{ tag }}</li>
              </ul>
            </div>

            <div class="text-sm font-medium tracking-widest text-lime uppercase">{{ panel.kicker }}</div>
            <h2 class="mt-3 max-w-112 text-3xl md:text-4xl leading-none font-normal tracking-tighter text-balance">
              {{ panel.title }} <em class="text-lime not-italic">{{ panel.accent }}</em>
            </h2>
            <p class="mt-3.5 max-w-120 text-on-forest">{{ panel.body }}</p>
          </div>
        </div>
      </Transition>
    </aside>
  </div>
</template>
