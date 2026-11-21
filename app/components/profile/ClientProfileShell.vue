<template>
  <div class="flex w-full flex-col gap-4 lg:gap-5 xl:gap-6 xl:flex-row">
    <aside class="hidden xl:block xl:w-56 xl:shrink-0">
      <div class="sticky top-21 space-y-4">
        <nav
          class="rounded-card border border-border bg-card p-3"
          aria-label="Profile sections"
        >
          <ul class="space-y-0.5">
            <li
              v-for="section in sections"
              :key="section.id"
            >
              <button
                type="button"
                class="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-3 text-left text-sm transition-colors duration-200"
                :class="activeSection === section.id
                  ? 'bg-mint font-medium text-deep'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
                @click="scrollToSection(section.id)"
              >
                <HugeiconsIcon
                  v-if="section.icon"
                  :icon="section.icon"
                  class="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span class="truncate">{{ section.label }}</span>
              </button>
            </li>
          </ul>
        </nav>

        <slot name="sidebar" />
      </div>
    </aside>

    <div class="min-w-0 flex-1 space-y-6">
      <!-- the select draws no box of its own, so it is hidden from a wrapper; wide screens have the list beside -->
      <div class="xl:hidden">
        <ProfileMobileSectionSelect
          v-model="mobileSection"
          :sections="sections"
        />
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hugeicon } from '@/lib/icon-types'
import { HugeiconsIcon } from '@hugeicons/vue'
import ProfileMobileSectionSelect from '@/components/profile/ProfileMobileSectionSelect.vue'

export interface ClientProfileShellSection {
  id: string
  label: string
  icon?: Hugeicon
}

const props = defineProps<{
  sections: ClientProfileShellSection[]
}>()

const mobileSection = ref(props.sections[0]?.id ?? '')
const activeSection = ref(props.sections[0]?.id ?? '')

let sectionObserver: IntersectionObserver | null = null

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  activeSection.value = id
  mobileSection.value = id
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(mobileSection, (id) => {
  if (id) activeSection.value = id
})

onMounted(() => {
  if (!import.meta.client || props.sections.length === 0) return

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

      const top = visible[0]
      if (top?.target.id) {
        activeSection.value = top.target.id
        mobileSection.value = top.target.id
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] },
  )

  for (const section of props.sections) {
    const el = document.getElementById(section.id)
    if (el) sectionObserver.observe(el)
  }
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  sectionObserver = null
})
</script>
