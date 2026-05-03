import type { RouterConfig } from 'nuxt/schema'

/**
 * Ensure in-app navigations like `/#how-it-works` scroll to the target (fixes fixed-header offset via `scroll-mt-*` on the section).
 */
export default {
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 0 }
    }
    return { top: 0 }
  },
} satisfies RouterConfig
