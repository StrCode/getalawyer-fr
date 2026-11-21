<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup } from '@/components/ui/field'
import type { ClientProfile } from '~/lib/api'
import { contactPayload, contactSchema, contactValues } from '~/lib/client-profile-forms'
import { sameValues } from '~/lib/profile-forms'

/** An optional phone number a lawyer can use about a booking. */
const props = defineProps<{
  profile: ClientProfile | null | undefined
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ReturnType<typeof contactPayload>]
}>()

const form = useForm({
  defaultValues: contactValues(props.profile),
  validators: {
    onChange: contactSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    emit('save', contactPayload(contactSchema.parse(value)))
  },
})

const { isInvalid } = useAuthFieldInvalid(form)
const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, contactValues(props.profile)))

watch(() => props.profile, saved => form.reset(contactValues(saved)), { deep: true })
</script>

<template>
  <SettingsSectionCard title="Phone" description="Optional. A lawyer may call you about a booking.">
    <form novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="phoneNumber">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <!-- the phone field draws its own label, tied to its own input -->
            <AuthPhoneInput
              label="Phone number"
              :model-value="field.state.value"
              :invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v: string) => field.handleChange(v ?? '')"
            />
            <FieldDescription :class="canopyHint">A Nigerian number. Leave it empty if you would rather not share one.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="form.reset(contactValues(profile))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill-sm" :disabled="!dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
