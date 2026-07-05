<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import {
  filterNavForRole,
  getDashboardNavForRole,
  getNavBadgeKey,
  isDashboardNavActive,
  isDashboardNavGroupActive,
  type DashboardNavEntry,
  type DashboardNavLink,
} from '@/lib/dashboard-nav'
import { getSessionUserType } from '@/lib/session-user'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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

const navEntries = computed(() => {
  if (!role.value)
    return []
  const entries = getDashboardNavForRole(role.value)
  if (!entries)
    return []
  return filterNavForRole(entries, role.value)
})

const badgeMap = computed<Record<string, string | undefined>>(() => ({
  '/dashboard/bookings': clientUpcomingBookingsBadge.value,
  '/dashboard/messages': unreadMessagesBadge.value,
  '/dashboard/cases': activeCasesBadge.value,
  '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
  '/dashboard/subscription': lawyerSubscriptionBadge.value,
}))

const groupOpen = reactive<Record<string, boolean>>({})

watch(
  () => route.fullPath,
  () => {
    for (const entry of navEntries.value) {
      if (entry.type === 'group' && isDashboardNavGroupActive(route.path, entry.items))
        groupOpen[entry.title] = true
    }
  },
  { immediate: true },
)

function onNavClick() {
  if (isMobile.value)
    setOpenMobile(false)
}

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

function groupActive(entry: Extract<DashboardNavEntry, { type: 'group' }>) {
  return isDashboardNavGroupActive(route.path, entry.items)
}

function isGroupExpanded(entry: Extract<DashboardNavEntry, { type: 'group' }>) {
  return groupActive(entry) || groupOpen[entry.title] === true
}

function setGroupExpanded(entry: Extract<DashboardNavEntry, { type: 'group' }>, open: boolean) {
  groupOpen[entry.title] = open
}
</script>

<template>
  <SidebarGroup v-if="navEntries.length">
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <template v-for="entry in navEntries" :key="entry.title">
          <SidebarMenuItem v-if="entry.type === 'link'">
            <SidebarMenuButton
              as-child
              :tooltip="navTooltip(entry)"
              :is-active="linkActive(entry)"
            >
              <NuxtLink :to="entry.to" @click="onNavClick">
                <AppIcon v-if="entry.icon" :icon="entry.icon" />
                <span>{{ entry.title }}</span>
                <SidebarMenuBadge
                  v-if="linkBadge(entry)"
                  class="ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums"
                >
                  {{ linkBadge(entry) }}
                </SidebarMenuBadge>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem v-else>
            <Collapsible
              :open="isGroupExpanded(entry)"
              class="group/collapsible"
              @update:open="setGroupExpanded(entry, $event)"
            >
              <CollapsibleTrigger as-child>
                <SidebarMenuButton :tooltip="entry.title" :is-active="groupActive(entry)">
                  <AppIcon :icon="entry.icon" />
                  <span>{{ entry.title }}</span>
                  <AppIcon
                    :icon="appIcons.caretRight"
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="item in entry.items" :key="item.title">
                    <SidebarMenuSubButton as-child :is-active="linkActive(item)">
                      <NuxtLink :to="item.to" @click="onNavClick">
                        <AppIcon v-if="item.icon" :icon="item.icon" />
                        <span>{{ item.title }}</span>
                        <SidebarMenuBadge
                          v-if="linkBadge(item)"
                          class="ml-auto rounded-full border-0 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums"
                        >
                          {{ linkBadge(item) }}
                        </SidebarMenuBadge>
                      </NuxtLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </template>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
