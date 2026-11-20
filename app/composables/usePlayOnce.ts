/**
 * Small product views that fill in once as their section scrolls into view
 * (the homepage's "How it works", the For lawyers page).
 *
 * Bind `target` to the element that holds the views. Each piece of a view gets
 * `v-bind="piece(at)"`: it waits hidden, then arrives `at` milliseconds into
 * the sequence. Nothing loops. With reduced motion, without
 * IntersectionObserver, or when the page opens already on the section, nothing
 * is hidden and the views are simply shown complete.
 */

// How a piece waits and how it arrives (full strings, so Tailwind sees them).
const WAITING = {
  step: 'opacity-0',
  pop: 'opacity-0',
  type: '[clip-path:inset(0_100%_0_0)]',
  draw: 'scale-x-0',
} as const
const ARRIVING = {
  step: 'animate-step-in',
  pop: 'animate-pop-in',
  type: 'animate-type-in',
  draw: 'animate-draw-in',
} as const

export type PlayOncePiece = keyof typeof WAITING

export function usePlayOnce(options: { threshold?: number } = {}) {
  const target = ref<HTMLElement | null>(null)
  /** Pieces are hidden, waiting for the section to arrive. */
  const armed = ref(false)
  const played = ref(false)
  let io: IntersectionObserver | null = null

  onMounted(() => {
    const el = target.value
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Already on screen (a link straight to the section): leave it still rather than blank it and replay.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return
    armed.value = true
    io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      played.value = true
      io?.disconnect()
    }, { threshold: options.threshold ?? 0.35 })
    io.observe(el)
  })
  onBeforeUnmount(() => io?.disconnect())

  /** Bindings for one piece: arrives `at` milliseconds into the sequence. */
  function piece(at: number, how: PlayOncePiece = 'step') {
    if (!armed.value) return {}
    if (!played.value) return { class: WAITING[how] }
    return { class: ARRIVING[how], style: { animationDelay: `${at}ms` } }
  }
  /** A button that dips as if pressed, `at` milliseconds in; it is never hidden. */
  function press(at: number) {
    return played.value ? { class: 'animate-press', style: { animationDelay: `${at}ms` } } : {}
  }

  return { target, played, piece, press }
}
