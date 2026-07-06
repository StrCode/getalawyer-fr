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
import { Textarea } from '@/components/ui/textarea'
import {
  formatEducationSubtitle,
  formatEducationYears,
} from '~/lib/profile-list-format'
import type {
  CreateEducationInput,
  LawyerProfileEducation,
} from '~/types/lawyer-profile-editor'

const props = defineProps<{
  items: LawyerProfileEducation[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateEducationInput) => Promise<void>
  onUpdate: (payload: { id: string; data: Partial<CreateEducationInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const dialogOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)

const school = ref('')
const degree = ref('')
const fieldOfStudy = ref('')
const startYear = ref('')
const endYear = ref('')
const description = ref('')

function resetForm() {
  school.value = ''
  degree.value = ''
  fieldOfStudy.value = ''
  startYear.value = ''
  endYear.value = ''
  description.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(item: LawyerProfileEducation) {
  editingId.value = item.id
  school.value = item.school
  degree.value = item.degree ?? ''
  fieldOfStudy.value = item.fieldOfStudy ?? ''
  startYear.value = item.startYear != null ? String(item.startYear) : ''
  endYear.value = item.endYear != null ? String(item.endYear) : ''
  description.value = item.description ?? ''
  dialogOpen.value = true
}

function openDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}

function parseYear(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n < 1900 || n > 2100) return null
  return n
}

const canSave = computed(() => school.value.trim().length > 0)

const dialogTitle = computed(() =>
  editingId.value ? 'Edit education' : 'Add education',
)

function buildPayload(): CreateEducationInput {
  return {
    school: school.value.trim(),
    degree: degree.value.trim() || null,
    fieldOfStudy: fieldOfStudy.value.trim() || null,
    startYear: parseYear(startYear.value),
    endYear: parseYear(endYear.value),
    description: description.value.trim() || null,
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
            Education
          </CardTitle>
          <CardDescription>
            Law school, degrees, and academic credentials.
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
    <CardContent class="space-y-2">
      <p
        v-if="items.length === 0"
        class="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground"
      >
        No schools added yet.
      </p>
      <ProfileListRow
        v-for="item in items"
        :key="item.id"
        :primary="item.school"
        :secondary="formatEducationSubtitle(item)"
        :tertiary="formatEducationYears(item)"
        :disabled="disabled"
        @edit="openEdit(item)"
        @delete="openDelete(item.id)"
      />
    </CardContent>
  </Card>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="dialogTitle"
    description="Add a school or degree to your profile."
    :save-label="editingId ? 'Update' : 'Add'"
    :saving="saving"
    :save-disabled="!canSave"
    @save="onSave"
  >
    <FieldGroup class="gap-4">
      <Field>
        <FieldLabel for="edu-school">
          School
        </FieldLabel>
        <Input
          id="edu-school"
          v-model="school"
          maxlength="160"
          placeholder="e.g. University of Lagos"
        />
      </Field>
      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel for="edu-degree">
            Degree
          </FieldLabel>
          <Input
            id="edu-degree"
            v-model="degree"
            maxlength="120"
            placeholder="e.g. LL.B"
          />
        </Field>
        <Field>
          <FieldLabel for="edu-field">
            Field of study
          </FieldLabel>
          <Input
            id="edu-field"
            v-model="fieldOfStudy"
            maxlength="120"
            placeholder="Optional"
          />
        </Field>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel for="edu-start">
            Start year
          </FieldLabel>
          <Input
            id="edu-start"
            v-model="startYear"
            type="number"
            min="1900"
            max="2100"
            placeholder="e.g. 2012"
          />
        </Field>
        <Field>
          <FieldLabel for="edu-end">
            End year
          </FieldLabel>
          <Input
            id="edu-end"
            v-model="endYear"
            type="number"
            min="1900"
            max="2100"
            placeholder="e.g. 2016"
          />
        </Field>
      </div>
      <Field>
        <FieldLabel for="edu-desc">
          Notes
        </FieldLabel>
        <Textarea
          id="edu-desc"
          v-model="description"
          rows="3"
          maxlength="2000"
          placeholder="Optional"
        />
      </Field>
    </FieldGroup>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Remove education?"
    description="This entry will no longer appear on your public profile."
    :deleting="saving"
    @confirm="onDeleteConfirm"
  />
</template>
