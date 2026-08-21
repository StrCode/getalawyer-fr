<script setup lang="ts">
import { ArrowDown01Icon, Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, useId, watch } from 'vue'
import {
  ListboxContent,
  ListboxFilter,
  ListboxItem,
  ListboxItemIndicator,
  ListboxRoot,
  useFilter,
} from 'reka-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useSpecializations } from '~/composables/useSpecializations'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { createLawyerPracticeInfoSchema } from '~/schemas/lawyerPracticeInfo'
import type { PracticeAreaSelection } from '~/lib/practice-areas'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
import { NIGERIA_STATE_NAMES } from '@/constants/nigeria-states-lgas'

type PracticeAreaOption = {
  id: string
  name: string
  description?: string | null
}

const fieldControlClass =
  'h-11 w-full rounded-xl border-border/50 bg-background text-base shadow-none focus:bg-background'
const fieldLabelClass = 'text-sm'
const fieldClass = 'gap-2'

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('practice_info')

const store = useLawyerOnboardingStore()
const soloPractitionerFieldId = useId()

function snapshotFromStore() {
  const p = store.practiceInfo
  return {
    soloPractitioner: p.soloPractitioner,
    firmName: p.firmName ?? '',
    practiceAreas: [...p.practiceAreas],
    statesOfPractice: [...p.statesOfPractice],
    primaryState: p.primaryState ?? p.statesOfPractice[0] ?? '',
    additionalPracticeStates: [...p.additionalPracticeStates],
  }
}

function deriveStates(primary: string, additional: string[]) {
  const extras = additional.filter((s) => s && s !== primary)
  return primary ? [primary, ...extras] : extras
}

type PracticeFormValues = ReturnType<typeof snapshotFromStore>

function applyToStore(v: PracticeFormValues) {
  Object.assign(store.practiceInfo, {
    soloPractitioner: v.soloPractitioner,
    firmName: v.firmName,
    practiceAreas: v.practiceAreas,
    statesOfPractice: v.statesOfPractice,
    primaryState: v.primaryState,
    additionalPracticeStates: v.additionalPracticeStates,
  })
}

const practiceSchema = computed(() =>
  createLawyerPracticeInfoSchema(store.professionalInfo.yearOfCall, {
    requireLegalAcceptances: false,
  }),
)

const { form, formValues, isInvalid } = useWizardStepForm({
  draftSection: 'practice',
  snapshot: snapshotFromStore,
  // Legal acceptances live in the store (review step), not in this step's form.
  parse: (values) => practiceSchema.value.safeParse({ ...store.practiceInfo, ...values }),
  sync: applyToStore,
  commit: applyToStore,
})

function syncFormToStore() {
  applyToStore(formValues.value)
}

watch(
  () => formValues.value.soloPractitioner,
  (solo) => {
    if (solo && formValues.value.firmName) {
      form.setFieldValue('firmName', '')
    }
  },
)

const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializations = computed(() => specData.value || [])
const additionalStateQuery = ref('')

const practiceAreaOptions = computed<PracticeAreaOption[]>(() =>
  specializations.value.map((s: { id: string; name: string; description?: string | null }) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  })),
)

const selectedAreas = computed(() => formValues.value.practiceAreas ?? [])
const selectedCount = computed(() => selectedAreas.value.length)

const selectedPracticeAreaOptions = computed<PracticeAreaOption[]>({
  get() {
    const selected = selectedAreas.value
    if (!selected.length) return []
    return practiceAreaOptions.value.filter((opt) =>
      selected.some((row) => row.practiceAreaId === opt.id),
    )
  },
  set(next) {
    const capped = next.length > 5 ? next.slice(0, 5) : next
    const current = selectedAreas.value
    const mapped: PracticeAreaSelection[] = capped.map((opt) => ({
      practiceAreaId: opt.id,
      yearsOfExperience:
        current.find((row) => row.practiceAreaId === opt.id)?.yearsOfExperience ?? null,
    }))
    form.setFieldValue('practiceAreas', mapped)
    syncFormToStore()
  },
})

function onPracticeAreasChange(value: PracticeAreaOption[] | PracticeAreaOption | undefined) {
  const next = Array.isArray(value) ? value : value ? [value] : []
  selectedPracticeAreaOptions.value = next
}

function removePracticeArea(id: string) {
  selectedPracticeAreaOptions.value = selectedPracticeAreaOptions.value.filter((opt) => opt.id !== id)
}

function isPracticeAreaDisabled(id: string) {
  return selectedCount.value >= 5 && !selectedAreas.value.some((row) => row.practiceAreaId === id)
}

const practiceAreasTriggerLabel = computed(() => {
  if (selectedCount.value === 0) return 'Select practice areas…'
  if (selectedCount.value === 1) return selectedPracticeAreaOptions.value[0]?.name ?? '1 selected'
  return `${selectedCount.value} areas selected`
})

const additionalStates = computed(() => {
  const raw = formValues.value.additionalPracticeStates
  return Array.isArray(raw) ? [...raw] : []
})

