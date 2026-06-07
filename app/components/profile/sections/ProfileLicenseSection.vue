<script setup lang="ts">
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatLicenseDates } from '~/lib/profile-list-format'
import type {
  CreateLicenseInput,
  LawyerProfileLicense,
} from '~/types/lawyer-profile-editor'

const props = defineProps<{
  items: LawyerProfileLicense[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateLicenseInput) => Promise<void>
  onUpdate: (payload: { id: string; data: Partial<CreateLicenseInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const dialogOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)

const name = ref('')
const issuingOrganization = ref('')
const issueDate = ref('')
const expirationDate = ref('')
const credentialId = ref('')
const credentialUrl = ref('')

function resetForm() {
  name.value = ''
  issuingOrganization.value = ''
  issueDate.value = ''
  expirationDate.value = ''
  credentialId.value = ''
  credentialUrl.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(item: LawyerProfileLicense) {
  editingId.value = item.id
  name.value = item.name
  issuingOrganization.value = item.issuingOrganization
  issueDate.value = item.issueDate?.slice(0, 7) ?? ''
  expirationDate.value = item.expirationDate?.slice(0, 7) ?? ''
  credentialId.value = item.credentialId ?? ''
  credentialUrl.value = item.credentialUrl ?? ''
  dialogOpen.value = true
}

function openDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}

const canSave = computed(
  () => name.value.trim().length > 0 && issuingOrganization.value.trim().length > 0,
)

const dialogTitle = computed(() =>
  editingId.value ? 'Edit license' : 'Add license',
)

function buildPayload(): CreateLicenseInput {
  return {
    name: name.value.trim(),
    issuingOrganization: issuingOrganization.value.trim(),
    issueDate: issueDate.value || null,
    expirationDate: expirationDate.value || null,
    credentialId: credentialId.value.trim() || null,
    credentialUrl: credentialUrl.value.trim() || null,
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
            Licenses & certifications
          </CardTitle>
          <CardDescription>
            Bar admissions, certificates, and professional credentials.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          :disabled="disabled"
          @click="openCreate"
        >
          <PhPlus class="size-4" />
          Add
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-2">
      <p
        v-if="items.length === 0"
        class="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground"
      >
        No licenses listed yet.
      </p>
      <ProfileListRow
        v-for="item in items"
        :key="item.id"
        :primary="item.name"
        :secondary="item.issuingOrganization"
        :tertiary="formatLicenseDates(item)"
        :badge="item.isVerified ? 'Verified' : null"
        :disabled="disabled"
        @edit="openEdit(item)"
        @delete="openDelete(item.id)"
      />
    </CardContent>
  </Card>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="dialogTitle"
    description="Add a bar admission or professional certificate."
    :save-label="editingId ? 'Update' : 'Add'"
    :saving="saving"
    :save-disabled="!canSave"
    @save="onSave"
  >
    <FieldGroup class="gap-4">
      <Field>
        <FieldLabel for="lic-name">
          Credential name
        </FieldLabel>
        <Input
          id="lic-name"
          v-model="name"
          maxlength="160"
          placeholder="e.g. Nigerian Bar Association"
        />
      </Field>
      <Field>
        <FieldLabel for="lic-org">
          Issuing organization
        </FieldLabel>
        <Input
          id="lic-org"
          v-model="issuingOrganization"
          maxlength="160"
          placeholder="e.g. Body of Benchers"
        />
      </Field>
      <div class="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel for="lic-issue">
            Issue date
          </FieldLabel>
          <Input
            id="lic-issue"
            v-model="issueDate"
            type="month"
          />
        </Field>
        <Field>
          <FieldLabel for="lic-expiry">
            Expiration date
          </FieldLabel>
          <Input
            id="lic-expiry"
            v-model="expirationDate"
            type="month"
          />
        </Field>
      </div>
      <Field>
        <FieldLabel for="lic-id">
          Credential ID
        </FieldLabel>
        <Input
          id="lic-id"
          v-model="credentialId"
          maxlength="120"
          placeholder="Optional"
        />
      </Field>
      <Field>
        <FieldLabel for="lic-url">
          Credential URL
        </FieldLabel>
        <Input
          id="lic-url"
          v-model="credentialUrl"
          type="url"
          maxlength="500"
          placeholder="https://"
        />
      </Field>
    </FieldGroup>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Remove license?"
    description="This credential will no longer appear on your public profile."
    :deleting="saving"
    @confirm="onDeleteConfirm"
  />
</template>
