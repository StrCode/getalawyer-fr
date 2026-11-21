<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import ProfileListRow from '@/components/profile/ProfileListRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { skillPayload, skillSchema, skillValues } from '~/lib/profile-forms'
import type { CreateSkillInput, LawyerProfileSkill } from '~/types/lawyer-profile-editor'

/** Short words for what a lawyer is good at, shown as tags on the public page. */
const props = defineProps<{
  items: LawyerProfileSkill[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateSkillInput) => Promise<void>
  onUpdate: (payload: { id: string, data: Partial<CreateSkillInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const form = useForm({
  defaultValues: skillValues(),
  validators: {
    onChange: skillSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: async ({ value }) => {
    const payload = skillPayload(skillSchema.parse(value))
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

const { dialogOpen, editingId, deleteOpen, openCreate, openEdit, openDelete, confirmDelete } = useProfileEntryList<LawyerProfileSkill>({
  seed: item => form.reset(skillValues(item)),
  remove: id => props.onDelete(id),
})
</script>

<template>
  <SettingsSectionCard
    title="Skills"
    description="What you are good at, in a few words each."
    content-class="grid gap-[0.6rem] p-[clamp(1.1rem,2.2vw,1.5rem)]"
  >
    <template #action>
      <Button type="button" variant="line" size="pill-sm" class="h-[2.5rem] px-[0.95rem] text-[0.95rem]" :disabled="disabled" @click="openCreate">Add a skill</Button>
    </template>

    <p v-if="items.length === 0" class="py-[1.2rem] text-center text-muted-foreground">No skills added yet.</p>
    <ul v-else class="flex flex-wrap gap-[0.4rem]">
      <li v-for="item in items" :key="item.id" class="inline-flex items-center gap-[0.15rem] rounded-full bg-muted py-[0.15rem] pr-[0.2rem] pl-[0.85rem] text-[0.95rem] font-semibold">
        <button type="button" class="cursor-pointer disabled:cursor-default" :disabled="disabled" :aria-label="`Edit ${item.name}`" @click="openEdit(item)">{{ item.name }}</button>
        <button
          type="button"
          class="grid size-[2rem] cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-card hover:text-foreground disabled:cursor-default"
          :disabled="disabled"
          :aria-label="`Remove ${item.name}`"
          @click="openDelete(item.id)"
        >
          <CanopyGlyph name="close" :size="12" :stroke="2.6" />
        </button>
      </li>
    </ul>
  </SettingsSectionCard>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="editingId ? 'Edit this skill' : 'Add a skill'"
    description="One skill at a time, in a few words."
    form-id="skill-form"
    :saving="saving"
  >
    <form id="skill-form" novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-[1.1rem]">
        <form.Field v-slot="{ field }" name="name">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Skill</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="80"
              placeholder="For example: Contract negotiation"
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
    title="Remove this skill?"
    description="It will no longer show on your public page."
    :deleting="saving"
    @confirm="confirmDelete"
  />
</template>
