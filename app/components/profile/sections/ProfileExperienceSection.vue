<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatExperienceRange } from '~/lib/profile-list-format'
import { experiencePayload, experienceSchema, experienceValues } from '~/lib/profile-forms'
import type { CreateExperienceInput, LawyerProfileExperience } from '~/types/lawyer-profile-editor'

/** The roles a lawyer has held, newest first as the server returns them. */
const props = defineProps<{
  items: LawyerProfileExperience[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateExperienceInput) => Promise<void>
  onUpdate: (payload: { id: string, data: Partial<CreateExperienceInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const form = useForm({
  defaultValues: experienceValues(),
  validators: {
    onChange: experienceSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    const payload = experiencePayload(experienceSchema.parse(value))
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

const { dialogOpen, editingId, deleteOpen, openCreate, openEdit, openDelete, confirmDelete } = useProfileEntryList<LawyerProfileExperience>({
  seed: item => form.reset(experienceValues(item)),
  remove: id => props.onDelete(id),
})

const isCurrent = form.useStore(state => state.values.isCurrent)
</script>

<template>
  <SettingsSectionCard
    title="Experience"
    description="The roles clients see on your public page."
    content-class="grid gap-[0.6rem] p-[clamp(1.1rem,2.2vw,1.5rem)]"
  >
    <template #action>
      <Button type="button" variant="line" size="pill-sm" class="h-[2.5rem] px-[0.95rem] text-[0.95rem]" :disabled="disabled" @click="openCreate">Add a role</Button>
    </template>

    <p v-if="items.length === 0" class="py-[1.2rem] text-center text-muted-foreground">No roles added yet.</p>
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
  </SettingsSectionCard>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="editingId ? 'Edit this role' : 'Add a role'"
    description="A role from your legal career."
    form-id="experience-form"
    :saving="saving"
  >
    <form id="experience-form" novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-[1.1rem]">
        <form.Field v-slot="{ field }" name="title">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Job title</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="120"
              placeholder="For example: Senior Associate"
              autocomplete="organization-title"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="organization">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Firm or organisation</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="160"
              placeholder="For example: Adeyemi & Partners"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="location">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Location <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="120"
              placeholder="For example: Lagos"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <div class="grid gap-[1.1rem] sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="startDate">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Started <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                type="month"
                placeholder="2019-04"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
          <form.Field v-slot="{ field }" name="endDate">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Ended <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                type="month"
                placeholder="2022-01"
                :aria-invalid="isInvalid(field)"
                :disabled="saving || isCurrent"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>
        <form.Field v-slot="{ field }" name="isCurrent">
          <Field :class="canopyField">
            <Label :for="field.name" :class="canopyChoice">
              <Checkbox
                :id="field.name"
                :model-value="field.state.value === true"
                :class="canopyCheckbox"
                :disabled="saving"
                @update:model-value="(v) => {
                  field.handleChange(!!v)
                  // a role that has not ended has no end date
                  if (v) form.setFieldValue('endDate', '')
                  field.handleBlur()
                }"
              />
              <span class="text-[0.95rem] leading-snug font-semibold text-foreground">I work here now</span>
            </Label>
          </Field>
        </form.Field>
        <form.Field v-slot="{ field }" name="description">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">What you did <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Textarea
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="canopyTextarea"
              rows="4"
              maxlength="4000"
              placeholder="The kind of work, and anything worth pointing out."
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
      </FieldGroup>
    </form>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Remove this role?"
    description="It will no longer show on your public page."
    :deleting="saving"
    @confirm="confirmDelete"
  />
</template>
