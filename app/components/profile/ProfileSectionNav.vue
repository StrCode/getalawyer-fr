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
    aria-label="Listing sections"
    class="space-y-1"
  >
    <p class="mb-3 eyebrow text-muted-foreground">
      Sections
    </p>
    <button
      v-for="section in sections"
      :key="section.id"
      type="button"
      class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
      :class="
        activeSection === section.id
          ? 'bg-primary/10 font-medium text-primary'
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
