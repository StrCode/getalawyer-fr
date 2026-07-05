<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSpecializations } from '~/composables/useSpecializations'
import type {
  LawyerProfilePracticeArea,
  ReplacePracticeAreasInput,
} from '~/types/lawyer-profile-editor'

const MAX_AREAS = 5

type AreaSelection = {
  specializationId: string
  yearsOfExperience: number | null
}

const props = defineProps<{
  practiceAreas: LawyerProfilePracticeArea[]
  disabled?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: ReplacePracticeAreasInput]
}>()

const { data: specializations, isPending: isLoadingSpecs } = useSpecializations()

const query = ref('')
const selections = ref<AreaSelection[]>([])

function syncFromProps(areas: LawyerProfilePracticeArea[]) {
  selections.value = areas.map((area) => ({
    specializationId: area.id,
    yearsOfExperience: area.yearsOfExperience,
  }))
}

watch(
  () => props.practiceAreas,
  (areas) => syncFromProps(areas),
  { immediate: true, deep: true },
)

const snapshot = computed(() =>
  JSON.stringify(
    props.practiceAreas.map((a) => ({
      id: a.id,
      years: a.yearsOfExperience,
    })),
  ),
)

const isDirty = computed(
  () =>
    JSON.stringify(
      selections.value.map((s) => ({
        id: s.specializationId,
        years: s.yearsOfExperience,
      })),
    ) !== snapshot.value,
)

const filtered = computed(() => {
  const list = specializations.value ?? []
  const q = query.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(
    (s: { name: string; description?: string | null }) =>
      s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
  )
})

const selectedCount = computed(() => selections.value.length)

function isSelected(id: string) {
  return selections.value.some((s) => s.specializationId === id)
}

function isDisabled(id: string) {
  return !isSelected(id) && selectedCount.value >= MAX_AREAS
}

function toggleArea(id: string) {
  if (isSelected(id)) {
    selections.value = selections.value.filter((s) => s.specializationId !== id)
    return
  }
  if (selectedCount.value >= MAX_AREAS) return
  selections.value = [...selections.value, { specializationId: id, yearsOfExperience: null }]
}

function getAreaYears(id: string): number | '' {
  const row = selections.value.find((s) => s.specializationId === id)
  if (!row || row.yearsOfExperience === null) return ''
  return row.yearsOfExperience
}

function setAreaYears(id: string, raw: string) {
  const trimmed = raw.trim()
  const years = trimmed === '' ? null : Math.max(0, Math.min(60, Number.parseInt(trimmed, 10) || 0))
  selections.value = selections.value.map((s) =>
    s.specializationId === id ? { ...s, yearsOfExperience: years } : s,
  )
}

function nameById(id: string) {
  return (
    specializations.value?.find((s: { id: string; name: string }) => s.id === id)?.name
    ?? props.practiceAreas.find((a) => a.id === id)?.name
    ?? id
  )
}

const validationError = ref<string | null>(null)

function onSave() {
  validationError.value = null
  if (selections.value.length === 0) {
    validationError.value = 'Select at least one practice area.'
    return
  }

  emit('save', {
    practiceAreas: selections.value.map((s) => ({
      specializationId: s.specializationId,
      yearsOfExperience: s.yearsOfExperience,
    })),
  })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">
        Areas of practice
      </CardTitle>
      <CardDescription>
        Choose up to {{ MAX_AREAS }} specializations clients can find you under.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        v-if="isLoadingSpecs"
        class="space-y-3"
      >
        <Skeleton class="h-10 w-full rounded-lg" />
        <Skeleton class="h-48 w-full rounded-xl" />
      </div>

      <template v-else>
        <Field>
          <FieldLabel class="sr-only">
            appIcons.magnifyingGlass practice areas
          </FieldLabel>
          <div class="relative">
            <AppIcon :icon="appIcons.magnifyingGlass"
              class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="query"
              :disabled="disabled"
              placeholder="appIcons.magnifyingGlass legal areas…"
              class="pl-9"
            />
          </div>
          <FieldDescription>
            Selected ({{ selectedCount }}/{{ MAX_AREAS }})
          </FieldDescription>
        </Field>

        <div
          class="max-h-[320px] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-2"
        >
          <div
            v-for="spec in filtered"
            :key="spec.id"
            class="rounded-lg border p-3 transition-colors"
            :class="isSelected(spec.id)
              ? 'border-primary/40 bg-primary/5'
              : isDisabled(spec.id)
                ? 'cursor-not-allowed border-transparent opacity-50'
                : 'cursor-pointer border-border/30 bg-background hover:border-border/60'"
            @click="!disabled && !isDisabled(spec.id) && toggleArea(spec.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-foreground">
                  {{ spec.name }}
                </p>
                <p
                  v-if="spec.description"
                  class="line-clamp-2 text-xs text-muted-foreground"
                >
                  {{ spec.description }}
                </p>
              </div>
              <AppIcon :icon="appIcons.checkCircle"
                v-if="isSelected(spec.id)"
                class="size-5 shrink-0 text-primary"
              />
            </div>
            <div
              v-if="isSelected(spec.id)"
              class="mt-3 flex items-center gap-2 border-t border-border/30 pt-3"
              @click.stop
            >
              <label
                :for="`profile-years-${spec.id}`"
                class="shrink-0 text-xs text-muted-foreground"
              >
                Years (optional)
              </label>
              <Input
                :id="`profile-years-${spec.id}`"
                type="number"
                min="0"
                max="60"
                :disabled="disabled"
                :model-value="getAreaYears(spec.id) === '' ? '' : String(getAreaYears(spec.id))"
                placeholder="—"
                class="h-9 max-w-[5.5rem] tabular-nums"
                inputmode="numeric"
                @update:model-value="(v) => setAreaYears(spec.id, String(v ?? ''))"
              />
            </div>
          </div>
          <p
            v-if="filtered.length === 0"
            class="py-8 text-center text-sm text-muted-foreground"
          >
            No areas match "{{ query }}"
          </p>
        </div>

        <div
          v-if="selectedCount > 0"
          class="flex flex-wrap gap-2"
        >
          <button
            v-for="row in selections"
            :key="row.specializationId"
            type="button"
            class="inline-flex items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 disabled:pointer-events-none disabled:opacity-50"
            :disabled="disabled"
            @click="toggleArea(row.specializationId)"
          >
            {{ nameById(row.specializationId) }}
            <AppIcon :icon="appIcons.x" class="size-3" />
          </button>
        </div>

        <p
          v-if="validationError"
          class="text-sm text-destructive"
          role="alert"
        >
          {{ validationError }}
        </p>
      </template>

      <div class="flex justify-end">
        <ButtonBusy
          size="sm"
          :loading="saving"
          :disabled="disabled || !isDirty || isLoadingSpecs"
          @click="onSave"
        >
          Save practice areas
        </ButtonBusy>
      </div>
    </CardContent>
  </Card>
</template>
