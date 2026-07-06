<script setup lang="ts">
import { CallIcon, Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const props = withDefaults(
  defineProps<{
    name: string
    email?: string | null
    imageUrl?: string | null
    company?: string | null
    city?: string | null
    stateLabel?: string | null
    phoneNumber?: string | null
    bio?: string | null
    compact?: boolean
  }>(),
  { compact: false },
)

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
})

const locationLabel = computed(() => {
  const city = props.city?.trim()
  const state = props.stateLabel?.trim()
  if (city && state) return `${city}, ${state}`
  if (state) return `${state}, Nigeria`
  if (city) return city
  return null
})
</script>

<template>
  <Card
    :class="compact
      ? 'border-border'
      : 'overflow-hidden border-primary/15 bg-linear-to-br from-primary/5 via-card to-card'"
  >
    <CardHeader class="pb-3">
      <CardTitle class="text-base">
        How lawyers see you
      </CardTitle>
      <CardDescription>
        Preview on bookings and in messages.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div
        class="rounded-xl border border-border bg-card shadow-xs"
        :class="compact ? 'p-4' : 'p-5'"
      >
        <div class="flex items-start gap-4">
          <Avatar class="size-16 shrink-0 ring-2 ring-background">
            <AvatarImage
              :src="imageUrl ?? ''"
              :alt="name"
            />
            <AvatarFallback class="bg-primary text-lg text-primary-foreground">
              {{ initials }}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1">
            <p class="font-heading text-lg font-medium tracking-tight text-foreground">
              {{ name || 'Your name' }}
            </p>
            <p
              v-if="email"
              class="mt-0.5 truncate text-sm text-muted-foreground"
            >
              {{ email }}
            </p>
            <p
              v-if="company"
              class="mt-1 text-sm text-muted-foreground"
            >
              {{ company }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <Badge
                v-if="locationLabel"
                variant="soft"
                class="gap-1 font-normal"
              >
                <HugeiconsIcon :icon="Location01Icon" class="size-3.5" />
                {{ locationLabel }}
              </Badge>
              <Badge
                v-if="phoneNumber"
                variant="outline"
                class="gap-1 font-normal"
              >
                <HugeiconsIcon :icon="CallIcon" class="size-3.5" />
                {{ phoneNumber }}
              </Badge>
            </div>
          </div>
        </div>

        <p
          v-if="bio?.trim()"
          class="mt-4 border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground"
        >
          {{ bio.trim() }}
        </p>
        <p
          v-else
          class="mt-4 border-t border-border/60 pt-4 text-sm italic text-muted-foreground"
        >
          Add a short bio to give lawyers context before your consultation.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
