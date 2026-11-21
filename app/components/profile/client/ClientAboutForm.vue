<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { ClientProfile } from '~/lib/api'
import { BIO_MAX, bioPayload, bioSchema, bioValues } from '~/lib/client-profile-forms'
import { sameValues } from '~/lib/profile-forms'

/** An optional note a lawyer can read before a first consultation. */
const props = defineProps<{
  profile: ClientProfile | null | undefined
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ReturnType<typeof bioPayload>]
}>()

const form = useForm({
  defaultValues: bioValues(props.profile),
  validators: {
    onChange: bioSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    emit('save', bioPayload(bioSchema.parse(value)))
  },
})

const { isInvalid } = useAuthFieldInvalid(form)
const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, bioValues(props.profile)))

watch(() => props.profile, saved => form.reset(bioValues(saved)), { deep: true })
</script>

<template>
  <SettingsSectionCard title="What you need help with" description="Optional. A lawyer can read this before your first consultation.">
    <form novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="bio">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">A short note</FieldLabel>
            <Textarea
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="canopyTextarea"
              rows="5"
              :maxlength="BIO_MAX"
              placeholder="For example: my landlord wants me out before my rent runs out."
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldDescription :class="canopyHint">{{ field.state.value.length }} of {{ BIO_MAX }} characters</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="form.reset(bioValues(profile))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill-sm" :disabled="!dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
