<script setup lang="ts">
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { isWorkspaceLinkActive, workspaceNavFor, workspaceTabs, type WorkspaceLink } from '~/lib/workspace-nav'
import { getSessionUserType } from '~/lib/session-user'

/**
 * The dashboard's navigation on phones and small tablets: a tab bar along the
 * bottom, where a thumb reaches. When there are more places than tabs (a
 * lawyer's Practice and account pages), the last tab is "More" and opens a
 * sheet with the rest.
 */
const route = useRoute()
const { session } = useAuth()
const role = computed(() => getSessionUserType(session.value?.user) as 'lawyer' | 'client' | undefined)
const layout = computed(() => workspaceTabs(workspaceNavFor(role.value)))

const {
  clientUpcomingBookingsBadge,
  unreadMessagesBadge,
  lawyerPendingAppointmentsBadge,
  lawyerSubscriptionBadge,
} = useDashboardNavBadges()

function countFor(link: WorkspaceLink): string | undefined {
  const badges: Record<string, { label: string } | undefined> = {
    '/dashboard/bookings': clientUpcomingBookingsBadge.value,
    '/dashboard/messages': unreadMessagesBadge.value,
    '/dashboard/appointments': lawyerPendingAppointmentsBadge.value,
  }
  return badges[link.to]?.label
}

const active = (link: WorkspaceLink) => isWorkspaceLinkActive(route.path, link)
const moreOpen = ref(false)
const moreActive = computed(() => layout.value.more.some(active))
const needsAttention = (link: WorkspaceLink) => link.to === '/dashboard/subscription' && Boolean(lawyerSubscriptionBadge.value)
const moreAttention = computed(() => layout.value.more.some(needsAttention))

// The sheet closes when a link in it is followed.
watch(() => route.fullPath, () => { moreOpen.value = false })

const tab = 'relative flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.75 rounded-lg px-1 text-xs font-medium text-muted-foreground transition-colors duration-200 aria-[current=page]:bg-mint aria-[current=page]:text-deep'
</script>

<template>
  <nav
    v-if="layout.tabs.length"
    aria-label="Dashboard"
    class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-2 pt-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] backdrop-blur-[16px] backdrop-saturate-[1.4]"
  >
    <div class="mx-auto flex max-w-136 gap-1">
      <NuxtLink
        v-for="link in layout.tabs"
        :key="link.to"
        :to="link.to"
        :class="tab"
        :aria-current="active(link) ? 'page' : undefined"
      >
        <span class="relative">
          <CanopyGlyph :name="link.icon" :size="21" />
          <span v-if="countFor(link)" class="absolute -top-1.75 -right-3 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-xs leading-4.5 font-medium text-white">
            {{ countFor(link) }}<span class="sr-only"> waiting</span>
          </span>
        </span>
        <span class="max-w-full truncate" :aria-label="link.label">{{ link.short ?? link.label }}</span>
      </NuxtLink>

      <button
        v-if="layout.more.length"
        type="button"
        :class="[tab, moreActive ? 'bg-mint text-deep' : '']"
        aria-haspopup="dialog"
        :aria-expanded="moreOpen"
        @click="moreOpen = true"
      >
        <span class="relative">
          <CanopyGlyph name="menu" :size="21" />
          <span v-if="moreAttention" class="absolute -top-0.75 -right-1.75 size-2.5 rounded-full border-2 border-card bg-warning"><span class="sr-only">Something needs attention</span></span>
        </span>
        <span>More</span>
      </button>
    </div>

    <Sheet v-model:open="moreOpen">
      <SheetContent side="bottom" class="canopy rounded-t-2xl border-border bg-card px-3 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] font-sans text-foreground">
        <SheetHeader class="px-2 pb-1 text-left">
          <SheetTitle class="font-display text-base font-normal tracking-tight">More</SheetTitle>
          <SheetDescription class="sr-only">The rest of your dashboard's pages.</SheetDescription>
        </SheetHeader>
        <ul class="grid gap-0.5">
          <li v-for="link in layout.more" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="flex min-h-13 items-center gap-3 rounded-lg px-3 text-sm font-medium aria-[current=page]:bg-mint aria-[current=page]:font-medium aria-[current=page]:text-deep"
              :aria-current="active(link) ? 'page' : undefined"
            >
              <CanopyGlyph :name="link.icon" :size="20" class="text-muted-foreground" />
              {{ link.label }}
              <span v-if="needsAttention(link)" class="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-warning-subtle-foreground"><i class="size-2 rounded-full bg-warning" />Needs attention</span>
            </NuxtLink>
          </li>
        </ul>
        <div class="mt-3 border-t border-border px-2 pt-3">
          <ClientOnly><CanopyThemeSwitch block /></ClientOnly>
        </div>
      </SheetContent>
    </Sheet>
  </nav>
</template>
