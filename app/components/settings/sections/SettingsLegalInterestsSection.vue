<template>
  <SettingsSectionCard
    title="Legal interests"
    description="Choose up to three practice areas. We use these to recommend lawyers who fit your situation."
  >
    <template
      v-if="!isLoading && hasClientProfile"
      #action
    >
      <div class="flex items-center gap-2">
        <Button
          v-if="isDirty"
          type="button"
          variant="outline"
          size="sm"
          :disabled="isSaving"
          @click="resetSelection"
        >
          Discard
        </Button>
        <ButtonBusy
          size="sm"
          :loading="isSaving"
          :disabled="!canSave"
          @click="onSave"
        >
          Save
        </ButtonBusy>
      </div>
    </template>

    <div
      v-if="isLoading || isLoadingOptions"
      class="flex flex-wrap gap-2"
    >
      <Skeleton
        v-for="i in 8"
        :key="i"
        class="h-10 w-28 rounded-xl"
      />
    </div>

    <div
      v-else-if="!hasClientProfile"
      class="rounded-lg border border-dashed border-border py-10 text-center"
    >
      <p class="text-sm text-muted-foreground">
        Complete client onboarding to set your legal interests.
      </p>
    </div>

    <template v-else>
      <div class="mb-5 space-y-3">
        <p class="text-sm font-medium text-foreground">
          <template v-if="selectedCount === 0">
            Select at least one practice area
          </template>
          <template v-else-if="selectedCount < 3">
            {{ selectedCount }} of 3 selected
            <span class="font-normal text-muted-foreground">
              · {{ slotsLeft }} more {{ slotsLeft === 1 ? 'slot' : 'slots' }} available
            </span>
          </template>
          <template v-else>
            3 of 3 selected
            <span class="font-normal text-muted-foreground">
              · remove one to choose a different area
            </span>
          </template>
        </p>
        <div
          class="flex gap-1.5"
          role="progressbar"
          :aria-valuenow="selectedCount"
          aria-valuemin="0"
          aria-valuemax="3"
        >
          <span
            v-for="slot in 3"
            :key="slot"
            class="h-1.5 w-10 rounded-full transition-colors duration-300"
            :class="slot <= selectedCount ? 'bg-primary' : 'bg-muted'"
          />
        </div>
      </div>

      <div class="relative mb-5">
        <HugeiconsIcon
          :icon="Search01Icon"
          class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="query"
          type="search"
          placeholder="Search practice areas…"
          class="pl-9"
          autocomplete="off"
        />
      </div>

      <div
        v-if="filtered.length === 0"
        class="rounded-lg border border-dashed border-border py-10 text-center"
      >
        <p class="text-sm text-muted-foreground">
          No practice areas match
          <span class="font-medium text-foreground">"{{ query }}"</span>.
        </p>
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="spec in filtered"
            :key="spec.id"
            type="button"
            :disabled="isDisabled(spec.id)"
            class="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            :class="
              isSelected(spec.id)
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50'
            "
            :title="spec.description ?? undefined"
            @click="!isDisabled(spec.id) && toggle(spec.id)"
          >
            {{ spec.name }}
            <HugeiconsIcon
              v-if="isSelected(spec.id)"
              :icon="Tick01Icon"
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            <HugeiconsIcon
              v-else
              :icon="Add01Icon"
              class="size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </button>
        </div>

        <p
          v-if="expandedSpec"
          class="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          <span class="font-medium text-foreground">{{ expandedSpec.name }} — </span>
          {{ expandedSpec.description }}
        </p>
      </div>
    </template>
  </SettingsSectionCard>
</template>

<script setup lang="ts">
import { Add01Icon, Search01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import ButtonBusy from '@/components/ButtonBusy.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientProfile } from '~/composables/useClientProfile'
import { useSpecializations } from '~/composables/useSpecializations'
import { ApiError } from '~/lib/api/client'

const MAX_SELECTIONS = 3

const { useProfile, useUpdateSpecializations } = useClientProfile()
const { data: profile, isLoading } = useProfile()
const { mutateAsync: updateSpecializations, isPending: isSaving } = useUpdateSpecializations()
const { data: allSpecializations, isPending: isLoadingOptions } = useSpecializations()

const query = ref('')
const selectedIds = ref<string[]>([])
const snapshot = ref('')

const hasClientProfile = computed(() => Boolean(profile.value?.clientId))

watch(
  profile,
  (p) => {
    if (!p?.specializations) return
    const ids = p.specializations.map(s => s.id)
    selectedIds.value = [...ids]
    snapshot.value = JSON.stringify(ids)
  },
  { immediate: true },
)

const practiceAreaOptions = computed(() => allSpecializations.value ?? [])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return practiceAreaOptions.value
  return practiceAreaOptions.value.filter(
    s =>
      s.name.toLowerCase().includes(q)
      || s.description?.toLowerCase().includes(q),
  )
})

const selectedCount = computed(() => selectedIds.value.length)
const slotsLeft = computed(() => Math.max(0, MAX_SELECTIONS - selectedCount.value))

const expandedSpec = computed(() => {
  const lastId = selectedIds.value.at(-1)
  if (!lastId) return null
  return practiceAreaOptions.value.find(s => s.id === lastId) ?? null
})

const isDirty = computed(() => {
  const current = [...selectedIds.value].sort().join(',')
  const saved = (JSON.parse(snapshot.value || '[]') as string[]).sort().join(',')
  return current !== saved
})

const canSave = computed(
  () => isDirty.value && selectedCount.value >= 1 && selectedCount.value <= MAX_SELECTIONS && !isSaving.value,
)

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function isDisabled(id: string) {
  return !isSelected(id) && selectedCount.value >= MAX_SELECTIONS
}

function toggle(id: string) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter(s => s !== id)
    : [...selectedIds.value, id]
}

function resetSelection() {
  const ids = JSON.parse(snapshot.value || '[]') as string[]
  selectedIds.value = [...ids]
}

async function onSave() {
  if (!canSave.value) return

  try {
    const updated = await updateSpecializations([...selectedIds.value])
    const ids = updated.specializations?.map(s => s.id) ?? selectedIds.value
    selectedIds.value = [...ids]
    snapshot.value = JSON.stringify(ids)
    toast.success('Legal interests saved')
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Could not save legal interests'
    toast.error('Save failed', { description: message })
  }
}
</script>
