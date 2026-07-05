<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import type { RecentLawyerDirectoryEntry } from '~/composables/useRecentLawyerDirectorySearches'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'
import {
  DIRECTORY_COMMAND_SUGGESTIONS,
  useRecentLawyerDirectorySearches,
} from '~/composables/useRecentLawyerDirectorySearches'

const open = ref(false)

const { listDisplay, pushRecentLawyerDirectorySearch, hasStoredSearches } = useRecentLawyerDirectorySearches()

const recentRows = ref<RecentLawyerDirectoryEntry[]>([])

watch(open, (v) => {
  if (v)
    recentRows.value = listDisplay()
})

const isAppleOs = computed(
  () => import.meta.client && typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent ?? ''),
)

function close() {
  open.value = false
}

function goLawyers(
  partial: Partial<Pick<RecentLawyerDirectoryEntry, 'keywords' | 'location' | 'consultationTypes' | 'practiceAreas'>>,
  record = true,
) {
  close()
  const q = lawyersListingQueryFromParts({
    keywords: partial.keywords,
    location: partial.location,
    consultationTypes: partial.consultationTypes,
    practiceAreas: partial.practiceAreas,
  })
  if (record) {
    pushRecentLawyerDirectorySearch({
      keywords: partial.keywords ?? '',
      location: partial.location ?? '',
      consultationTypes: partial.consultationTypes ?? [],
      practiceAreas: partial.practiceAreas ?? [],
    })
  }
  navigateTo({ path: '/find-lawyers', query: q })
}

function navLawyersAll() {
  close()
  navigateTo({ path: '/find-lawyers' })
}

function navPracticeAreas() {
  close()
  navigateTo({ path: '/practice-areas' })
}

function navForLawyers() {
  close()
  navigateTo({ path: '/for-lawyers' })
}

function rowSubtitle(row: RecentLawyerDirectoryEntry): string {
  const bits = [
    row.location || null,
    row.practiceAreas.length ? `${row.practiceAreas.length} specialty filter(s)` : null,
    row.consultationTypes.length ? `${row.consultationTypes.join(', ')}` : null,
  ].filter(Boolean)
  return bits.length ? bits.join(' · ') : 'Directory search'
}

onMounted(() => {
  const toggle = (e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey) || String(e.key).toLowerCase() !== 'k')
      return
    e.preventDefault()
    open.value = !open.value
  }
  window.addEventListener('keydown', toggle)
  onUnmounted(() => window.removeEventListener('keydown', toggle))
})
</script>

<template>
  <CommandDialog
    v-model:open="open"
    title="Lawyer directory"
    description="Search the directory, open marketing pages, or repeat a saved search."
  >
    <CommandInput placeholder="Topics, navigation, repeats…" />
    <CommandList class="max-h-[min(50vh,24rem)]">
      <CommandEmpty>No matches.</CommandEmpty>

      <p
        class="flex items-center gap-3 border-neutral-900/15 border-b px-3 py-2.5 dark:border-border"
      >
        <span class="grow text-muted-foreground text-xs leading-snug">
          <span class="font-medium text-foreground">Designer sample data</span>
          — recent rows are mocked until you search; your last five replace them in this browser.
          Open again with
          <span class="font-medium text-foreground">{{ isAppleOs ? '⌘K' : 'Ctrl K' }}</span>.
        </span>
        <kbd
          class="hidden shrink-0 rounded border border-muted-foreground/25 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block"
        >
          {{ isAppleOs ? '⌘ K' : 'Ctrl K' }}
        </kbd>
      </p>

      <CommandGroup heading="Recent">
        <p
          v-if="!hasStoredSearches()"
          class="mx-3 mb-1 text-muted-foreground text-[11px] leading-relaxed italic"
        >
          Nothing saved yet — these are placeholders until you search on the directory or from the homepage.
        </p>
        <CommandItem
          v-for="row in recentRows"
          :key="row.id"
          :value="`${row.keywords} recent ${row.id}`"
          class="rounded-md"
          @select="goLawyers({
            keywords: row.keywords,
            location: row.location,
            consultationTypes: row.consultationTypes,
            practiceAreas: row.practiceAreas,
          })"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ row.keywords || 'Browse (filters only)' }}</p>
            <p class="truncate text-muted-foreground text-xs">
              {{ rowSubtitle(row) }}
            </p>
          </div>
          <CommandShortcut>↵</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Suggestions">
        <CommandItem
          v-for="sugg in DIRECTORY_COMMAND_SUGGESTIONS"
          :key="sugg.id"
          :value="`${sugg.caption} ${sugg.keywords}`"
          class="rounded-md"
          @select="goLawyers({
            keywords: sugg.keywords,
            location: sugg.location,
            consultationTypes: sugg.consultationTypes,
            practiceAreas: sugg.practiceAreas,
          })"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate">{{ sugg.caption }}</p>
            <p class="truncate text-muted-foreground text-xs">
              {{ sugg.keywords }}
            </p>
          </div>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Navigate">
        <CommandItem
          value="Open lawyer directory"
          class="rounded-md"
          @select="navLawyersAll"
        >
          Lawyer directory (all)
        </CommandItem>
        <CommandItem
          value="Practice areas"
          class="rounded-md"
          @select="navPracticeAreas"
        >
          Browse practice areas
          <AppIcon :icon="appIcons.arrowSquareOut" class="ml-auto opacity-60" aria-hidden="true" />
        </CommandItem>
        <CommandItem
          value="For Lawyers"
          class="rounded-md"
          @select="navForLawyers"
        >
          For lawyers programme
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
