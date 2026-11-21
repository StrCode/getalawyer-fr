<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatLicenseDates } from '~/lib/profile-list-format'
import { licensePayload, licenseSchema, licenseValues } from '~/lib/profile-forms'
import type { CreateLicenseInput, LawyerProfileLicense } from '~/types/lawyer-profile-editor'

/** Bar admissions, practising licences and professional certificates. */
const props = defineProps<{
  items: LawyerProfileLicense[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateLicenseInput) => Promise<void>
  onUpdate: (payload: { id: string, data: Partial<CreateLicenseInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const form = useForm({
  defaultValues: licenseValues(),
  validators: {
    onChange: licenseSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    const payload = licensePayload(licenseSchema.parse(value))
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

const { dialogOpen, editingId, deleteOpen, openCreate, openEdit, openDelete, confirmDelete } = useProfileEntryList<LawyerProfileLicense>({
  seed: item => form.reset(licenseValues(item)),
  remove: id => props.onDelete(id),
})

// Kept here, not in the template: a web address written straight into an attribute confuses the type checker.
const linkExample = 'https://example.org/check'
</script>

<template>
  <SettingsSectionCard
    title="Licences and certificates"
    description="Bar admissions, practising licences and professional certificates."
    content-class="grid gap-2.5 p-4.5 lg:p-5.75 xl:p-6"
  >
    <template #action>
      <Button type="button" variant="line" size="pill-sm" class="h-10 px-3.75 text-sm" :disabled="disabled" @click="openCreate">Add one</Button>
    </template>

    <p v-if="items.length === 0" class="py-4.75 text-center text-muted-foreground">None listed yet.</p>
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
  </SettingsSectionCard>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="editingId ? 'Edit this licence or certificate' : 'Add a licence or certificate'"
    description="A bar admission, a practising licence or a professional certificate."
    form-id="license-form"
    :saving="saving"
  >
    <form id="license-form" novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="name">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Name</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="160"
              placeholder="For example: Call to the Nigerian Bar"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="issuingOrganization">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Issued by</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="160"
              placeholder="For example: Body of Benchers"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <div class="grid gap-4.5 sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="issueDate">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Issued <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                type="month"
                placeholder="2015-11"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
          <form.Field v-slot="{ field }" name="expirationDate">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Expires <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                type="month"
                placeholder="2027-11"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>
        <form.Field v-slot="{ field }" name="credentialId">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Certificate or enrolment number <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="120"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="credentialUrl">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Link to check it <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              type="url"
                            maxlength="500"
              :placeholder="linkExample"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldDescription :class="canopyHint">A page where anyone can confirm the licence or certificate.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
      </FieldGroup>
    </form>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Remove this?"
    description="It will no longer show on your public page."
    :deleting="saving"
    @confirm="confirmDelete"
  />
</template>
