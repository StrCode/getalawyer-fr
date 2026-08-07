<script setup lang="ts">
import { AlertCircleIcon, ArrowRight01Icon, Briefcase01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref } from 'vue'
import { useSpecializations } from '~/composables/useSpecializations'
import { specializationDirectoryHref } from '~/lib/practice-areas'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Practice Areas — getalawyer',
  description: 'Browse all legal practice areas. Find specialized, verified Nigerian lawyers for your specific legal needs.',
})

const searchQuery = ref('')
const { data: specializations, isPending, isError } = useSpecializations()

const sortedAreas = computed(() => {
  const list = specializations.value ?? []
  return [...list].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured)
      return a.isFeatured ? -1 : 1
    return a.name.localeCompare(b.name)
  })
})

const filteredAreas = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query)
    return sortedAreas.value

  return sortedAreas.value.filter((area) => {
    if (area.name.toLowerCase().includes(query))
      return true
    return area.description?.toLowerCase().includes(query)
  })
})
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <section class="relative overflow-hidden border-b border-background/20 bg-foreground section-y-lg">
      <div class="pointer-events-none absolute -top-32 right-0 size-[480px] rounded-full bg-primary/10 blur-3xl" />

      <div class="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
        <p class="mb-4 eyebrow text-primary">
          Directory
        </p>
       <h1 class="mb-4 text-4xl font-medium text-background md:text-5xl">
          Practice Areas
        </h1>
        <p class="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-background/70">
          Find verified specialists for any legal situation. Search our practice areas below.
        </p>

        <div class="group relative mx-auto max-w-lg">
          <div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-muted-foreground">
            <HugeiconsIcon :icon="Search01Icon" class="size-5" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for a legal issue or specialty..."
            class="w-full rounded-xl border border-border bg-card py-4 pr-6 pl-12 text-base text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pt-16 md:px-8">
      <div
        v-if="isPending"
        class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy="true"
        aria-label="Loading practice areas"
      >
        <Skeleton
          v-for="i in 8"
          :key="i"
          class="h-44 rounded-2xl"
        />
      </div>

      <div
        v-else-if="isError"
        class="py-20 text-center"
      >
        <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-primary">
          <HugeiconsIcon :icon="AlertCircleIcon" class="size-6" />
        </div>
       <h3 class="mb-2 text-lg font-semibold text-foreground">
          Could not load practice areas
        </h3>
        <p class="text-sm text-muted-foreground">
          Please try again later or
          <NuxtLink to="/find-lawyers" class="font-medium text-primary underline-offset-4 hover:underline">
            browse all lawyers
          </NuxtLink>.
        </p>
      </div>

      <div
        v-else-if="filteredAreas.length === 0"
        class="py-20 text-center"
      >
        <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-primary">
          <HugeiconsIcon :icon="AlertCircleIcon" class="size-6" />
        </div>
       <h3 class="mb-2 text-lg font-semibold text-foreground">
          No practice areas found
        </h3>
        <p class="text-sm text-muted-foreground">
          We couldn't find anything matching "{{ searchQuery }}".
        </p>
      </div>

      <div
        v-else
        class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <NuxtLink
          v-for="area in filteredAreas"
          :key="area.id"
          :to="specializationDirectoryHref(area.id)"
          class="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-foreground no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
        >
          <div class="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
            <HugeiconsIcon :icon="Briefcase01Icon" class="size-5" aria-hidden="true" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
           <h3 class="text-base leading-tight font-semibold text-foreground">
              {{ area.name }}
            </h3>
            <Badge
              v-if="area.isFeatured"
              variant="secondary"
              class="shrink-0"
            >
              Featured
            </Badge>
          </div>
          <p
            v-if="area.description"
            class="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
          >
            {{ area.description }}
          </p>
          <div class="mt-auto flex -translate-x-2 items-center gap-1.5 pt-2 text-sm font-medium text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            View lawyers
            <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4" />
          </div>
        </NuxtLink>
      </div>

      <p
        v-if="!isPending && !isError && filteredAreas.length > 0"
        class="pt-12 text-center text-sm text-muted-foreground"
      >
        Showing {{ filteredAreas.length }} practice {{ filteredAreas.length === 1 ? 'area' : 'areas' }}
      </p>
    </section>
  </div>
</template>
