import type { RouterConfig } from 'nuxt/schema'

/**
 * Scrolling is left to Nuxt's built-in behaviour, which this file used to
 * replace. The built-in one waits for the new page before scrolling to a
 * `#section` (so "/#how" works from any page, not only from the homepage),
 * stops short by the section's `scroll-mt-*` so the sticky header does not
 * cover it, restores the position on back/forward, and leaves the page where
 * it is when only the query changes (directory filters). The one thing set
 * here is that jumps to a section glide instead of snapping.
 */
export default {
  scrollBehaviorType: 'smooth',
} satisfies RouterConfig
