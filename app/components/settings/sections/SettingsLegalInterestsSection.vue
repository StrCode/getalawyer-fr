<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useClientProfile } from '~/composables/useClientProfile'
import { useSpecializations } from '~/composables/useSpecializations'
import { ApiError } from '~/lib/api/client'
import { interestsSchema, interestsValues, MAX_INTERESTS } from '~/lib/client-profile-forms'
import { sameValues } from '~/lib/profile-forms'

/**
 * Up to three practice areas a client wants help with; the overview and the
 * directory use them to suggest lawyers. One array field, ticked from a
 * searchable list.
 */
const { useProfile, useUpdateSpecializations } = useClientProfile()
const { data: profile, isLoading } = useProfile()
const { mutateAsync: updateSpecializations, isPending: isSaving } = useUpdateSpecializations()
const { data: allSpecializations, isPending: isLoadingOptions } = useSpecializations()

const hasClientProfile = computed(() => Boolean(profile.value?.clientId))
const options = computed(() => allSpecializations.value ?? [])
const formId = useId()

const form = useForm({
  defaultValues: interestsValues(profile.value),
  validators: {
    onChange: interestsSchema,
  },
  onSubmit: async ({ value }) => {
    try {
      await updateSpecializations([...interestsSchema.parse(value).ids])
      toast.success('Your interests are saved.')
    }
    catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'We could not save that. Nothing has changed.')
    }
  },
})

const { isInvalid } = useAuthFieldInvalid(form)
const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues([...values.value.ids].sort(), [...interestsValues(profile.value).ids].sort()))

// What is saved replaces what is in the form: after a save, and when the profile loads.
watch(profile, saved => form.reset(interestsValues(saved)), { immediate: true })

const query = ref('')
const shown = computed(() => {
  const wanted = query.value.trim().toLowerCase()
  if (!wanted) return options.value
  return options.value.filter(area => area.name.toLowerCase().includes(wanted) || area.description?.toLowerCase().includes(wanted))
})

/** What this section uses of the array field. */
type IdsField = { state: { value: string[] }, pushValue: (id: string) => unknown, removeValue: (index: number) => unknown, handleBlur: () => void }

function setTicked(field: IdsField, id: string, ticked: boolean) {
  const index = field.state.value.indexOf(id)
  if (ticked && index === -1 && field.state.value.length < MAX_INTERESTS) field.pushValue(id)
  if (!ticked && index !== -1) field.removeValue(index)
  field.handleBlur()
}
</script>

<template>
  <SettingsSectionCard
    title="Legal interests"
    :description="`Choose up to ${MAX_INTERESTS} areas you want help with. We use them to suggest lawyers who fit.`"
  >
    <template v-if="!isLoading && hasClientProfile" #action>
      <div class="flex items-center gap-2">
        <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="isSaving" @click="form.reset(interestsValues(profile))">Discard</Button>
        <Button type="submit" :form="formId" variant="canopy" size="pill-sm" :disabled="!dirty || isSaving" :aria-busy="isSaving">{{ isSaving ? 'Saving…' : 'Save' }}</Button>
      </div>
    </template>

    <LoadingRegion v-if="isLoading || isLoadingOptions" label="Loading practice areas" class="grid grid-cols-1 gap-4">
      <Skeleton class="h-12 w-full rounded-xl" />
      <div>
        <LoadingLine size="sm" class="w-36" />
        <div class="mt-2 grid gap-2 sm:grid-cols-2">
          <div v-for="n in 6" :key="n" class="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <Skeleton class="size-4 flex-none rounded-sm" />
            <LoadingLine class="-mt-1 w-32" />
          </div>
        </div>
      </div>
    </LoadingRegion>

    <p v-else-if="!hasClientProfile" class="py-6 text-center text-muted-foreground">Finish setting up your account to choose your legal interests.</p>

    <form v-else :id="formId" novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4">
        <label class="relative block">
          <span class="sr-only">Search practice areas</span>
          <CanopyGlyph name="search" :size="16" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="query" type="search" autocomplete="off" placeholder="Search practice areas" :class="[authInput, 'pl-10.5']" />
        </label>

        <form.Field v-slot="{ field }" name="ids" mode="array">
          <FieldSet :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLegend variant="label" :class="canopyLabel">
              Areas
              <span class="font-normal text-muted-foreground">{{ field.state.value.length }} of {{ MAX_INTERESTS }} chosen</span>
            </FieldLegend>

            <p v-if="shown.length === 0" class="py-4 text-muted-foreground">No practice area matches "{{ query.trim() }}".</p>
            <div v-else class="grid gap-2 sm:grid-cols-2">
              <FieldLabel
                v-for="area in shown"
                :key="area.id"
                :for="`${formId}-${area.id}`"
                :class="[canopyChoice, !field.state.value.includes(area.id) && field.state.value.length >= MAX_INTERESTS ? 'cursor-not-allowed opacity-50' : '']"
              >
                <Field orientation="horizontal" class="items-start">
                  <Checkbox
                    :id="`${formId}-${area.id}`"
                    :class="canopyCheckbox"
                    :model-value="field.state.value.includes(area.id)"
                    :disabled="isSaving || (!field.state.value.includes(area.id) && field.state.value.length >= MAX_INTERESTS)"
                    @update:model-value="(ticked) => setTicked(field, area.id, ticked === true)"
                  />
                  <span class="grid min-w-0 gap-0.5">
                    <span class="text-sm leading-snug font-medium text-foreground">{{ area.name }}</span>
                    <span v-if="area.description" class="line-clamp-2 text-sm leading-normal font-normal text-muted-foreground">{{ area.description }}</span>
                  </span>
                </Field>
              </FieldLabel>
            </div>

            <FieldDescription v-if="field.state.value.length >= MAX_INTERESTS" :class="canopyHint">Untick one to choose a different area.</FieldDescription>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </FieldSet>
        </form.Field>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
