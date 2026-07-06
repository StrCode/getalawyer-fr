<script setup lang="ts">
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  CreateArticleInput,
  LawyerArticleStatus,
  LawyerProfileArticle,
} from '~/types/lawyer-profile-editor'

const props = defineProps<{
  items: LawyerProfileArticle[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateArticleInput) => Promise<void>
  onUpdate: (payload: { id: string; data: Partial<CreateArticleInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const dialogOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)

const title = ref('')
const excerpt = ref('')
const body = ref('')
const status = ref<LawyerArticleStatus>('draft')

function resetForm() {
  title.value = ''
  excerpt.value = ''
  body.value = ''
  status.value = 'draft'
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(item: LawyerProfileArticle) {
  editingId.value = item.id
  title.value = item.title
  excerpt.value = item.excerpt ?? ''
  body.value = item.body
  status.value = item.status
  dialogOpen.value = true
}

function openDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}

const canSave = computed(
  () => title.value.trim().length > 0 && body.value.trim().length > 0,
)

const dialogTitle = computed(() =>
  editingId.value ? 'Edit article' : 'Add article',
)

function formatArticleDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildPayload(): CreateArticleInput {
  return {
    title: title.value.trim(),
    excerpt: excerpt.value.trim() || null,
    body: body.value.trim(),
    status: status.value,
  }
}

async function onSave() {
  if (!canSave.value) return
  const payload = buildPayload()
  try {
    if (editingId.value) {
      await props.onUpdate({ id: editingId.value, data: payload })
    } else {
      await props.onCreate(payload)
    }
    dialogOpen.value = false
    editingId.value = null
  } catch {
    // Parent shows toast
  }
}

async function onDeleteConfirm() {
  if (!deleteId.value) return
  try {
    await props.onDelete(deleteId.value)
    deleteOpen.value = false
    deleteId.value = null
  } catch {
    // Parent shows toast
  }
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between gap-3">
        <div>
          <CardTitle class="text-base">
            Articles
          </CardTitle>
          <CardDescription>
            Share insights on your public profile. Only published articles are visible to clients.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          :disabled="disabled"
          @click="openCreate"
        >
          <HugeiconsIcon :icon="Add01Icon" class="size-4" />
          Add
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <p
        v-if="items.length === 0"
        class="rounded-xl border border-dashed border-border/40 py-8 text-center text-sm text-muted-foreground"
      >
        No articles yet. Publish legal insights for clients visiting your profile.
      </p>
      <div
        v-else
        class="space-y-3"
      >
        <ProfileListRow
          v-for="item in items"
          :key="item.id"
          :primary="item.title"
          :secondary="item.excerpt"
          :tertiary="[
            item.status === 'published' ? 'Published' : 'Draft',
            formatArticleDate(item.publishedAt ?? item.updatedAt),
          ].filter(Boolean).join(' · ') || null"
          :badge="item.status"
          :disabled="disabled"
          @edit="openEdit(item)"
          @delete="openDelete(item.id)"
        />
      </div>
    </CardContent>

    <ProfileEntryDialog
      v-model:open="dialogOpen"
      :title="dialogTitle"
      description="Articles appear on your public profile when published."
      :save-label="editingId ? 'Update' : 'Add'"
      :saving="saving"
      :save-disabled="!canSave"
      @save="onSave"
    >
      <FieldGroup>
        <Field>
          <FieldLabel for="article-title">
            Title
          </FieldLabel>
          <Input
            id="article-title"
            v-model="title"
            maxlength="200"
            placeholder="e.g. What to know before signing a lease"
          />
        </Field>
        <Field>
          <FieldLabel for="article-excerpt">
            Excerpt
            <span class="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input
            id="article-excerpt"
            v-model="excerpt"
            maxlength="400"
            placeholder="Short summary shown on your profile"
          />
        </Field>
        <Field>
          <FieldLabel for="article-body">
            Body
          </FieldLabel>
          <Textarea
            id="article-body"
            v-model="body"
            rows="8"
            placeholder="Write your article…"
          />
        </Field>
        <Field>
          <FieldLabel for="article-status">
            Status
          </FieldLabel>
          <Select v-model="status">
            <SelectTrigger
              id="article-status"
              class="w-full"
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                Draft — only you can see this
              </SelectItem>
              <SelectItem value="published">
                Published — visible on your profile
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </ProfileEntryDialog>

    <ProfileDeleteConfirmDialog
      v-model:open="deleteOpen"
      title="Delete article?"
      description="This article will be permanently removed from your profile."
      :deleting="saving"
      @confirm="onDeleteConfirm"
    />
  </Card>
</template>
