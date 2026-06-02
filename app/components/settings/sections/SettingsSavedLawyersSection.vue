<template>
  <SettingsSectionCard
    title="Saved lawyers"
    description="Bookmark profiles for quick booking and private notes."
  >
    <div
      v-if="saved.length === 0"
      class="py-10 text-center"
    >
      <PhBookmarkSimple class="mx-auto size-10 text-muted-foreground/50" />
      <p class="mt-3 text-sm text-muted-foreground">
        You haven't saved any lawyers yet.
      </p>
      <Button
        as-child
        class="mt-4"
        size="sm"
      >
        <NuxtLink to="/find-lawyers">
          Browse lawyers
        </NuxtLink>
      </Button>
    </div>

    <ul
      v-else
      class="space-y-4"
    >
      <li
        v-for="lawyer in saved"
        :key="lawyer.id"
        class="rounded-lg border border-border/80 p-4"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar class="size-12 shrink-0">
            <AvatarImage
              :src="lawyer.avatar"
              :alt="lawyer.name"
            />
            <AvatarFallback>{{ lawyer.initials }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0 flex-1 space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="font-medium text-foreground">
                  {{ lawyer.name }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ lawyer.specialty }} · {{ lawyer.location }}
                </p>
              </div>
              <Button
                size="sm"
                @click="quickBook(lawyer.id)"
              >
                Quick book
              </Button>
            </div>
            <div class="space-y-1.5">
              <Label :for="`note-${lawyer.id}`">Private note</Label>
              <Textarea
                :id="`note-${lawyer.id}`"
                v-model="lawyer.note"
                rows="2"
                placeholder="e.g. Handled my 2024 property dispute…"
                class="resize-none text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="shrink-0 self-start"
            aria-label="Remove bookmark"
            @click="removeSaved(lawyer.id)"
          >
            <PhBookmarkSimple
              class="size-4"
              weight="fill"
            />
          </Button>
        </div>
      </li>
    </ul>
  </SettingsSectionCard>
</template>

<script setup lang="ts">
import { PhBookmarkSimple } from '@phosphor-icons/vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'

const saved = ref([
  {
    id: '1',
    name: 'Adv. Chioma Okafor',
    initials: 'CO',
    avatar: 'https://i.pravatar.cc/150?img=32',
    specialty: 'Property & real estate',
    location: 'Lagos',
    note: '',
  },
  {
    id: '2',
    name: 'Barr. Emeka Nwosu',
    initials: 'EN',
    avatar: 'https://i.pravatar.cc/150?img=12',
    specialty: 'Employment law',
    location: 'Abuja',
    note: 'Very responsive on chat',
  },
])

function quickBook(id: string) {
  toast.info('Quick book', { description: `Booking flow for lawyer ${id} (coming soon).` })
}

function removeSaved(id: string) {
  saved.value = saved.value.filter(l => l.id !== id)
}
</script>
