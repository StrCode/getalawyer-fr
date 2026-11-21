<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { articlePayload, articleSchema, articleValues } from '~/lib/profile-forms'
import type { CreateArticleInput, LawyerProfileArticle } from '~/types/lawyer-profile-editor'

/** Articles a lawyer has written. Only published ones show on the public page. */
const props = defineProps<{
  items: LawyerProfileArticle[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateArticleInput) => Promise<void>
  onUpdate: (payload: { id: string, data: Partial<CreateArticleInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const form = useForm({
  defaultValues: articleValues(),
  validators: {
    onChange: articleSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    const payload = articlePayload(articleSchema.parse(value))
    try {
      if (editingId.value) await props.onUpdate({ id: editingId.value, data: payload })
      else await props.onCreate(payload)
      dialogOpen.value = false
    }
    catch {
      // the page shows the message; the dialog stays open to try again
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

const { dialogOpen, editingId, deleteOpen, openCreate, openEdit, openDelete, confirmDelete } = useProfileEntryList<LawyerProfileArticle>({
  seed: item => form.reset(articleValues(item)),
  remove: id => props.onDelete(id),
})

function articleDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <SettingsSectionCard
    title="Articles"
    description="Writing that shows what you know. Only published articles show on your public page."
    content-class="grid gap-2.5 p-4.5 lg:p-5.75 xl:p-6"
  >
    <template #action>
      <Button type="button" variant="line" size="pill-sm" class="h-10 px-3.75 text-sm" :disabled="disabled" @click="openCreate">Add an article</Button>
    </template>

    <p v-if="items.length === 0" class="py-4.75 text-center text-muted-foreground">No articles yet.</p>
    <ProfileListRow
      v-for="item in items"
      :key="item.id"
      :primary="item.title"
      :secondary="item.excerpt"
      :tertiary="articleDate(item.publishedAt ?? item.updatedAt)"
      :badge="item.status === 'published' ? 'Published' : 'Draft'"
      :disabled="disabled"
      @edit="openEdit(item)"
      @delete="openDelete(item.id)"
    />
  </SettingsSectionCard>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="editingId ? 'Edit this article' : 'Add an article'"
    description="Save it as a draft until it is ready for clients to read."
    form-id="article-form"
    :saving="saving"
  >
    <form id="article-form" novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="title">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Title</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="200"
              placeholder="For example: What to check before you sign a lease"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="excerpt">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Summary <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="400"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldDescription :class="canopyHint">One or two lines shown under the title on your public page.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="body">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Article</FieldLabel>
            <Textarea
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="canopyTextarea"
              rows="9"
              placeholder="Write the article here."
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="status">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Who can see it</FieldLabel>
            <Select
              :model-value="field.state.value"
              :disabled="saving"
              @update:model-value="(v) => {
                field.handleChange(v === 'published' ? 'published' : 'draft')
                field.handleBlur()
              }"
            >
              <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="isInvalid(field)">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent :class="canopyPanel">
                <SelectItem value="draft">Only you (draft)</SelectItem>
                <SelectItem value="published">Everyone (published)</SelectItem>
              </SelectContent>
            </Select>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
      </FieldGroup>
    </form>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Delete this article?"
    description="It is removed for good, from your profile and your public page."
    :deleting="saving"
    @confirm="confirmDelete"
  />
</template>
