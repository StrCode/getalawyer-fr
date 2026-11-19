<script setup lang="ts">
/**
 * Marketing layout in the Canopy design. `canopy` on <body> scopes the design's
 * tokens (see assets/css/canopy.css) to pages on this layout, so teleported
 * menus and dialogs pick them up too and the dashboard stays as it is.
 *
 * Rise-in: any element with `data-rise` that is still below the fold slides up
 * a little as it arrives. Nothing else is needed on the element.
 */
useHead({ bodyAttrs: { class: 'canopy' } })

const route = useRoute()

// Rise-in: sections still below the fold slide up as they arrive. Position only,
// never opacity, so the page is complete without scripts or scrolling.
//
// Each element gets its own short animation of the `transform` property. Hover
// lifts use `translate` and `scale`, so the two never share a transition: this
// used to be a 900ms CSS transition on the element, which every hover then
// inherited (cards took 0.9s to lift, after a leftover stagger delay).
const RISE = { distance: 16, duration: 550, stagger: 70, easing: 'cubic-bezier(0.22, 0.8, 0.26, 1)' }
let io: IntersectionObserver | null = null
const waiting = new Map<Element, Animation>()
function watchRises() {
  io?.disconnect()
  for (const animation of waiting.values()) animation.cancel()
  waiting.clear()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const animation = waiting.get(entry.target)
      waiting.delete(entry.target)
      io?.unobserve(entry.target)
      if (!animation) continue
      animation.play()
      // Done: drop it, so the element is left exactly as its classes describe.
      void animation.finished.then(() => animation.cancel()).catch(() => {})
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  document.querySelectorAll<HTMLElement>('[data-rise]').forEach((el, i) => {
    if (el.getBoundingClientRect().top <= window.innerHeight) return
    // Paused on its first frame: the element waits a little below where it belongs.
    const animation = el.animate(
      [{ transform: `translateY(${RISE.distance}px)` }, { transform: 'none' }],
      { duration: RISE.duration, delay: (i % 4) * RISE.stagger, easing: RISE.easing, fill: 'both' },
    )
    animation.pause()
    waiting.set(el, animation)
    io?.observe(el)
  })
}

onMounted(() => nextTick(watchRises))
onBeforeUnmount(() => {
  io?.disconnect()
  for (const animation of waiting.values()) animation.cancel()
})
watch(() => route.path, () => nextTick(() => setTimeout(watchRises, 350)))
</script>

<template>
  <AppLayout>
    <CanopyHeader />
    <div class="mx-auto max-w-site safe-x">
      <main id="top">
        <slot />
      </main>
      <CanopyFooter />
    </div>
  </AppLayout>
</template>
