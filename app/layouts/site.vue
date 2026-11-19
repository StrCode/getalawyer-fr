<script setup lang="ts">
/**
 * Marketing layout in the Canopy design. `canopy` on <body> scopes the design's
 * tokens (see assets/css/canopy.css) to pages on this layout, so teleported
 * menus and dialogs pick them up too and the dashboard stays as it is.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

const route = useRoute()

// Rise-in: sections still below the fold slide up as they arrive. Position only,
// never opacity, so the page is complete without scripts or scrolling.
let io: IntersectionObserver | null = null
function watchRises() {
  io?.disconnect()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.remove('c-wait')
      io?.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  document.querySelectorAll<HTMLElement>('.c-rise').forEach((el, i) => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.style.transitionDelay = `${(i % 4) * 70}ms`
      el.classList.add('c-wait')
      io?.observe(el)
    }
  })
}

onMounted(() => nextTick(watchRises))
onBeforeUnmount(() => io?.disconnect())
watch(() => route.path, () => nextTick(() => setTimeout(watchRises, 350)))
</script>

<template>
  <AppLayout>
    <CanopyHeader />
    <div class="c-wrap">
      <main id="top">
        <slot />
      </main>
      <CanopyFooter />
    </div>
  </AppLayout>
</template>
