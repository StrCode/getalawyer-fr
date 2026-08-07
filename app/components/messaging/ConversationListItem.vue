<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  participantName: string
  participantImage?: string | null
  preview: string
  timeLabel: string
  selected?: boolean
  unreadCount?: number
}>()

const emit = defineEmits<{
  select: []
}>()

const initials = computed(() => {
  const parts = props.participantName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
})
</script>

<template>
  <button
    type="button"
    class="flex w-full cursor-pointer gap-3 rounded-lg px-3 py-3 text-left transition-colors"
    :class="selected
      ? 'bg-primary/10'
      : 'hover:bg-muted'"
    @click="emit('select')"
  >
    <Avatar class="size-10 shrink-0">
      <AvatarImage
        :src="participantImage ?? ''"
        :alt="participantName"
      />
      <AvatarFallback class="bg-muted text-xs font-medium text-muted-foreground">
        {{ initials }}
      </AvatarFallback>
    </Avatar>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <p
          class="truncate text-sm font-medium"
          :class="selected ? 'text-primary' : 'text-foreground'"
        >
          {{ participantName }}
        </p>
        <span
          v-if="timeLabel"
          class="shrink-0 text-xs text-muted-foreground"
        >
          {{ timeLabel }}
        </span>
      </div>
      <div class="mt-0.5 flex items-center gap-2">
        <p class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {{ preview }}
        </p>
        <Badge
          v-if="unreadCount && unreadCount > 0 && !selected"
          class="size-5 shrink-0 justify-center rounded-full px-0 text-2xs"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </Badge>
      </div>
    </div>
  </button>
</template>
