<script setup lang="ts">
import { computed } from 'vue'
import { PhBriefcase } from '@phosphor-icons/vue'
import { useSpecializations } from '~/composables/useSpecializations'
import { specializationDirectoryHref } from '~/lib/practice-areas'

const HOMEPAGE_PREVIEW_COUNT = 8

const { data: specializations, isPending, isError } = useSpecializations()

const previewAreas = computed(() => {
  const list = specializations.value ?? []
  return [...list]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, HOMEPAGE_PREVIEW_COUNT)
})
</script>

<template>
  <section id="practice" class="bg-muted py-12 md:py-24">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <div class="mb-12 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            Practice areas
          </p>
          <h2 class="max-w-2xl font-heading text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Find a specialist for what you're facing.
          </h2>
        </div>
        <Button variant="outline" as-child class="shrink-0">
          <NuxtLink to="/practice-areas">
            View all areas →
          </NuxtLink>
        </Button>
      </div>

      <div
        v-if="isPending"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-busy="true"
        aria-label="Loading practice areas"
      >
        <div
          v-for="i in HOMEPAGE_PREVIEW_COUNT"
          :key="i"
          class="h-48 animate-pulse rounded-2xl border border-border bg-card"
        />
      </div>

      <p
        v-else-if="isError"
        class="rounded-2xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground"
      >
        Practice areas are temporarily unavailable. You can still
        <NuxtLink to="/find-lawyers" class="font-medium text-primary underline-offset-4 hover:underline">
          browse lawyers
        </NuxtLink>
        directly.
      </p>

      <div
        v-else-if="previewAreas.length === 0"
        class="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground"
      >
        No practice areas are listed yet.
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="area in previewAreas"
          :key="area.id"
          class="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
        >
          <div class="mb-4 flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary transition-colors duration-300 group-hover:bg-primary/10">
              <PhBriefcase class="size-5" weight="duotone" aria-hidden="true" />
            </div>
            <NuxtLink
              :to="specializationDirectoryHref(area.id)"
              class="mt-1 text-base font-semibold leading-snug text-foreground no-underline transition-colors hover:text-primary"
            >
              {{ area.name }}
            </NuxtLink>
          </div>

          <p
            v-if="area.description"
            class="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground"
          >
            {{ area.description }}
          </p>

          <NuxtLink
            :to="specializationDirectoryHref(area.id)"
            class="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary no-underline"
          >
            Find {{ area.name }} lawyers
            <span class="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
