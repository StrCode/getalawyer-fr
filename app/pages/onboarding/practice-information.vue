<script setup lang="ts">
import { ArrowDown01Icon, Cancel01Icon, CheckmarkCircle01Icon, Loading03Icon, Search01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
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
import LegalAcceptanceFields from '~/components/onboarding/LegalAcceptanceFields.vue'
import { cn } from '@/lib/utils'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'
import { useSpecializations } from '~/composables/useSpecializations'
import { getLawyerStepDisplay } from '~/lib/lawyer-onboarding-steps'
import { createLawyerPracticeInfoSchema } from '~/schemas/lawyerPracticeInfo'
import type { PracticeAreaSelection } from '~/lib/practice-areas'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
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

definePageMeta({
  layout: 'onboarding-wizard',
  middleware: ['auth', 'lawyer-onboarding-guard'],
})

const step = getLawyerStepDisplay('practice_info')

const store = useLawyerOnboardingStore()
const soloPractitionerFieldId = useId()

const registerValidate = inject<
  ((fn: (() => Promise<boolean>) | null) => void) | undefined
>('registerLawyerOnboardingStepValidate', undefined)

function snapshotFromStore() {
  const p = store.practiceInfo
  return {
    soloPractitioner: p.soloPractitioner,
    firmName: p.firmName ?? '',
    practiceAreas: [...p.practiceAreas],
    statesOfPractice: [...p.statesOfPractice],
    primaryState: p.primaryState ?? p.statesOfPractice[0] ?? '',
    additionalPracticeStates: [...p.additionalPracticeStates],
    termsAccepted: p.termsAccepted,
    termsVersion: p.termsVersion,
    refundPolicyAccepted: p.refundPolicyAccepted,
  }
}

function syncPrimaryAndAdditional(states: string[], primary?: string) {
  const list = [...states]
  const nextPrimary =
    list.length === 0
      ? ''
      : primary && list.includes(primary)
        ? primary
        : list[0]!
  const nextAdditional = list.length === 0 ? [] : list.filter((s) => s !== nextPrimary)

  if (formValues.value.primaryState !== nextPrimary) {
    form.setFieldValue('primaryState', nextPrimary)
  }
  const currentAdditional = formValues.value.additionalPracticeStates ?? []
  if (
    currentAdditional.length !== nextAdditional.length
    || currentAdditional.some((s, i) => s !== nextAdditional[i])
  ) {
    form.setFieldValue('additionalPracticeStates', nextAdditional)
  }
}

function syncFormToStore() {
  Object.assign(store.practiceInfo, { ...formValues.value })
}

const practiceSchema = computed(() =>
  createLawyerPracticeInfoSchema(store.professionalInfo.yearOfCall),
)

const form = useForm({
  defaultValues: snapshotFromStore(),
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    Object.assign(store.practiceInfo, value)
  },
})

const formValues = form.useStore((state) => state.values)

/** Keep Pinia in sync for wizard save; avoid watchers that call setFieldValue on the same form. */
watch(formValues, () => syncFormToStore(), { deep: true })

watch(
  () => formValues.value.soloPractitioner,
  (solo) => {
    if (solo && formValues.value.firmName) {
      form.setFieldValue('firmName', '')
    }
    if (solo) clearValidationMessage('firmName')
  },
)

const submitAttempted = ref(false)
const validationMessages = ref<Record<string, string>>({})

function isInvalid(field: { state: { meta: { isTouched: boolean; isValid: boolean } } }) {
  if (submitAttempted.value) return !field.state.meta.isValid
  return field.state.meta.isTouched && !field.state.meta.isValid
}

function fieldMessage(name: string) {
  return validationMessages.value[name]
}

function hasFieldError(name: string) {
  return submitAttempted.value && Boolean(fieldMessage(name))
}

function setValidationMessages(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const next: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!next[key]) next[key] = issue.message
  }
  validationMessages.value = next
  store.validationError = issues[0]?.message ?? 'Please check your practice details.'
}

function clearValidationMessage(name: string) {
  if (!validationMessages.value[name]) return
  const { [name]: _removed, ...rest } = validationMessages.value
  validationMessages.value = rest
  store.validationError = Object.values(rest)[0] ?? null
}

