<script setup lang="ts">

/**
 * Homepage hero, on a white panel: the headline, a photo, and the search, which
 * is what the page is for. A short line under the search says what getalawyer
 * is and is not.
 */

const need = ref('')
const where = ref('')
function directoryLink(keywords?: string, location?: string) {
  const query: Record<string, string> = {}
  if (keywords?.trim()) query.keywords = keywords.trim()
  if (location) query.location = location
  return { path: '/find-lawyers', query }
}

function search() {
  return navigateTo(directoryLink(need.value, where.value))
}
</script>

<template>
  <section
    class="relative grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] items-center gap-x-8 md:gap-x-9.5 lg:gap-x-12.75 xl:gap-x-16 gap-y-9 lg:gap-y-10.25 xl:gap-y-12.75 overflow-hidden rounded-panel px-5 md:px-8.75 lg:px-11.5 xl:px-14.5 py-7 lg:py-8.75 xl:py-11 tab:min-h-[clamp(34rem,74svh,42rem)] border border-border bg-card text-foreground max-tab:grid-cols-1 max-sm:rounded-2xl"
  >
    <div class="col-start-1 row-start-1 min-w-0 tab:relative tab:z-2">
      <!-- three lines by design: each span is one line. On phones the size follows
           the screen width so the longest line still fits on one. -->
      <h1 class="animate-rise-in text-4xl md:text-5xl lg:text-6xl font-normal leading-none tracking-tighter max-sm:text-3xl">
        <span class="block">Find a lawyer</span>
        <em class="block text-brand not-italic">you can trust,</em>
        <span class="block">wherever you are.</span>
      </h1>
      <p class="mt-5.5 max-w-136 animate-rise-in text-lg text-muted-foreground [animation-delay:80ms]">
        Search verified Nigerian lawyers by practice area and state, compare them, and message one in minutes.
      </p>
    </div>

    <!-- Wide screens: the photo fills the right side of the panel and fades into it.
         Narrower: a framed photo below the search. -->
    <div class="relative col-start-1 row-start-3 mx-auto w-[min(100%,22.5rem)] pt-2 tab:absolute tab:inset-y-0 tab:right-0 tab:left-auto tab:col-auto tab:row-auto tab:m-0 tab:w-1/2 tab:max-w-none tab:p-0">
      <div class="relative aspect-4/5 max-w-full animate-photo-in overflow-hidden rounded-2xl bg-muted tab:absolute tab:inset-0 tab:aspect-auto tab:rounded-none">
        <NuxtImg
          src="/images/canopy/hero.jpg"
          width="1201"
          height="1800"
          sizes="100vw lg:46vw"
          alt="A lawyer seated between shelves of law books, smiling"
          preload
          class="size-full object-cover tab:object-[50%_10%]"
        />
        <span aria-hidden="true" class="pointer-events-none absolute inset-0 hidden hero-photo-fade tab:block" />
      </div>
    </div>

    <!-- the search is what the page is for: it is there from the first frame, no entrance.
         Wide screens: it stops about two-thirds across, where the photo becomes solid. -->
    <div class="col-start-1 row-start-2 min-w-0 tab:relative tab:z-2 tab:col-span-2 tab:max-w-216">
      <CanopySearchRail v-model:need="need" v-model:where="where" id-prefix="hero" on-light @submit="search" />
      <p class="mt-4.5 max-w-176 text-sm text-muted-foreground">
        getalawyer is not a law firm and does not give legal advice. We help you find a lawyer and talk to them.
      </p>
    </div>
  </section>
</template>