const additionalStatesPopoverOpen = ref(false)
const { contains } = useFilter({ sensitivity: 'base' })

function applyPrimaryAndAdditional(primary: string, additional: string[]) {
  const extras = additional.filter((s) => s && s !== primary)
  form.setFieldValue('primaryState', primary)
  form.setFieldValue('additionalPracticeStates', extras)
  form.setFieldValue('statesOfPractice', deriveStates(primary, extras))
  syncFormToStore()
}

function onPrimaryStateChange(
  value: unknown,
  field: { handleChange: (v: string) => void; handleBlur: () => void },
) {
  const primary = String(value ?? '')
  field.handleChange(primary)
  field.handleBlur()
  applyPrimaryAndAdditional(primary, formValues.value.additionalPracticeStates ?? [])
}

function syncAdditionalStates(value: string[], field?: { handleBlur: () => void }) {
  const primary = formValues.value.primaryState ?? ''
  applyPrimaryAndAdditional(primary, value)
  field?.handleBlur()
}

const additionalStateOptions = computed(() => {
  const primary = formValues.value.primaryState
  const base = primary
    ? NIGERIA_STATE_NAMES.filter((name) => name !== primary)
    : NIGERIA_STATE_NAMES
  const q = additionalStateQuery.value.trim()
  if (!q) return base
  return base.filter((name) => contains(name, q))
})

watch(additionalStateQuery, (q) => {
  if (q) additionalStatesPopoverOpen.value = true
})

const listboxItemClass = cn(
  'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
)

</script>

