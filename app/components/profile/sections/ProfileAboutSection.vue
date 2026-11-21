<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ABOUT_MAX, aboutPayload, aboutSchema, aboutValues, HEADLINE_MAX, sameValues } from '~/lib/profile-forms'
import type { LawyerProfileAbout } from '~/types/lawyer-profile-editor'

/** The line under a lawyer's name in search, and the text about them on their public page. */
const props = defineProps<{
  about: LawyerProfileAbout
  disabled?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: { headline: string | null, about: string | null }]
}>()

const form = useForm({
  defaultValues: aboutValues(props.about),
  validators: {
    onChange: aboutSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    const payload = aboutPayload(aboutSchema.parse(value))
    emit('save', { headline: payload.headline ?? null, about: payload.about ?? null })
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, aboutValues(props.about)))

// What is saved replaces what is in the form: after a save, and when the profile reloads.
watch(() => props.about, saved => form.reset(aboutValues(saved)), { deep: true })
</script>

<template>
  <SettingsSectionCard
    title="Headline and about"
    description="The headline sits under your name in search. The about text is on your public page."
  >
    <form novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="headline">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Headline</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              :maxlength="HEADLINE_MAX"
              placeholder="For example: Commercial litigation in Lagos"
              :aria-invalid="isInvalid(field)"
              :disabled="disabled || saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldDescription :class="canopyHint">{{ field.state.value.length }} of {{ HEADLINE_MAX }} characters</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <form.Field v-slot="{ field }" name="about">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">About you</FieldLabel>
            <Textarea
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="canopyTextarea"
              rows="7"
              :maxlength="ABOUT_MAX"
              placeholder="The work you do, who you do it for and how you help them."
              :aria-invalid="isInvalid(field)"
              :disabled="disabled || saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="form.reset(aboutValues(about))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill-sm" :disabled="disabled || !dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
