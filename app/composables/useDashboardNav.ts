import type { DashboardNavItem } from '@/types/dashboard-nav'
import { useSidebar } from '@/components/ui/sidebar'

export function useDashboardNav() {
  const route = useRoute()
  const { isMobile, setOpenMobile } = useSidebar()

  function normalizePath(path: string) {
    if (path.length > 1 && path.endsWith('/'))
      return path.slice(0, -1)
    return path || '/'
  }

  function isLinkActive(item: DashboardNavItem) {
    const path = route.path
    if (item.exact)
      return path === item.to || path === `${item.to}/`
    return path === item.to || path.startsWith(`${item.to}/`)
  }

  function onSidebarNavClick(targetPath: string, event: MouseEvent) {
    if (isMobile.value)
      setOpenMobile(false)

    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return

    const current = normalizePath(route.path)
    const target = normalizePath(targetPath)

    if (target === current) {
      nextTick(() => {
        const viewport = document.querySelector('[data-slot="scroll-area-viewport"]')
          ?? document.querySelector('[data-dashboard-content]')
        viewport?.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  }

  return {
    isLinkActive,
    onSidebarNavClick,
  }
}
