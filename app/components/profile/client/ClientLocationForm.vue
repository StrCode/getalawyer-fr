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
import type { ClientProfile } from '~/lib/api'
import { locationPayload, locationSchema, locationValues } from '~/lib/client-profile-forms'
import { sameValues } from '~/lib/profile-forms'

/** Where a client lives. Getalawyer works in Nigeria only, so the country is not asked. */
const props = defineProps<{
  profile: ClientProfile | null | undefined
  states: { label: string, value: string }[]
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ReturnType<typeof locationPayload>]
}>()

const form = useForm({
  defaultValues: locationValues(props.profile),
  validators: {
    onChange: locationSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    emit('save', locationPayload(locationSchema.parse(value)))
  },
})

const { isInvalid } = useAuthFieldInvalid(form)
const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, locationValues(props.profile)))

watch(() => props.profile, saved => form.reset(locationValues(saved)), { deep: true })
</script>

<template>
  <SettingsSectionCard title="Where you are" description="We use your state to show you lawyers who practise there. Getalawyer works in Nigeria.">
    <form novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <div class="grid gap-4.5 sm:grid-cols-2">
          <form.Field v-slot="{ field }" name="state">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">State</FieldLabel>
              <Select
                :model-value="field.state.value || undefined"
                :disabled="saving"
                @update:model-value="(v) => {
                  field.handleChange(String(v ?? ''))
                  field.handleBlur()
                }"
              >
                <SelectTrigger :id="field.name" :class="canopySelect" :aria-invalid="isInvalid(field)">
                  <SelectValue placeholder="Choose your state" />
                </SelectTrigger>
                <SelectContent :class="canopyPanel">
                  <SelectItem v-for="state in states" :key="state.value" :value="state.value">{{ state.label }}</SelectItem>
                </SelectContent>
              </Select>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="city">
            <Field :class="canopyField" :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name" :class="canopyLabel">
                City or town
                <span class="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :class="authInput"
                maxlength="120"
                autocomplete="address-level2"
                :aria-invalid="isInvalid(field)"
                :disabled="saving"
                @blur="field.handleBlur"
                @update:model-value="(v) => field.handleChange(String(v ?? ''))"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </div>
        <FieldDescription :class="canopyHint">Country: Nigeria.</FieldDescription>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="dirty" type="button" variant="line" size="pill" :disabled="saving" @click="form.reset(locationValues(profile))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill" :disabled="!dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
