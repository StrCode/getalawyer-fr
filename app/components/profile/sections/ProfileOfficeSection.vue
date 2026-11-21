<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NIGERIA_STATE_NAMES } from '@/constants/nigeria-states-lgas'
import { officePayload, officeSchema, officeValues, sameValues } from '~/lib/profile-forms'
import type { LawyerProfilePracticeInfo, UpdateLawyerOfficeInput } from '~/types/lawyer-profile-editor'

/** The firm a lawyer practises under and where their office is. The city and state show in search. */
const props = defineProps<{
  practiceInfo: LawyerProfilePracticeInfo | null
  disabled?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: UpdateLawyerOfficeInput]
}>()

const form = useForm({
  defaultValues: officeValues(props.practiceInfo),
  validators: {
    onChange: officeSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    emit('save', officePayload(officeSchema.parse(value)))
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, officeValues(props.practiceInfo)))

// What is saved replaces what is in the form: after a save, and when the profile reloads.
watch(() => props.practiceInfo, saved => form.reset(officeValues(saved)), { deep: true })
</script>

<template>
  <SettingsSectionCard
    title="Office and firm"
    description="Your firm name and where your office is. The city and state show on your profile and in search."
  >
    <form novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-[1.1rem]">
        <form.Field v-slot="{ field }" name="firmName">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">
              Firm or practice name
              <span class="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="160"
              placeholder="For example: Adeyemi & Partners"
              autocomplete="organization"
              :aria-invalid="isInvalid(field)"
              :disabled="disabled || saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldDescription :class="canopyHint">Leave it empty if you practise under your own name.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <form.Field v-slot="{ field }" name="officeStreet">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">Street address</FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="200"
              placeholder="For example: 15 Adeola Odeku Street"
              autocomplete="street-address"
              :aria-invalid="isInvalid(field)"
              :disabled="disabled || saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div class="grid gap-[1.1rem] sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="officeCity">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">City</FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                maxlength="120"
                placeholder="For example: Ikeja"
                autocomplete="address-level2"
                :aria-invalid="isInvalid(field)"
                :disabled="disabled || saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="officeState">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">State</FieldLabel>
              <Select
                :model-value="field.state.value || undefined"
                :disabled="disabled || saving"
                @update:model-value="(v) => {
                  field.handleChange(String(v ?? ''))
                  field.handleBlur()
                }"
              >
                <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="isInvalid(field)">
                  <SelectValue placeholder="Choose a state" />
                </SelectTrigger>
                <SelectContent :class="canopyPanel">
                  <SelectItem v-for="state in NIGERIA_STATE_NAMES" :key="state" :value="state">{{ state }}</SelectItem>
                </SelectContent>
              </Select>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>

        <form.Field v-slot="{ field }" name="officePostalCode">
          <Field :class="[canopyField, 'sm:max-w-[16rem]']" :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.name" :class="canopyLabel">
              Postal code
              <span class="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              :class="authInput"
              maxlength="32"
              autocomplete="postal-code"
              :aria-invalid="isInvalid(field)"
              :disabled="disabled || saving"
              @blur="field.handleBlur"
              @update:model-value="(v) => field.handleChange(String(v ?? ''))"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </Field>
        </form.Field>

        <div class="flex flex-wrap items-center justify-end gap-[0.5rem]">
          <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="form.reset(officeValues(practiceInfo))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill-sm" :disabled="disabled || !dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
