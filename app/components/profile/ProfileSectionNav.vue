<script setup lang="ts">
export interface ProfileSectionLink {
  id: string
  label: string
  incomplete?: boolean
}

const props = defineProps<{
  sections: ProfileSectionLink[]
  activeId?: string | null
}>()

const activeSection = ref(props.activeId ?? props.sections[0]?.id ?? null)

let sectionObserver: IntersectionObserver | null = null

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  activeSection.value = id
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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

<template>
  <nav
    aria-label="Profile sections"
    class="space-y-1"
  >
    <p class="mb-2 px-3 text-[0.8125rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
      Sections
    </p>
    <button
      v-for="section in sections"
      :key="section.id"
      type="button"
      class="flex min-h-[2.5rem] w-full cursor-pointer items-center gap-2 rounded-[0.9rem] px-3 text-left text-[0.95rem] transition-colors duration-200"
      :class="
        activeSection === section.id
          ? 'bg-mint font-semibold text-deep'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      "
      @click="scrollToSection(section.id)"
    >
      <span class="min-w-0 flex-1 truncate">{{ section.label }}</span>
      <span
        v-if="section.incomplete"
        class="size-1.5 shrink-0 rounded-full bg-amber-500"
        aria-label="Needs attention"
      />
    </button>
  </nav>
</template>