const { data: specData, isPending: isLoadingSpecs } = useSpecializations()
const specializations = computed(() => specData.value || [])
const query = ref('')
const stateQuery = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return specializations.value
  return specializations.value.filter((s: { name: string; description?: string }) =>
    s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
  )
})

const selectedAreas = computed(() => formValues.value.practiceAreas ?? [])

const selectedCount = computed(() => selectedAreas.value.length)

const selectedStates = computed(() => {
  const raw = formValues.value.statesOfPractice
  return Array.isArray(raw) ? [...raw] : []
})

const statesPopoverOpen = ref(false)
const { contains } = useFilter({ sensitivity: 'base' })

function syncStates(value: string[], field?: { handleBlur: () => void }) {
  form.setFieldValue('statesOfPractice', value)
  if (value.length > 0) clearValidationMessage('statesOfPractice')
  syncPrimaryAndAdditional(value, formValues.value.primaryState)
  syncFormToStore()
  field?.handleBlur()
}

function onPrimaryStateChange(
  value: unknown,
  field: { handleChange: (v: string) => void; handleBlur: () => void },
) {
  const primary = String(value ?? '')
  field.handleChange(primary)
  field.handleBlur()
  if (primary) clearValidationMessage('primaryState')
  const list = Array.isArray(formValues.value.statesOfPractice)
    ? [...formValues.value.statesOfPractice]
    : []
  syncPrimaryAndAdditional(list, primary)
  syncFormToStore()
}

function isAreaSelected(id: string) {
  return selectedAreas.value.some((a) => a.practiceAreaId === id)
}

function getAreaYears(id: string): number | '' {
  const row = selectedAreas.value.find((a) => a.practiceAreaId === id)
  if (row?.yearsOfExperience == null) return ''
  return row.yearsOfExperience
}

function toggleArea(id: string) {
  const current = [...(formValues.value.practiceAreas ?? [])]
  const idx = current.findIndex((a) => a.practiceAreaId === id)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else if (current.length < 5) {
    current.push({ practiceAreaId: id, yearsOfExperience: null })
  }
  form.setFieldValue('practiceAreas', current)
  if (current.length > 0) clearValidationMessage('practiceAreas')
  syncFormToStore()
}

function setAreaYears(id: string, raw: string) {
  const current = [...(formValues.value.practiceAreas ?? [])]
  const idx = current.findIndex((a) => a.practiceAreaId === id)
  if (idx < 0) return
  const trimmed = raw.trim()
  const years = trimmed === '' ? null : Number(trimmed)
  current[idx] = {
    ...current[idx],
    yearsOfExperience: Number.isFinite(years) ? years : null,
  } as PracticeAreaSelection
  form.setFieldValue('practiceAreas', current)
  syncFormToStore()
}

const filteredStates = computed(() => {
  const q = stateQuery.value.trim()
  if (!q) return NIGERIA_STATE_NAMES
  return NIGERIA_STATE_NAMES.filter((name) => contains(name, q))
})

watch(stateQuery, (q) => {
  if (q) statesPopoverOpen.value = true
})

const listboxItemClass = cn(
  'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
)

const isDisabled = (id: string) => !isAreaSelected(id) && selectedCount.value >= 5

const nameById = (id: string) =>
  specializations.value.find((s: { id: string; name: string }) => s.id === id)?.name ?? id

onMounted(() => {
  form.reset(snapshotFromStore())

  registerValidate?.(async () => {
    submitAttempted.value = true
    Object.assign(store.practiceInfo, { ...formValues.value })
    const parsed = practiceSchema.value.safeParse(formValues.value)
    if (!parsed.success) {
      setValidationMessages(parsed.error.issues)
      return false
    }
    validationMessages.value = {}
    store.validationError = null
    Object.assign(store.practiceInfo, parsed.data)
    syncFormToStore()
    submitAttempted.value = false
    return true
  })
})

onBeforeUnmount(() => {
  syncFormToStore()
  registerValidate?.(null)
})
</script>

