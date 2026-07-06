<script setup lang="ts">
import { LinkSquare01Icon, Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps<{
  name: string
  imageUrl?: string | null
  headline?: string | null
  about?: string | null
  practiceAreas?: Array<{ name: string }>
  firmName?: string | null
  officeLocation?: string | null
  publicProfileUrl?: string | null
}>()

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
})

const displayHeadline = computed(
  () => props.headline?.trim() || props.practiceAreas?.[0]?.name || 'Add a headline in About',
)

const aboutPreview = computed(() => {
  const text = props.about?.trim()
  if (!text) return 'Your bio appears here once you add an about section.'
  return text.length > 160 ? `${text.slice(0, 160)}…` : text
})
</script>

<template>
  <Card class="overflow-hidden border-primary/15 bg-linear-to-br from-primary/5 via-card to-card">
    <CardHeader class="pb-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle class="text-base">
            How clients see you
          </CardTitle>
          <CardDescription>
            Preview of your public directory profile.
          </CardDescription>
        </div>
        <Button
          v-if="publicProfileUrl"
          as-child
          variant="outline"
          size="sm"
        >
          <NuxtLink
            :to="publicProfileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="gap-2"
          >
            Full preview
            <HugeiconsIcon :icon="LinkSquare01Icon" class="size-4" />
          </NuxtLink>
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div class="flex items-start gap-4">
          <div
            class="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
          >
            <img
              v-if="imageUrl"
              :src="imageUrl"
              :alt="`${name} profile photo`"
              class="size-full object-cover"
            >
            <div
              v-else
              class="flex size-full items-center justify-center bg-primary/10 text-xl font-semibold text-primary"
            >
              {{ initials }}
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="font-heading text-lg font-medium tracking-tight text-foreground">
              {{ name }}
            </p>
            <p class="mt-0.5 text-sm text-primary">
              {{ displayHeadline }}
            </p>
            <p
              v-if="firmName || officeLocation"
              class="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
            >
              <HugeiconsIcon
                v-if="officeLocation"
                :icon="Location01Icon"
                class="size-3.5 shrink-0"
              />
              <span>
                <template v-if="firmName">{{ firmName }}</template>
                <template v-if="firmName && officeLocation"> · </template>
                <template v-if="officeLocation">{{ officeLocation }}</template>
              </span>
            </p>
          </div>
        </div>

        <div
          v-if="practiceAreas?.length"
          class="mt-4 flex flex-wrap gap-2"
        >
          <Badge
            v-for="area in practiceAreas.slice(0, 4)"
            :key="area.name"
            variant="soft"
            class="font-normal"
          >
            {{ area.name }}
          </Badge>
          <Badge
            v-if="practiceAreas.length > 4"
            variant="outline"
            class="font-normal"
          >
            +{{ practiceAreas.length - 4 }} more
          </Badge>
        </div>

        <p class="mt-4 border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
          {{ aboutPreview }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>
