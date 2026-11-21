<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { ClientProfile } from '~/lib/api'
import { personalPayload, personalSchema, personalValues } from '~/lib/client-profile-forms'
import { sameValues } from '~/lib/profile-forms'

/** A client's name and, if they book for an organisation, its name. The email is shown, not edited. */
const props = defineProps<{
  profile: ClientProfile | null | undefined
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ReturnType<typeof personalPayload>]
}>()

const form = useForm({
  defaultValues: personalValues(props.profile),
  validators: {
    onChange: personalSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    emit('save', personalPayload(personalSchema.parse(value)))
  },
})

const { isInvalid } = useAuthFieldInvalid(form)
const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, personalValues(props.profile)))

// What is saved replaces what is in the form: after a save, and when the profile reloads.
watch(() => props.profile, saved => form.reset(personalValues(saved)), { deep: true })
</script>

<template>
  <SettingsSectionCard title="Your details" description="Shared with a lawyer when you book a consultation.">
    <form novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="name">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Full name</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="100"
              autocomplete="name"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <Field :class="canopyField">
          <FieldLabel for="client-email" :class="canopyLabel">Email</FieldLabel>
          <Input id="client-email" :model-value="profile?.email ?? ''" type="email" disabled :class="authInput" />
          <FieldDescription :class="canopyHint">This is how you sign in. Contact support to change it.</FieldDescription>
        </Field>

        <form.Field v-slot="{ field }" name="company">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">
              Company
              <span class="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="160"
              autocomplete="organization"
              :aria-invalid="isInvalid(field)"
              :disabled="saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldDescription :class="canopyHint">If you book on behalf of an organisation.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="form.reset(personalValues(profile))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill-sm" :disabled="!dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