<template>
  <div v-if="isLoadingSpecs" class="space-y-6 py-8">
    <Skeleton class="h-10 w-full rounded-lg" />
    <div class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
    </div>
  </div>

  <div v-else class="w-full space-y-8 pb-20">
    <OnboardingClientStepHeader
      :step="step.step"
      :total="step.total"
      :label="step.label"
      :title="step.title"
      :description="step.description"
    />

    <Card class="p-6 sm:p-8">
        <FieldGroup class="gap-8">
          <form.Field v-slot="{ field }" name="soloPractitioner">
            <Field>
              <Label
                :for="soloPractitionerFieldId"
                class="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-card/80 p-4 transition-colors has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
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
                    Practising under your own name — no firm shown on your profile.
                  </span>
                </span>
              </Label>
            </Field>
          </form.Field>

          <form.Field v-if="!formValues.soloPractitioner" v-slot="{ field }" name="firmName">
            <Field :data-invalid="isInvalid(field) || hasFieldError('firmName')">
              <FieldLabel :for="field.name">
                Firm or practice name
                <span class="font-normal text-muted-foreground">(optional if solo)</span>
              </FieldLabel>
              <Input
                :id="field.name"
                :model-value="field.state.value"
                placeholder="e.g. Adeyemi & Partners"
               
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @update:model-value="(v) => {
                  field.handleChange(v)
                  if (String(v ?? '').trim()) clearValidationMessage('firmName')
                }"
              />
              <p v-if="hasFieldError('firmName')" class="text-sm text-destructive" role="alert">
                {{ fieldMessage('firmName') }}
              </p>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="statesOfPractice">
            <Field :data-invalid="isInvalid(field) || hasFieldError('statesOfPractice')">
              <FieldLabel>
                States of practice
                <span class="text-primary">*</span>
              </FieldLabel>
              <Popover v-model:open="statesPopoverOpen">
                <ListboxRoot
                  :model-value="selectedStates"
                  multiple
                  highlight-on-hover
                  @update:model-value="(v) => syncStates(v, field)"
                >
                  <PopoverAnchor class="w-full">
                    <TagsInput
                      v-slot="{ modelValue: stateTags }"
                      :model-value="selectedStates"
                      :aria-invalid="isInvalid(field)"
                      :class="[
                        
                        'h-auto min-h-11 w-full gap-1.5 px-2 py-1.5 shadow-none',
                      ]"
                      @update:model-value="(v) => syncStates(v, field)"
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

                      <ListboxFilter v-model="stateQuery" as-child>
                        <TagsInputInput
                          placeholder="Search or select states..."
                          class="min-h-8 text-base placeholder:text-muted-foreground"
                          @keydown.enter.prevent
                          @keydown.down="statesPopoverOpen = true"
                        />
                      </ListboxFilter>

                      <PopoverTrigger as-child>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          class="order-last ml-auto shrink-0 self-center"
                          aria-label="Open states list"
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
                      v-if="filteredStates.length === 0"
                      class="py-6 text-center text-sm text-muted-foreground"
                    >
                      No states match your search.
                    </p>
                    <ListboxItem
                      v-for="s in filteredStates"
                      :key="s"
                      :value="s"
                      :class="listboxItemClass"
                      @select="stateQuery = ''"
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
              <FieldDescription>Select all states where you are licensed or actively practising.</FieldDescription>
              <p v-if="hasFieldError('statesOfPractice')" class="text-sm text-destructive" role="alert">
                {{ fieldMessage('statesOfPractice') }}
              </p>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="practiceAreas">
            <Field :data-invalid="isInvalid(field) || hasFieldError('practiceAreas')">
              <FieldLabel>
                Legal specializations
                <span class="text-primary">*</span>
              </FieldLabel>
              <FieldDescription class="mb-3">
                Select up to 5 areas. Add years in each area if you like (optional).
              </FieldDescription>

              <div class="relative mb-4">
                <HugeiconsIcon :icon="Search01Icon" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="query"
                  placeholder="Search legal areas..."
                  class="pl-10"
                />
              </div>

              <p class="mb-3 eyebrow text-muted-foreground">
                Selected ({{ selectedCount }}/5)
              </p>

              <div
                class="max-h-[320px] space-y-2 overflow-y-auto rounded-xl border border-border/40 bg-muted/50 p-2"
              >
                <div
                  v-for="spec in filtered"
                  :key="spec.id"
                  class="rounded-lg border p-3 transition-colors"
                  :class="isAreaSelected(spec.id)
                    ? 'border-primary/40 bg-primary/5'
                    : isDisabled(spec.id)
                      ? 'cursor-not-allowed border-transparent opacity-50'
                      : 'cursor-pointer border-border/30 bg-card hover:border-border/40'"
                  @click="!isDisabled(spec.id) && toggleArea(spec.id)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-foreground">{{ spec.name }}</p>
                      <p v-if="spec.description" class="line-clamp-1 text-xs text-muted-foreground">
                        {{ spec.description }}
                      </p>
                    </div>
                    <HugeiconsIcon :icon="CheckmarkCircle01Icon"
                      v-if="isAreaSelected(spec.id)"
                      class="h-5 w-5 shrink-0 text-primary"
                    />
                  </div>
                  <div
                    v-if="isAreaSelected(spec.id)"
                    class="mt-3 flex items-center gap-2 border-t border-border/30 pt-3"
                    @click.stop
                  >
                    <Label :for="`years-${spec.id}`" class="shrink-0 text-xs text-muted-foreground">
                      Years (optional)
                    </Label>
                    <Input
                      :id="`years-${spec.id}`"
                      type="number"
                      min="0"
                      :max="store.professionalInfo.yearOfCall
                        ? new Date().getFullYear() - store.professionalInfo.yearOfCall
                        : 80"
                      :model-value="getAreaYears(spec.id) === '' ? '' : String(getAreaYears(spec.id))"
                      placeholder="—"
                      class="h-9 max-w-[5.5rem] rounded-lg border-border/50 text-sm tabular-nums"
                      inputmode="numeric"
                      @update:model-value="(v) => setAreaYears(spec.id, String(v ?? ''))"
                    />
                  </div>
                </div>
                <p v-if="filtered.length === 0" class="py-8 text-center text-sm text-muted-foreground">
                  No areas match "{{ query }}"
                </p>
              </div>

              <div v-if="selectedCount > 0" class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="row in selectedAreas"
                  :key="row.practiceAreaId"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  @click="toggleArea(row.practiceAreaId)"
                >
                  {{ nameById(row.practiceAreaId) }}
                  <HugeiconsIcon :icon="Cancel01Icon" class="h-3 w-3" />
                </button>
              </div>

              <p v-if="hasFieldError('practiceAreas')" class="text-sm text-destructive" role="alert">
                {{ fieldMessage('practiceAreas') }}
              </p>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <form.Field v-slot="{ field }" name="primaryState">
            <Field :data-invalid="isInvalid(field) || hasFieldError('primaryState')">
              <FieldLabel :for="field.name">
                Primary state of practice
                <span class="text-primary">*</span>
              </FieldLabel>
              <Select
                :model-value="field.state.value || undefined"
                :disabled="selectedStates.length === 0"
                @update:model-value="(v) => onPrimaryStateChange(v, field)"
              >
                <SelectTrigger class="w-full" :id="field.name" :aria-invalid="isInvalid(field)">
                  <SelectValue placeholder="Select primary state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in selectedStates" :key="s" :value="s">
                    {{ s }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Your main base — other selected states are listed as additional practice locations.
              </FieldDescription>
              <p v-if="hasFieldError('primaryState')" class="text-sm text-destructive" role="alert">
                {{ fieldMessage('primaryState') }}
              </p>
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>

          <LegalAcceptanceFields
            :terms-accepted="formValues.termsAccepted === true"
            :refund-policy-accepted="formValues.refundPolicyAccepted === true"
            @update:terms-accepted="(v) => {
              form.setFieldValue('termsAccepted', v)
              if (v) clearValidationMessage('termsAccepted')
            }"
            @update:refund-policy-accepted="(v) => {
              form.setFieldValue('refundPolicyAccepted', v)
              if (v) clearValidationMessage('refundPolicyAccepted')
            }"
          />
          <p
            v-if="submitAttempted && (!formValues.termsAccepted || !formValues.refundPolicyAccepted)"
            class="text-sm text-destructive"
            role="alert"
          >
            {{ fieldMessage('termsAccepted') || fieldMessage('refundPolicyAccepted') || 'Accept the Terms and refund policy to continue.' }}
          </p>
        </FieldGroup>
      </Card>
  </div>
</template>
