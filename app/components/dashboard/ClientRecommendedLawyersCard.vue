<script setup lang="ts">
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { LawyerSearchResult } from '~/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  lawyers: LawyerSearchResult[]
  listingQuery?: Record<string, string | string[]>
}>()

const previewLawyers = computed(() => props.lawyers.slice(0, 6))

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function primarySpecialization(lawyer: LawyerSearchResult): string | null {
  return lawyer.specializations[0]?.name ?? null
}
</script>

<template>
  <Card class="py-0 shadow-xs">
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-4">
      <div>
        <CardTitle class="text-base">
          Recommended for you
        </CardTitle>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Based on your legal interests
        </p>
      </div>
      <Button
        v-if="listingQuery"
        as-child
        variant="ghost"
        size="sm"
        class="cursor-pointer"
      >
        <NuxtLink :to="{ path: '/find-lawyers', query: listingQuery }">
          View all
        </NuxtLink>
      </Button>
    </CardHeader>

    <CardContent class="p-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="lawyer in previewLawyers"
          :key="lawyer.id"
          :to="`/lawyers/${lawyer.id}`"
          class="group flex min-w-0 items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/25 hover:bg-muted/30"
        >
          <Avatar class="size-10 shrink-0">
            <AvatarImage
              v-if="lawyer.image"
              :src="lawyer.image"
              :alt="lawyer.name"
            />
            <AvatarFallback class="bg-primary/10 text-primary text-sm">
              {{ initials(lawyer.name) }}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-foreground group-hover:text-primary">
              {{ lawyer.name }}
            </p>
            <p class="truncate text-xs text-muted-foreground">
              <template v-if="lawyer.state">
                {{ lawyer.state }}
              </template>
              <template v-if="lawyer.state && lawyer.yearsOfExperience">
                ·
              </template>
              <template v-if="lawyer.yearsOfExperience">
                {{ lawyer.yearsOfExperience }}+ yrs
              </template>
            </p>
            <Badge
              v-if="primarySpecialization(lawyer)"
              variant="secondary"
              class="mt-1 max-w-full truncate"
            >
              {{ primarySpecialization(lawyer) }}
            </Badge>
          </div>

          <HugeiconsIcon
            :icon="ArrowRight01Icon"
            class="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
          />
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
