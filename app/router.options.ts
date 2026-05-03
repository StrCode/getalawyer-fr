import type { RouterConfig } from 'nuxt/schema'

/**
 * Ensure in-app navigations like `/#how-it-works` scroll to the target (fixes fixed-header offset via `scroll-mt-*` on the section).
 */
export default {
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 0 }
    }
    // Same-route query tweaks (directories, pagination); don't jump to top.
    if (from && to.path === from.path && !to.hash) {
      return false
    }
    return { top: 0 }
  },
} satisfies RouterConfig
