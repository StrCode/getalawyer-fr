import type { RouterConfig } from 'nuxt/schema'

/**
 * Scrolling is left to Nuxt's built-in behaviour, which this file used to
 * replace. The built-in one scrolls to the top on a new page, waits for the
 * new page before scrolling to a `#section` (so "/#how" works from any page,
 * not only from the homepage), stops short by the section's `scroll-mt-*` so
 * the sticky header does not cover it, restores the position on back/forward,
 * and leaves the page where it is when only the query changes (directory
 * filters).
 *
 * The one thing set here is that a jump to a `#section` glides instead of
 * snapping, unless the visitor asked for reduced motion. Page changes and
 * back/forward are instant: there is no `scroll-behavior: smooth` in the CSS,
 * because that made every new page scroll itself to the top after it appeared.
 */
const reducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default {
  scrollBehaviorType: reducedMotion ? 'auto' : 'smooth',
} satisfies RouterConfig
