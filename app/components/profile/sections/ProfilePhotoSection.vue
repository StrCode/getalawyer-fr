<script setup lang="ts">
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
const props = withDefaults(
  defineProps<{
    name: string
    email?: string | null
    imageUrl?: string | null
    uploading?: boolean
    title?: string
    description?: string
    fileHint?: string
  }>(),
  {
    title: 'Profile photo',
    description: 'Shown wherever you appear on getalawyer.',
    fileHint: 'JPEG, PNG, GIF or WebP, up to 5 MB.',
  },
)

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
  <SettingsSectionCard :title="title" :description="description" content-class="flex flex-col gap-5 p-4.5 lg:p-5.75 xl:p-6 sm:flex-row sm:items-center">
    <div class="relative shrink-0 self-center sm:self-auto">
      <Avatar class="size-24 rounded-card sm:size-28">
        <AvatarImage :src="imageUrl ?? ''" :alt="name" />
        <AvatarFallback class="rounded-card bg-mint font-display text-2xl font-medium text-deep">{{ initials }}</AvatarFallback>
      </Avatar>
      <span v-if="uploading" class="absolute inset-0 flex items-center justify-center rounded-card bg-background/70">
        <HugeiconsIcon :icon="Loading03Icon" class="size-8 animate-spin text-muted-foreground" />
      </span>
    </div>

    <div class="min-w-0 flex-1 text-center sm:text-left">
      <p class="font-display text-base font-normal tracking-tight">{{ name }}</p>
      <p v-if="email" class="mt-0.5 truncate text-sm text-muted-foreground">{{ email }}</p>
      <p class="mt-2 text-sm text-muted-foreground">{{ fileHint }}</p>
    </div>

    <div class="flex shrink-0 flex-col gap-2 sm:items-end">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        class="sr-only"
        aria-label="Choose a photo"
        @change="onFileSelected"
      >
      <Button type="button" variant="line" size="pill-sm" class="w-full sm:w-auto" :disabled="uploading" :aria-busy="uploading" @click="fileInputRef?.click()">
        {{ uploading ? 'Uploading…' : imageUrl ? 'Change photo' : 'Add a photo' }}
      </Button>
    </div>
  </SettingsSectionCard>
</template>
