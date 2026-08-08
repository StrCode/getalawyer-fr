<script setup lang="ts">
import { ArrowDown01Icon, Briefcase01Icon, Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import type { Specialization } from '~/lib/api'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import Input from '~/components/ui/input/Input.vue'

/**
 * The "Refine search" controls, shared between the desktop sidebar and the
 * mobile filter drawer. Selection state lives with the page (it is the URL);
 * this component owns only the search-within-popover UI state.
 */
const props = defineProps<{
  stateOptions: { code: string, label: string }[]
  selectedStateCodes: string[]
  specializations: Specialization[]
  selectedSpecializationIds: string[]
  specsLoading: boolean
  activeFilterCount: number
}>()

const emit = defineEmits<{
  toggleState: [code: string, checked: boolean]
  clearStates: []
  toggleSpecialization: [id: string, checked: boolean]
  clearSpecializations: []
  clearAll: []
}>()

const statePopoverOpen = ref(false)
const stateSearchQuery = ref('')

const filteredStates = computed(() => {
  const q = stateSearchQuery.value.trim().toLowerCase()
  if (!q) return props.stateOptions
  return props.stateOptions.filter(
    s =>
      s.label.toLowerCase().includes(q)
      || s.code.toLowerCase().includes(q),
  )
})

const statesTriggerLabel = computed(() => {
  const codes = props.selectedStateCodes
  if (codes.length === 0) return 'All states'
  if (codes.length === 1) {
    return props.stateOptions.find(s => s.code === codes[0])?.label ?? codes[0]
  }
  return `${codes.length} states`
})

const specPopoverOpen = ref(false)
const specSearchQuery = ref('')

const filteredSpecializations = computed(() => {
  const q = specSearchQuery.value.trim().toLowerCase()
  const list = props.specializations
  if (!q) return list
  return list.filter(
    s =>
      s.name.toLowerCase().includes(q)
      || s.description?.toLowerCase().includes(q),
  )
})

const specializationTriggerLabel = computed(() => {
  const ids = props.selectedSpecializationIds
  if (ids.length === 0) return 'All specializations'
  if (ids.length === 1) {
    const n = props.specializations.find(s => s.id === ids[0])?.name
    return n ?? '1 selected'
  }
  return `${ids.length} selected`
})

watch(statePopoverOpen, (open) => {
  if (!open)
    stateSearchQuery.value = ''
})

watch(specPopoverOpen, (open) => {
  if (!open)
    specSearchQuery.value = ''
})

function onClearStates() {
  statePopoverOpen.value = false
  emit('clearStates')
}

function onClearSpecializations() {
  specPopoverOpen.value = false
  emit('clearSpecializations')
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
     <h2 class="text-sm font-semibold text-foreground">
        Refine search
      </h2>
      <button
        v-if="activeFilterCount > 0"
        type="button"
        class="cursor-pointer text-xs font-medium text-primary hover:text-primary/80"
        @click="emit('clearAll')"
      >
        Clear all
      </button>
    </div>

    <div class="flex flex-col gap-5">
      <!-- States -->
      <div class="flex flex-col gap-2">
        <span class="eyebrow text-muted-foreground">States</span>
        <Popover v-model:open="statePopoverOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              class="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted px-3 text-left text-sm text-foreground transition-colors hover:border-foreground/20 focus-visible:border-primary/30 focus-visible:ring-3 focus-visible:ring-primary/10 focus-visible:outline-none"
              aria-haspopup="dialog"
              aria-label="States"
              :aria-expanded="statePopoverOpen"
            >
              <HugeiconsIcon :icon="Location01Icon" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span class="min-w-0 flex-1 truncate">{{ statesTriggerLabel }}</span>
              <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-(--reka-popover-trigger-width) z-210 rounded-xl border-border p-0">
            <div class="border-b border-border p-2">
              <Input
                v-model="stateSearchQuery"
                type="search"
                autocomplete="off"
                placeholder="Filter states…"
                class="h-9 rounded-xl border-border bg-transparent"
              />
            </div>
            <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
              <button
                type="button"
                class="mb-2 w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                @click="onClearStates"
              >
                All states
              </button>
              <p
                v-if="filteredStates.length === 0"
                class="px-2 py-6 text-center text-sm text-muted-foreground"
              >
                No matches.
              </p>
              <label
                v-for="s in filteredStates"
                :key="s.code"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
              >
                <Checkbox
                  :checked="selectedStateCodes.includes(s.code)"
                  @update:checked="(v: boolean | 'indeterminate') => emit('toggleState', s.code, v === true)"
                />
                <span class="min-w-0 leading-snug">{{ s.label }}</span>
                <span class="ms-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{{ s.code }}</span>
              </label>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Specializations -->
      <div class="flex flex-col gap-2">
        <span class="eyebrow text-muted-foreground">Specializations</span>
        <div
          v-if="specsLoading"
          class="flex h-11 items-center rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground"
          aria-busy="true"
        >
          Loading…
        </div>
        <Popover v-else v-model:open="specPopoverOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              class="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted px-3 text-left text-sm text-foreground transition-colors hover:border-foreground/20 focus-visible:border-primary/30 focus-visible:ring-3 focus-visible:ring-primary/10 focus-visible:outline-none"
              aria-haspopup="dialog"
              aria-label="Specializations"
              :aria-expanded="specPopoverOpen"
            >
              <HugeiconsIcon :icon="Briefcase01Icon" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span class="min-w-0 flex-1 truncate">{{ specializationTriggerLabel }}</span>
              <HugeiconsIcon :icon="ArrowDown01Icon" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-(--reka-popover-trigger-width) z-210 rounded-xl border-border p-0">
            <div class="border-b border-border p-2">
              <Input
                v-model="specSearchQuery"
                type="search"
                autocomplete="off"
                placeholder="Filter specializations…"
                class="h-9 rounded-xl border-border bg-transparent"
              />
            </div>
            <div class="max-h-64 overflow-y-auto overscroll-contain p-2">
              <button
                type="button"
                class="mb-2 w-full cursor-pointer rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                @click="onClearSpecializations"
              >
                All specializations
              </button>
              <p
                v-if="filteredSpecializations.length === 0"
                class="px-2 py-6 text-center text-sm text-muted-foreground"
              >
                No matches.
              </p>
              <label
                v-for="s in filteredSpecializations"
                :key="s.id"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
              >
                <Checkbox
                  :checked="selectedSpecializationIds.includes(s.id)"
                  @update:checked="(v: boolean | 'indeterminate') => emit('toggleSpecialization', s.id, v === true)"
                />
                <span class="min-w-0 leading-snug">{{ s.name }}</span>
              </label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- Trust callout -->
    <div class="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p class="eyebrow text-primary-strong">Verified only</p>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
        Every lawyer in this directory has passed NIN and Supreme Court number verification.
      </p>
    </div>
  </div>
</template>
