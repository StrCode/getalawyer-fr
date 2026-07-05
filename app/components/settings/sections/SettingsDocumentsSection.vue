<template>
  <div class="space-y-6">
    <SettingsSectionCard
      title="Your documents"
      description="Upload contracts, deeds, agreements, and other case-related files."
    >
      <template #action>
        <Button
          type="button"
          size="sm"
          @click="showUpload = true"
        >
          <AppIcon :icon="appIcons.plus" class="size-4" />
          Upload
        </Button>
      </template>

      <div
        v-if="showUpload"
        class="mb-6"
      >
        <SettingsUploadField
          label="Add document"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          :file-name="pendingUpload"
          @select="onUploadSelect"
        />
      </div>

      <div
        v-if="documents.length === 0"
        class="rounded-lg border border-dashed border-border py-12 text-center"
      >
        <AppIcon :icon="appIcons.fileText" class="mx-auto size-10 text-muted-foreground/60" />
        <p class="mt-3 text-sm font-medium text-foreground">
          No documents yet
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          Upload files to share with your lawyer during a consultation.
        </p>
      </div>

      <ul
        v-else
        class="divide-y divide-border/80 rounded-lg border border-border/80"
      >
        <li
          v-for="doc in documents"
          :key="doc.id"
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
              <AppIcon :icon="appIcons.fileText" class="size-4 text-muted-foreground" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">
                {{ doc.name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ doc.size }} · Uploaded {{ doc.uploadedAt }}
                <span v-if="doc.sharedBy"> · Shared by {{ doc.sharedBy }}</span>
              </p>
            </div>
          </div>
          <div class="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Replace"
              @click="replaceDoc(doc.id)"
            >
              <AppIcon :icon="appIcons.arrowsClockwise" class="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Delete"
              @click="removeDoc(doc.id)"
            >
              <AppIcon :icon="appIcons.trash" class="size-4 text-destructive" />
            </Button>
          </div>
        </li>
      </ul>
    </SettingsSectionCard>

    <SettingsSectionCard
      title="Document access log"
      description="Who viewed or downloaded your files."
    >
      <ul class="space-y-3">
        <li
          v-for="entry in accessLog"
          :key="entry.id"
          class="flex items-start justify-between gap-4 text-sm"
        >
          <div>
            <p class="font-medium text-foreground">
              {{ entry.viewer }}
            </p>
            <p class="text-muted-foreground">
              Viewed {{ entry.document }}
            </p>
          </div>
          <time class="shrink-0 text-xs text-muted-foreground">
            {{ entry.at }}
          </time>
        </li>
      </ul>
    </SettingsSectionCard>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import SettingsUploadField from '@/components/settings/SettingsUploadField.vue'
import { Button } from '@/components/ui/button'

interface DocItem {
  id: string
  name: string
  size: string
  uploadedAt: string
  sharedBy?: string
}

const showUpload = ref(false)
const pendingUpload = ref('')

const documents = ref<DocItem[]>([
  {
    id: '1',
    name: 'Tenancy_Agreement_Draft.pdf',
    size: '1.2 MB',
    uploadedAt: '12 Apr 2026',
  },
  {
    id: '2',
    name: 'Property_Deed_Scan.jpg',
    size: '840 KB',
    uploadedAt: '8 Apr 2026',
    sharedBy: 'Adv. Chioma Okafor',
  },
])

const accessLog = [
  { id: '1', viewer: 'Adv. Chioma Okafor', document: 'Property_Deed_Scan.jpg', at: '10 Apr, 14:32' },
  { id: '2', viewer: 'You', document: 'Tenancy_Agreement_Draft.pdf', at: '12 Apr, 09:15' },
]

function onUploadSelect(name: string) {
  pendingUpload.value = name
  if (!name)
    return
  documents.value.unshift({
    id: String(Date.now()),
    name,
    size: '—',
    uploadedAt: 'Just now',
  })
  pendingUpload.value = ''
  showUpload.value = false
}

function removeDoc(id: string) {
  documents.value = documents.value.filter(d => d.id !== id)
}

function replaceDoc(id: string) {
  const doc = documents.value.find(d => d.id === id)
  if (doc)
    doc.uploadedAt = 'Replaced just now'
}
</script>
