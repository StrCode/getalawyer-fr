<script setup lang="ts">
import { ArrowRight01Icon, Briefcase01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useFeaturedSpecializations } from '~/composables/useSpecializations'
import { specializationDirectoryHref } from '~/lib/practice-areas'
import { Skeleton } from '@/components/ui/skeleton'

const { data: featuredAreas, isPending, isError } = useFeaturedSpecializations()
</script>

<template>
  <section id="practice" class="bg-muted section-y">
    <div class="mx-auto max-w-7xl px-6 md:px-8">
      <div class="mb-12 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p class="mb-4 eyebrow text-primary-strong">
            Practice areas
          </p>
         <h2 class="max-w-2xl text-4xl font-medium text-foreground md:text-5xl">
            Find a specialist for what you're facing.
          </h2>
        </div>
        <Button variant="outline" as-child class="shrink-0">
          <NuxtLink to="/practice-areas">
            View all areas
            <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4" aria-hidden="true" />
          </NuxtLink>
        </Button>
      </div>

      <div
        v-if="isPending"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-busy="true"
        aria-label="Loading practice areas"
      >
        <Skeleton
          v-for="i in 8"
          :key="i"
          class="h-48 rounded-2xl"
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
        v-else-if="!featuredAreas?.length"
        class="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground"
      >
        No featured practice areas are listed yet.
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="area in featuredAreas"
          :key="area.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
        >
          <div
            v-if="area.imageUrl"
            class="relative h-28 overflow-hidden border-b border-border bg-muted"
          >
            <NuxtImg
              :src="area.imageUrl"
              :alt="area.name"
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <div class="flex flex-1 flex-col p-6">
            <div class="mb-4 flex items-start gap-3">
              <div
                v-if="!area.imageUrl"
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary transition-colors duration-300 group-hover:bg-primary/10"
              >
                <HugeiconsIcon :icon="Briefcase01Icon" class="size-5" aria-hidden="true" />
              </div>
              <NuxtLink
                :to="specializationDirectoryHref(area.id)"
                class="text-base font-medium leading-snug text-foreground no-underline transition-colors hover:text-primary"
                :class="area.imageUrl ? '' : 'mt-1'"
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
              <HugeiconsIcon :icon="ArrowRight01Icon" class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
