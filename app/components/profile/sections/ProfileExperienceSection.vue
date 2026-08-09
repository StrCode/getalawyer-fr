<script setup lang="ts">
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatExperienceRange } from '~/lib/profile-list-format'
import type {
  CreateExperienceInput,
  LawyerProfileExperience,
} from '~/types/lawyer-profile-editor'

const props = defineProps<{
  items: LawyerProfileExperience[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateExperienceInput) => Promise<void>
  onUpdate: (payload: { id: string; data: Partial<CreateExperienceInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const dialogOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)

const title = ref('')
const organization = ref('')
const location = ref('')
const startDate = ref('')
const endDate = ref('')
const isCurrent = ref(false)
const description = ref('')

function resetForm() {
  title.value = ''
  organization.value = ''
  location.value = ''
  startDate.value = ''
  endDate.value = ''
  isCurrent.value = false
  description.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(item: LawyerProfileExperience) {
  editingId.value = item.id
  title.value = item.title
  organization.value = item.organization
  location.value = item.location ?? ''
  startDate.value = item.startDate?.slice(0, 7) ?? ''
  endDate.value = item.endDate?.slice(0, 7) ?? ''
  isCurrent.value = item.isCurrent
  description.value = item.description ?? ''
  dialogOpen.value = true
}

function openDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}

watch(isCurrent, (current) => {
  if (current) endDate.value = ''
})

const canSave = computed(
  () => title.value.trim().length > 0 && organization.value.trim().length > 0,
)

const dialogTitle = computed(() =>
  editingId.value ? 'Edit experience' : 'Add experience',
)

function buildPayload(): CreateExperienceInput {
  return {
    title: title.value.trim(),
    organization: organization.value.trim(),
    location: location.value.trim() || null,
    startDate: startDate.value || null,
    endDate: isCurrent.value ? null : endDate.value || null,
    isCurrent: isCurrent.value,
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
          <CardTitle>
            Experience
          </CardTitle>
          <CardDescription>
            Roles and positions clients see on your listing.
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
        class="rounded-xl border border-dashed border-border/40 py-8 text-center text-sm text-muted-foreground"
      >
        No roles added yet.
      </p>
      <ProfileListRow
        v-for="item in items"
        :key="item.id"
        :primary="item.title"
        :secondary="item.organization"
        :tertiary="[formatExperienceRange(item), item.location].filter(Boolean).join(' · ') || null"
        :disabled="disabled"
        @edit="openEdit(item)"
        @delete="openDelete(item.id)"
      />
    </CardContent>
  </Card>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="dialogTitle"
    description="Add a role from your legal career."
    :save-label="editingId ? 'Update' : 'Add'"
    :saving="saving"
    :save-disabled="!canSave"
    @save="onSave"
  >
    <FieldGroup class="gap-4">
      <Field>
        <FieldLabel for="exp-title">
          Job title
        </FieldLabel>
        <Input
          id="exp-title"
          v-model="title"
          maxlength="120"
          placeholder="e.g. Senior Associate"
        />
      </Field>
      <Field>
        <FieldLabel for="exp-org">
          Organization
        </FieldLabel>
        <Input
          id="exp-org"
          v-model="organization"
          maxlength="160"
          placeholder="e.g. Adeyemi & Partners"
        />
      </Field>
      <Field>
        <FieldLabel for="exp-location">
          Location
        </FieldLabel>
        <Input
          id="exp-location"
          v-model="location"
          maxlength="120"
          placeholder="Optional"
        />
      </Field>
      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel for="exp-start">
            Start date
          </FieldLabel>
          <Input
            id="exp-start"
            v-model="startDate"
            type="month"
          />
        </Field>
        <Field>
          <FieldLabel for="exp-end">
            End date
          </FieldLabel>
          <Input
            id="exp-end"
            v-model="endDate"
            type="month"
            :disabled="isCurrent"
          />
        </Field>
      </div>
      <Label class="flex cursor-pointer items-center gap-2">
        <Checkbox
          :model-value="isCurrent"
          @update:model-value="(v) => { isCurrent = !!v }"
        />
        <span class="text-sm font-normal">I currently work here</span>
      </Label>
      <Field>
        <FieldLabel for="exp-desc">
          Description
        </FieldLabel>
        <Textarea
          id="exp-desc"
          v-model="description"
          rows="4"
          maxlength="4000"
          placeholder="Optional — scope of work, highlights, etc."
        />
      </Field>
    </FieldGroup>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Remove experience?"
    description="This role will no longer appear on your listing."
    :deleting="saving"
    @confirm="onDeleteConfirm"
  />
</template>
