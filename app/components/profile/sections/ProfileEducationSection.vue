<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatEducationSubtitle, formatEducationYears } from '~/lib/profile-list-format'
import { educationPayload, educationSchema, educationValues } from '~/lib/profile-forms'
import type { CreateEducationInput, LawyerProfileEducation } from '~/types/lawyer-profile-editor'

/** Where a lawyer studied: law school, degrees and other study. */
const props = defineProps<{
  items: LawyerProfileEducation[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateEducationInput) => Promise<void>
  onUpdate: (payload: { id: string, data: Partial<CreateEducationInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const form = useForm({
  defaultValues: educationValues(),
  validators: {
    onChange: educationSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    const payload = educationPayload(educationSchema.parse(value))
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

const { dialogOpen, editingId, deleteOpen, openCreate, openEdit, openDelete, confirmDelete } = useProfileEntryList<LawyerProfileEducation>({
  seed: item => form.reset(educationValues(item)),
  remove: id => props.onDelete(id),
})
</script>

<template>
  <SettingsSectionCard
    title="Education"
    description="Law school, degrees and other study."
    content-class="grid gap-[0.6rem] p-[clamp(1.1rem,2.2vw,1.5rem)]"
  >
    <template #action>
      <Button type="button" variant="line" size="pill-sm" class="h-[2.5rem] px-[0.95rem] text-[0.95rem]" :disabled="disabled" @click="openCreate">Add a school</Button>
    </template>

    <p v-if="items.length === 0" class="py-[1.2rem] text-center text-muted-foreground">No schools added yet.</p>
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
  </SettingsSectionCard>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="editingId ? 'Edit this school' : 'Add a school'"
    description="A school, degree or course you completed."
    form-id="education-form"
    :saving="saving"
  >
    <form id="education-form" novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-[1.1rem]">
        <form.Field v-slot="{ field }" name="school">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">School</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="160"
              placeholder="For example: University of Lagos"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>
        <div class="grid gap-[1.1rem] sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="degree">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Degree <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                maxlength="120"
                placeholder="For example: LL.B"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
          <form.Field v-slot="{ field }" name="fieldOfStudy">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Field of study <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                maxlength="120"
                placeholder="For example: Law"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>
        <div class="grid gap-[1.1rem] sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="startYear">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Year started <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                inputmode="numeric"
                maxlength="4"
                placeholder="2012"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
          <form.Field v-slot="{ field }" name="endYear">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">Year finished <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                inputmode="numeric"
                maxlength="4"
                placeholder="2016"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>
        <form.Field v-slot="{ field }" name="description">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Anything to add <span class="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Textarea
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="canopyTextarea"
              rows="3"
              maxlength="2000"
              placeholder="Honours, prizes or what you focused on."
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
    title="Remove this school?"
    description="It will no longer show on your public page."
    :deleting="saving"
    @confirm="confirmDelete"
  />
</template>
