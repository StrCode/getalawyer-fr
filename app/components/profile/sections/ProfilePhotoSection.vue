<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
const props = defineProps<{
  name: string
  email?: string | null
  imageUrl?: string | null
  uploading?: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
})

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('upload', file)
  }
  input.value = ''
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-base">
        Profile photo
      </CardTitle>
      <CardDescription>
        Shown on your public profile and in search results.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div class="relative shrink-0 self-center sm:self-auto">
        <Avatar class="size-24 ring-4 ring-background sm:size-28">
          <AvatarImage
            :src="imageUrl ?? ''"
            :alt="name"
          />
          <AvatarFallback class="bg-primary text-2xl text-primary-foreground">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <span
          v-if="uploading"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-background/70"
        >
          <AppIcon :icon="appIcons.circleNotch" class="size-8 animate-spin text-muted-foreground" />
        </span>
      </div>

      <div class="min-w-0 flex-1 text-center sm:text-left">
        <p class="font-heading text-lg font-semibold tracking-tight text-foreground">
          {{ name }}
        </p>
        <p
          v-if="email"
          class="mt-0.5 truncate text-sm text-muted-foreground"
        >
          {{ email }}
        </p>
        <p class="mt-2 text-sm text-muted-foreground">
          JPEG, PNG, GIF, or WebP · max 5 MB
        </p>
      </div>

      <div class="flex shrink-0 flex-col gap-2 sm:items-end">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          class="sr-only"
          @change="onFileSelected"
        >
        <ButtonBusy
          type="button"
          variant="outline"
          size="sm"
          :loading="uploading"
          class="w-full sm:w-auto"
          @click="fileInputRef?.click()"
        >
          <AppIcon :icon="appIcons.camera" class="size-4" />
          Upload photo
        </ButtonBusy>
      </div>
    </CardContent>
  </Card>
</template>