<template>
  <div v-if="isLoadingSpecs" class="flex flex-col gap-4 py-8">
    <Skeleton class="h-10 w-full rounded-lg" />
    <div class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
    </div>
  </div>

  <div v-else class="flex w-full flex-col gap-6">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <Card class="gap-0 p-6 sm:p-8">
      <FieldGroup class="gap-6">
        <FieldSet class="gap-4">
          <FieldGroup class="gap-5">
            <form.Field v-slot="{ field }" name="soloPractitioner">
              <Field :class="fieldClass">
                <Label
                  :for="soloPractitionerFieldId"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-background p-4 transition-colors has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
                >
                  <Checkbox
                    :id="soloPractitionerFieldId"
                    :model-value="field.state.value === true"
                    class="mt-0.5"
                    @update:model-value="(v) => {
                      field.handleChange(!!v)
                      field.handleBlur()
                    }"
                  />
                  <span class="grid gap-1">
                    <span class="text-sm font-medium text-foreground">I am a solo practitioner</span>
                    <span class="text-xs text-muted-foreground">
                      You practise under your own name — no firm on your profile.
                    </span>
                  </span>
                </Label>
              </Field>
            </form.Field>

            <form.Field v-if="!formValues.soloPractitioner" v-slot="{ field }" name="firmName">
              <Field
                :class="fieldClass"
                :data-invalid="isInvalid(field)"
              >
                <FieldLabel :for="field.name" :class="fieldLabelClass">
                  Firm or practice name
                </FieldLabel>
                <Input
                  :id="field.name"
                  :model-value="field.state.value"
                  :class="fieldControlClass"
                  placeholder="e.g. Adeyemi & Partners"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet class="gap-4 border-t border-border/40 pt-6">
          <form.Field v-slot="{ field }" name="practiceAreas">
            <Field
              :class="fieldClass"
              :data-invalid="isInvalid(field)"
            >
              <FieldLabel :class="fieldLabelClass">
                Practice areas
              </FieldLabel>
              <FieldDescription>
                Choose up to 5. You can add years of experience later on your profile.
              </FieldDescription>

              <Combobox
                :model-value="selectedPracticeAreaOptions"
                multiple
                by="id"
                @update:model-value="onPracticeAreasChange"
                @blur="field.handleBlur"
              >
                <ComboboxAnchor as-child class="w-full">
                  <ComboboxTrigger as-child>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      :class="[
                        fieldControlClass,
                        'justify-between px-3 font-normal',
                        !selectedCount && 'text-muted-foreground',
                      ]"
                      :aria-invalid="isInvalid(field) || undefined"
                    >
                      <span class="truncate">{{ practiceAreasTriggerLabel }}</span>
                      <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 opacity-50" />
                    </Button>
                  </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList class="w-(--reka-combobox-trigger-width) p-0" align="start">
                  <ComboboxInput placeholder="Search legal areas…" />
                  <ComboboxEmpty>No practice area found.</ComboboxEmpty>
                  <ComboboxGroup class="max-h-60 overflow-y-auto p-1">
                    <ComboboxItem
                      v-for="opt in practiceAreaOptions"
                      :key="opt.id"
                      :value="opt"
                      :disabled="isPracticeAreaDisabled(opt.id)"
                      class="items-start"
                    >
                      <div
                        class="pointer-events-none mt-0.5 size-4 shrink-0 rounded-sm border border-input transition-all select-none *:[svg]:opacity-0 data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:*:[svg]:opacity-100"
                        :data-selected="selectedAreas.some((row) => row.practiceAreaId === opt.id) || undefined"
                      >
                        <HugeiconsIcon :icon="Tick01Icon" class="size-3.5 text-current" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate leading-snug">{{ opt.name }}</p>
                        <p
                          v-if="opt.description"
                          class="truncate text-xs text-muted-foreground"
                        >
                          {{ opt.description }}
                        </p>
                      </div>
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>

              <p class="text-xs text-muted-foreground">
                Selected {{ selectedCount }}/5
              </p>

              <div v-if="selectedCount > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="opt in selectedPracticeAreaOptions"
                  :key="opt.id"
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  @click="removePracticeArea(opt.id)"
                >
                  {{ opt.name }}
                  <HugeiconsIcon :icon="Cancel01Icon" class="size-3" />
                </button>
              </div>

              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldSet>

        <FieldSet class="gap-4 border-t border-border/40 pt-6">
          <FieldGroup class="gap-5">
            <form.Field v-slot="{ field }" name="primaryState">
              <Field
                :class="fieldClass"
                :data-invalid="isInvalid(field)"
              >
                <FieldLabel :for="field.name" :class="fieldLabelClass">
                  Primary state
                </FieldLabel>
                <Select
                  :model-value="field.state.value || undefined"
                  @update:model-value="(v) => onPrimaryStateChange(v, field)"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="fieldControlClass"
                    :aria-invalid="isInvalid(field)"
                  >
                    <SelectValue placeholder="Select your main state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="s in NIGERIA_STATE_NAMES" :key="s" :value="s">
                      {{ s }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Your main base for client matching.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="additionalPracticeStates">
              <Field
                :class="fieldClass"
                :data-invalid="isInvalid(field)"
                :data-disabled="!formValues.primaryState || undefined"
              >
                <FieldLabel :class="fieldLabelClass">
                  Also practise in
                  <span class="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Popover v-model:open="additionalStatesPopoverOpen">
                  <ListboxRoot
                    :model-value="additionalStates"
                    multiple
                    highlight-on-hover
                    :disabled="!formValues.primaryState"
                    @update:model-value="(v) => syncAdditionalStates(v, field)"
                  >
                    <PopoverAnchor class="w-full">
                      <TagsInput
                        v-slot="{ modelValue: stateTags }"
                        :model-value="additionalStates"
                        :disabled="!formValues.primaryState"
                        :aria-invalid="isInvalid(field)"
                        class="h-auto min-h-11 w-full gap-1.5 rounded-xl border-border/50 bg-background px-2 py-1.5 shadow-none"
                        @update:model-value="(v) => syncAdditionalStates(v, field)"
                      >
                        <TagsInputItem
                          v-for="item in stateTags"
                          :key="item"
                          :value="item"
                          class="rounded-md border border-primary/25 bg-primary/10 text-primary"
                        >
                          <TagsInputItemText class="text-xs font-medium" />
                          <TagsInputItemDelete />
                        </TagsInputItem>

                        <ListboxFilter v-model="additionalStateQuery" as-child>
                          <TagsInputInput
                            :placeholder="formValues.primaryState ? 'Add other states…' : 'Select primary state first'"
                            :disabled="!formValues.primaryState"
                            class="min-h-8 text-base placeholder:text-muted-foreground"
                            @keydown.enter.prevent
                            @keydown.down="additionalStatesPopoverOpen = true"
                          />
                        </ListboxFilter>

                        <PopoverTrigger as-child>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            class="order-last ml-auto shrink-0 self-center"
                            :disabled="!formValues.primaryState"
                            aria-label="Open additional states list"
                          >
                            <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                      </TagsInput>
                    </PopoverAnchor>
                    <PopoverContent
                      class="w-(--reka-popover-trigger-width) p-1"
                      align="start"
                      @open-auto-focus.prevent
                    >
                      <ListboxContent
                        class="max-h-[min(280px,50vh)] scroll-py-1 overflow-x-hidden overflow-y-auto"
                        tabindex="0"
                      >
                        <p
                          v-if="additionalStateOptions.length === 0"
                          class="py-6 text-center text-sm text-muted-foreground"
                        >
                          No states match your search.
                        </p>
                        <ListboxItem
                          v-for="s in additionalStateOptions"
                          :key="s"
                          :value="s"
                          :class="listboxItemClass"
                          @select="additionalStateQuery = ''"
                        >
                          <span class="min-w-0 leading-snug">{{ s }}</span>
                          <ListboxItemIndicator class="ml-auto inline-flex items-center justify-center">
                            <HugeiconsIcon :icon="Tick01Icon" class="size-4 text-primary" />
                          </ListboxItemIndicator>
                        </ListboxItem>
                      </ListboxContent>
                    </PopoverContent>
                  </ListboxRoot>
                </Popover>
                <FieldDescription>
                  Other states where you’re licensed or actively practising.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </Card>
  </div>
</template>
