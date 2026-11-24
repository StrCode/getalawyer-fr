<script setup lang="ts">

/**
 * Homepage hero, on the dark green panel: the headline, a photo, and the
 * search, which is what the page is for. A short line under the search says
 * what getalawyer is and is not.
 *
 * Wide screens: the photo fills the right side, a little faded, and melts into
 * the green. Phones and tablets: the same photo, blurred, sits behind
 * everything under a deeper green wash, so the search and the photo share the
 * first screen.
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
    data-surface="forest"
    class="relative isolate grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] items-center gap-x-8 md:gap-x-9.5 lg:gap-x-12.75 xl:gap-x-16 gap-y-8 lg:gap-y-9 xl:gap-y-10 tab:content-center overflow-hidden rounded-panel px-5 md:px-8.75 lg:px-11.5 xl:px-14.5 py-7 lg:py-8.75 xl:py-11 tab:min-h-[clamp(34rem,74svh,42rem)] bg-forest text-white max-tab:grid-cols-1 max-sm:rounded-2xl"
  >
    <div class="relative z-2 col-start-1 row-start-1 min-w-0">
      <!-- three lines by design: each span is one line. On phones the size follows
           the screen width so the longest line, "wherever you are.", spans the
           panel: it is 7.14 times the font size wide, and the panel's text is the
           screen less 72px (gutters and padding). 30px at the least, 48px at most. -->
      <h1 class="animate-rise-in text-4xl md:text-5xl lg:text-6xl font-normal leading-none tracking-tighter max-sm:text-[length:clamp(1.875rem,calc(13.8vw_-_10px),3rem)]">
        <span class="block">Find a lawyer</span>
        <em class="block text-lime not-italic">you can trust,</em>
        <span class="block">wherever you are.</span>
      </h1>
      <p class="mt-5.5 max-w-136 animate-rise-in text-lg text-on-forest [animation-delay:80ms]">
        Search verified Nigerian lawyers by practice area and state, compare them, and message one in minutes.
      </p>
    </div>

    <!-- Wide screens: the photo fills the right side of the panel and fades into the green.
         Narrower: the same photo, blurred, behind the whole panel. One image either
         way, so phones download nothing extra (and a smaller copy, as it is blurred). -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 tab:inset-y-0 tab:right-0 tab:left-auto tab:w-1/2">
      <div class="absolute inset-0 overflow-hidden bg-forest tab:animate-photo-in">
        <NuxtImg
          src="/images/canopy/hero-desk.jpg"
          width="1024"
          height="1024"
          sizes="50vw lg:46vw"
          alt=""
          preload
          class="size-full scale-110 object-cover object-[65%_40%] blur-[6px] tab:scale-100 tab:object-[70%_35%] tab:opacity-85 tab:blur-none"
        />
        <span class="absolute inset-0 hidden hero-photo-fade tab:block" />
        <span class="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_51_39/0.5),rgb(11_51_39/0.82))] tab:hidden" />
      </div>
    </div>

    <!-- the search is what the page is for: it is there from the first frame, no entrance.
         Wide screens: it stops about two-thirds across, where the photo becomes solid. -->
    <div class="relative z-2 col-start-1 row-start-2 min-w-0 tab:col-span-2 tab:max-w-216">
      <CanopySearchRail v-model:need="need" v-model:where="where" id-prefix="hero" @submit="search" />
      <p class="mt-4.5 max-w-176 text-sm text-on-forest">
        getalawyer is not a law firm and does not give legal advice. We help you find a lawyer and talk to them.
      </p>
    </div>
  </section>
</template>
