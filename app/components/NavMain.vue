<script setup lang="ts">
import {
  getFilteredNavSections,
  getNavBadgeKey,
  isDashboardNavActive,
  type DashboardNavLink,
} from '@/lib/dashboard-nav'
import { getSessionUserType } from '@/lib/session-user'
import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const route = useRoute()
const { session } = useAuth()
const { isMobile, setOpenMobile } = useSidebar()

const role = computed(() => getSessionUserType(session.value?.user) as 'lawyer' | 'client' | undefined)

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  activeCasesBadge,
  lawyerPendingAppointmentsBadge,
  lawyerSubscriptionBadge,
} = useDashboardNavBadges()

const navSections = computed(() => {
  if (!role.value)
    return null
  return getFilteredNavSections(role.value)
})

const badgeMap = computed<Record<string, string | undefined>>(() => ({
  '/dashboard/bookings': clientUpcomingBookingsBadge.value,
  '/dashboard/messages': unreadMessagesBadge.value,
  '/dashboard/cases': activeCasesBadge.value,
  '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
  '/dashboard/subscription': lawyerSubscriptionBadge.value,
}))

function linkActive(link: DashboardNavLink) {
  return isDashboardNavActive(route.path, link)
}

function linkBadge(link: DashboardNavLink) {
  return badgeMap.value[getNavBadgeKey(link.to)]
}

function navTooltip(link: DashboardNavLink) {
  const badge = linkBadge(link)
  if (badge)
    return `${link.title} (${badge})`
  return link.title
}

function onNavClick() {
  if (isMobile.value)
    setOpenMobile(false)
}
</script>

<template>
  <template v-if="navSections">
    <div class="px-2 pb-2">
      <Button
        as-child
        size="sm"
        class="h-9 w-full cursor-pointer justify-start gap-2 font-semibold shadow-xs"
      >
        <NuxtLink
          :to="navSections.primaryCta.to"
          @click="onNavClick"
        >
          <component
            :is="navSections.primaryCta.icon"
            class="size-4 shrink-0"
            weight="bold"
          />
          <span>{{ navSections.primaryCta.label }}</span>
        </NuxtLink>
      </Button>
    </div>

    <SidebarGroup>
      <SidebarGroupLabel>{{ navSections.main.label }}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem
            v-for="item in navSections.main.items"
            :key="item.to"
          >
            <SidebarMenuButton
              as-child
              :tooltip="navTooltip(item)"
              :is-active="linkActive(item)"
            >
              <NuxtLink
                :to="item.to"
                @click="onNavClick"
              >
                <component
                  :is="item.icon"
                  class="size-4 shrink-0"
                  weight="duotone"
                />
                <span>{{ item.title }}</span>
                <SidebarMenuBadge
                  v-if="linkBadge(item)"
                  class="ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums"
                >
                  {{ linkBadge(item) }}
                </SidebarMenuBadge>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <SidebarGroup>
      <SidebarGroupLabel>{{ navSections.account.label }}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem
            v-for="item in navSections.account.items"
            :key="item.to"
          >
            <SidebarMenuButton
              as-child
              :tooltip="navTooltip(item)"
              :is-active="linkActive(item)"
            >
              <NuxtLink
                :to="item.to"
                @click="onNavClick"
              >
                <component
                  :is="item.icon"
                  class="size-4 shrink-0"
                  weight="duotone"
                />
                <span>{{ item.title }}</span>
                <SidebarMenuBadge
                  v-if="linkBadge(item)"
                  class="ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums"
                >
                  {{ linkBadge(item) }}
                </SidebarMenuBadge>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </template>
</template>
