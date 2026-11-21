<script setup lang="ts">
import { ArrowDown01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useForm } from '@tanstack/vue-form'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useSpecializations } from '~/composables/useSpecializations'
import {
  MAX_PRACTICE_AREAS,
  practiceAreasPayload,
  practiceAreasSchema,
  practiceAreasValues,
  sameValues,
  type PracticeAreasValues,
} from '~/lib/profile-forms'
import type { LawyerProfilePracticeArea, ReplacePracticeAreasInput } from '~/types/lawyer-profile-editor'

/**
 * The kinds of work a lawyer takes on: up to five, each with the years they
 * have done it. Clients find a lawyer in search by these. The areas are one
 * array field; the picker adds to and removes from it, and each chosen area
 * has its own years field.
 */
const props = defineProps<{
  practiceAreas: LawyerProfilePracticeArea[]
  disabled?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ReplacePracticeAreasInput]
}>()

type AreaOption = { id: string, name: string, description?: string | null }
type Chosen = PracticeAreasValues['areas']
/** What this section uses of the array field. */
type AreasField = {
  state: { value: Chosen }
  pushValue: (value: Chosen[number]) => unknown
  removeValue: (index: number) => unknown
  handleBlur: () => void
}

const { data: specializations, isPending: isLoadingSpecs } = useSpecializations()

const options = computed<AreaOption[]>(() =>
  (specializations.value ?? []).map((item: AreaOption) => ({ id: item.id, name: item.name, description: item.description })),
)

const form = useForm({
  defaultValues: practiceAreasValues(props.practiceAreas),
  validators: {
    onChange: practiceAreasSchema,
  },
  listeners: {
    onBlur: ({ fieldApi }) => {
      fieldApi.validate('change')
    },
  },
  onSubmit: ({ value }) => {
    emit('save', practiceAreasPayload(practiceAreasSchema.parse(value)))
  },
})

const { isInvalid } = useAuthFieldInvalid(form)

const values = form.useStore(state => state.values)
const dirty = computed(() => !sameValues(values.value, practiceAreasValues(props.practiceAreas)))
const chosenCount = computed(() => values.value.areas.length)

// What is saved replaces what is in the form: after a save, and when the profile reloads.
watch(() => props.practiceAreas, saved => form.reset(practiceAreasValues(saved)), { deep: true })

/** The picker's ticked options: the chosen areas, as the options it lists. */
const pickedOptions = computed(() =>
  options.value.filter(option => values.value.areas.some(area => area.specializationId === option.id)),
)

function nameOf(id: string): string {
  return options.value.find(option => option.id === id)?.name
    ?? props.practiceAreas.find(area => area.id === id)?.name
    ?? 'Practice area'
}

function isFull(id: string): boolean {
  return chosenCount.value >= MAX_PRACTICE_AREAS && !values.value.areas.some(area => area.specializationId === id)
}

/** The picker hands back every ticked option; bring the array field in line with it. */
function onPick(value: unknown, field: AreasField) {
  const picked = (Array.isArray(value) ? value : value ? [value] : []) as AreaOption[]
  const ids = new Set(picked.map(option => option.id))
  // unticked areas go, from the end so the positions before them stay right
  for (let index = field.state.value.length - 1; index >= 0; index--) {
    if (!ids.has(field.state.value[index]!.specializationId)) field.removeValue(index)
  }
  for (const option of picked) {
    if (field.state.value.length >= MAX_PRACTICE_AREAS) break
    if (!field.state.value.some(area => area.specializationId === option.id)) field.pushValue({ specializationId: option.id, years: '' })
  }
  field.handleBlur()
}

const triggerLabel = computed(() => {
  if (chosenCount.value === 0) return 'Choose practice areas'
  if (chosenCount.value === 1) return nameOf(values.value.areas[0]!.specializationId)
  return `${chosenCount.value} areas chosen`
})
</script>

