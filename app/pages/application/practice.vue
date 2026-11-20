<script setup lang="ts">
import { ArrowDown01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
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

definePageMeta({
  layout: 'application',
  middleware: ['auth', 'application'],
})

const step = getLawyerStepDisplay('practice_info')

useHead({ title: step.label })

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

/** Combobox emits reka-ui's AcceptableValue; with `multiple` + `by="id"` it is our option objects. */
function onPracticeAreasChange(value: unknown) {
  const next = Array.isArray(value)
    ? (value as PracticeAreaOption[])
    : value
      ? [value as PracticeAreaOption]
      : []
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

/** Listbox / TagsInput emit reka-ui's AcceptableValue; we only ever store state names. */
function syncAdditionalStates(value: unknown, field?: { handleBlur: () => void }) {
  const primary = formValues.value.primaryState ?? ''
  const states = Array.isArray(value) ? value.map((s) => String(s)) : []
  applyPrimaryAndAdditional(primary, states)
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
  'relative flex cursor-default select-none items-center gap-2 rounded-[0.6rem] px-2.5 py-2 text-[0.95rem] outline-hidden',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
)

</script>

<template>
  <ApplicationSkeleton v-if="isLoadingSpecs" shape="form" label="Loading practice areas" />

  <div v-else>
    <ApplicationSectionHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <div :class="canopyForm">
        <FieldSet :class="canopyGroup">
          <legend :class="canopyLegend">Your practice</legend>
          <div class="grid gap-[0.9rem]">
            <form.Field v-slot="{ field }" name="soloPractitioner">
              <Field :class="canopyField">
                <Label :for="soloPractitionerFieldId" :class="canopyChoice">
                  <Checkbox
                    :id="soloPractitionerFieldId"
                    :model-value="field.state.value === true"
                    :class="canopyCheckbox"
                    @update:model-value="(v) => {
                      field.handleChange(!!v)
                      field.handleBlur()
                    }"
                  />
                  <span class="grid gap-1">
                    <span class="text-[0.95rem] leading-snug font-semibold text-foreground">I am a solo practitioner</span>
                    <span class="text-[0.85rem] leading-normal font-normal text-muted-foreground">
                      You practise under your own name, with no firm on your profile.
                    </span>
                  </span>
                </Label>
              </Field>
            </form.Field>

            <form.Field v-if="!formValues.soloPractitioner" v-slot="{ field }" name="firmName">
              <Field
                :class="canopyField"
                :data-invalid="isInvalid(field)"
              >
                <FieldLabel :for="field.name" :class="canopyLabel">
                  Firm or practice name
                </FieldLabel>
                <Input
                  :id="field.name"
                  :model-value="field.state.value"
                  :class="authInput"
                  placeholder="e.g. Adeyemi & Partners"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @update:model-value="(v) => field.handleChange(String(v ?? ''))"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>
        </FieldSet>

        <FieldSet :class="canopyGroup">
          <legend :class="canopyLegend">Practice areas</legend>
          <form.Field v-slot="{ field }" name="practiceAreas">
            <Field
              :class="canopyField"
              :data-invalid="isInvalid(field)"
            >
              <FieldLabel :class="canopyLabel">
                What you take on
                <span class="font-normal text-muted-foreground">{{ selectedCount }} of 5 chosen</span>
              </FieldLabel>

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
                      :class="[canopyTrigger, !selectedCount && 'text-placeholder hover:text-placeholder']"
                      :aria-invalid="isInvalid(field) || undefined"
                    >
                      <span class="truncate">{{ practiceAreasTriggerLabel }}</span>
                      <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 opacity-50" />
                    </Button>
                  </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList class="w-(--reka-combobox-trigger-width) p-0" :class="canopyPanel" align="start">
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

              <ul v-if="selectedCount > 0" class="flex flex-wrap gap-2" aria-label="Chosen practice areas">
                <li v-for="opt in selectedPracticeAreaOptions" :key="opt.id">
                  <button type="button" :class="canopyChip" class="cursor-pointer" :aria-label="`Remove ${opt.name}`" @click="removePracticeArea(opt.id)">
                    {{ opt.name }}
                    <CanopyGlyph name="close" :size="12" :stroke="2.6" />
                  </button>
                </li>
              </ul>

              <FieldDescription :class="canopyHint">
                Choose up to 5. You can add years of experience later on your profile.
              </FieldDescription>

              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldSet>

        <FieldSet :class="canopyGroup">
          <legend :class="canopyLegend">Where you practise</legend>
          <div class="grid gap-[0.9rem]">
            <form.Field v-slot="{ field }" name="primaryState">
              <Field
                :class="canopyField"
                :data-invalid="isInvalid(field)"
              >
                <FieldLabel :for="field.name" :class="canopyLabel">
                  Primary state
                </FieldLabel>
                <Select
                  :model-value="field.state.value || undefined"
                  @update:model-value="(v) => onPrimaryStateChange(v, field)"
                >
                  <SelectTrigger
                    :id="field.name"
                    :class="canopySelect"
                    :aria-invalid="isInvalid(field)"
                  >
                    <SelectValue placeholder="Select your main state" />
                  </SelectTrigger>
                  <SelectContent :class="canopyPanel">
                    <SelectItem v-for="s in NIGERIA_STATE_NAMES" :key="s" :value="s">
                      {{ s }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription :class="canopyHint">
                  Your main base for client matching.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>

            <form.Field v-slot="{ field }" name="additionalPracticeStates">
              <Field
                :class="canopyField"
                :data-invalid="isInvalid(field)"
                :data-disabled="!formValues.primaryState || undefined"
              >
                <FieldLabel :class="canopyLabel">
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
                        class="h-auto min-h-[3.25rem] w-full gap-1.5 rounded-[1rem] border-border bg-card px-2 py-1.5 shadow-none focus-within:border-brand focus-within:ring-4 focus-within:ring-mint"
                        @update:model-value="(v) => syncAdditionalStates(v, field)"
                      >
                        <TagsInputItem
                          v-for="item in stateTags"
                          :key="String(item)"
                          :value="item"
                          class="h-8 rounded-full bg-mint pl-1 text-deep"
                        >
                          <TagsInputItemText class="text-[0.85rem] font-semibold" />
                          <TagsInputItemDelete />
                        </TagsInputItem>

                        <ListboxFilter v-model="additionalStateQuery" as-child>
                          <TagsInputInput
                            :placeholder="formValues.primaryState ? 'Add other states…' : 'Select primary state first'"
                            :disabled="!formValues.primaryState"
                            class="min-h-8 px-2 text-[1.02rem] placeholder:text-placeholder"
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
                      :class="canopyPanel"
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
                <FieldDescription :class="canopyHint">
                  Other states where you actively practise.
                </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>
        </FieldSet>
    </div>
  </div>
</template>