<template>
  <SettingsSectionCard
    title="Practice areas"
    :description="`The kinds of work you take on. Clients find you in search by these. Choose up to ${MAX_PRACTICE_AREAS}.`"
  >
    <LoadingRegion v-if="isLoadingSpecs" label="Loading practice areas">
      <LoadingLine size="sm" class="w-48" />
      <Skeleton class="mt-2 h-12 w-full rounded-xl" />
      <div class="mt-3 grid gap-2">
        <Skeleton v-for="n in 2" :key="n" class="h-15 w-full rounded-lg" />
      </div>
    </LoadingRegion>

    <form v-else novalidate @submit.prevent="form.handleSubmit">
      <FieldGroup class="gap-4.5">
        <form.Field v-slot="{ field }" name="areas" mode="array">
          <Field :class="canopyField" :data-invalid="isInvalid(field)">
            <FieldLabel :class="canopyLabel">
              What you take on
              <span class="font-normal text-muted-foreground">{{ field.state.value.length }} of {{ MAX_PRACTICE_AREAS }} chosen</span>
            </FieldLabel>

            <Combobox
              :model-value="pickedOptions"
              multiple
              by="id"
              :disabled="disabled || saving"
              @update:model-value="(v) => onPick(v, field)"
            >
              <ComboboxAnchor as-child class="w-full">
                <ComboboxTrigger as-child>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    :class="[canopyTrigger, field.state.value.length === 0 && 'text-placeholder hover:text-placeholder']"
                    :aria-invalid="isInvalid(field) || undefined"
                    :disabled="disabled || saving"
                  >
                    <span class="truncate">{{ triggerLabel }}</span>
                    <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 opacity-50" />
                  </Button>
                </ComboboxTrigger>
              </ComboboxAnchor>

              <ComboboxList class="w-(--reka-combobox-trigger-width) p-0" :class="canopyPanel" align="start">
                <ComboboxInput placeholder="Search practice areas" />
                <ComboboxEmpty>No practice area found.</ComboboxEmpty>
                <ComboboxGroup class="max-h-60 overflow-y-auto p-1">
                  <ComboboxItem
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    :disabled="isFull(option.id)"
                    class="items-start"
                  >
                    <div
                      class="pointer-events-none mt-0.5 size-4 shrink-0 rounded-sm border border-input transition-colors select-none *:[svg]:opacity-0 data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:*:[svg]:opacity-100"
                      :data-selected="field.state.value.some(area => area.specializationId === option.id) || undefined"
                    >
                      <HugeiconsIcon :icon="Tick01Icon" class="size-3.5 text-current" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate leading-snug">{{ option.name }}</p>
                      <p v-if="option.description" class="truncate text-xs text-muted-foreground">{{ option.description }}</p>
                    </div>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </Combobox>

            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />

            <!-- each chosen area, with the years spent on it -->
            <FieldSet v-if="field.state.value.length > 0" class="mt-2 min-w-0 gap-2.5">
              <FieldLegend variant="label" :class="canopyLabel">Years of experience in each</FieldLegend>
              <ul class="grid grid-cols-1 gap-2">
                <li
                  v-for="(area, index) in field.state.value"
                  :key="area.specializationId"
                  class="flex flex-wrap items-start gap-x-3.5 gap-y-2 rounded-lg border border-border bg-background/60 px-4 py-2.75"
                >
                  <p class="min-w-0 grow basis-48 self-center font-medium">{{ nameOf(area.specializationId) }}</p>
                  <form.Field v-slot="{ field: years }" :name="`areas[${index}].years`">
                    <Field :class="[canopyField, 'w-34 flex-none']" :data-invalid="isInvalid(years)">
                      <FieldLabel :for="years.name" class="sr-only">Years of experience in {{ nameOf(area.specializationId) }}</FieldLabel>
                      <Input
                        :id="years.name"
                        :name="years.name"
                        :model-value="years.state.value"
                        :class="[authInput, 'h-11 tabular-nums']"
                        inputmode="numeric"
                        maxlength="2"
                        placeholder="Years"
                        :aria-invalid="isInvalid(years)"
                        :disabled="disabled || saving"
                        @blur="years.handleBlur"
                        @update:model-value="(v) => years.handleChange(String(v ?? ''))"
                      />
                      <FieldError v-if="isInvalid(years)" :errors="years.state.meta.errors" />
                    </Field>
                  </form.Field>
                  <Button
                    type="button"
                    variant="line"
                    size="pill-sm"
                    class="h-11 flex-none px-3.75 text-sm"
                    :disabled="disabled || saving"
                    :aria-label="`Remove ${nameOf(area.specializationId)}`"
                    @click="() => { field.removeValue(index); field.handleBlur() }"
                  >
                    Remove
                  </Button>
                </li>
              </ul>
              <FieldDescription :class="canopyHint">Years are optional. Leave one empty if you would rather not say.</FieldDescription>
            </FieldSet>
          </Field>
        </form.Field>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="dirty" type="button" variant="line" size="pill-sm" :disabled="saving" @click="form.reset(practiceAreasValues(practiceAreas))">Discard</Button>
          <Button type="submit" variant="canopy" size="pill-sm" :disabled="disabled || !dirty || saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
        </div>
      </FieldGroup>
    </form>
  </SettingsSectionCard>
</template>
