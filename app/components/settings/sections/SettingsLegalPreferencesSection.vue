<template>
  <SettingsSectionCard
    title="Legal preferences"
    description="Helps us match you with the right lawyer and consultation format."
  >
    <FieldGroup class="gap-8">
      <ProfileSettingsRow
        title="Legal areas of interest"
        description="Select topics you may need help with — property, employment, family, criminal, and more."
      >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="area in practiceAreaOptions"
            :key="area.id"
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm transition-colors"
            :class="draft.practiceAreas.includes(area.name)
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'"
            @click="toggleArea(area.name)"
          >
            {{ area.name }}
          </button>
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Preferred consultation type"
        description="How you'd like to meet your lawyer."
      >
        <RadioGroup
          v-model="draft.consultationType"
          class="grid gap-3 sm:grid-cols-3"
        >
          <label
            v-for="opt in consultationOptions"
            :key="opt.value"
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem
              :value="opt.value"
              class="mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-foreground">
                {{ opt.label }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ opt.hint }}
              </p>
            </div>
          </label>
        </RadioGroup>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Preferred lawyer gender"
        description="Optional — leave blank for no preference."
      >
        <Select v-model="draft.preferredLawyerGender">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="No preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              No preference
            </SelectItem>
            <SelectItem value="female">
              Female
            </SelectItem>
            <SelectItem value="male">
              Male
            </SelectItem>
          </SelectContent>
        </Select>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Budget range per consultation"
        description="Approximate amount you're willing to spend (NGN)."
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">₦{{ formatNaira(draft.budgetMin) }}</span>
            <span class="text-muted-foreground">₦{{ formatNaira(draft.budgetMax) }}</span>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="budget-min">Minimum</Label>
              <Slider
                id="budget-min"
                :model-value="[draft.budgetMin]"
                :min="10000"
                :max="500000"
                :step="10000"
                @update:model-value="(v) => draft.budgetMin = v[0] ?? draft.budgetMin"
              />
            </div>
            <div class="space-y-2">
              <Label for="budget-max">Maximum</Label>
              <Slider
                id="budget-max"
                :model-value="[draft.budgetMax]"
                :min="50000"
                :max="2000000"
                :step="50000"
                @update:model-value="(v) => draft.budgetMax = v[0] ?? draft.budgetMax"
              />
            </div>
          </div>
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Urgency level"
        description="Urgent matters may be prioritised in lawyer matching."
      >
        <RadioGroup
          v-model="draft.urgency"
          class="grid gap-3 sm:grid-cols-2"
        >
          <label
            v-for="opt in urgencyOptions"
            :key="opt.value"
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
          >
            <RadioGroupItem
              :value="opt.value"
              class="mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-foreground">
                {{ opt.label }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ opt.hint }}
              </p>
            </div>
          </label>
        </RadioGroup>
      </ProfileSettingsRow>
    </FieldGroup>
  </SettingsSectionCard>
</template>

<script setup lang="ts">
import ProfileSettingsRow from '@/components/dashboard/ProfileSettingsRow.vue'
import SettingsSectionCard from '@/components/settings/SettingsSectionCard.vue'
import { FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { MARKETING_PRACTICE_AREAS } from '~/data/marketing-practice-areas'
import type { AccountSettingsDraft } from '~/types/account-settings'

const draft = defineModel<AccountSettingsDraft['legalPreferences']>('draft', { required: true })

const practiceAreaOptions = MARKETING_PRACTICE_AREAS.slice(0, 12)

const consultationOptions = [
  { value: 'in_person', label: 'In-person', hint: 'Meet at the lawyer\'s office' },
  { value: 'video', label: 'Video call', hint: 'Secure online consultation' },
  { value: 'chat', label: 'Chat', hint: 'Async messaging in the app' },
] as const

const urgencyOptions = [
  { value: 'standard', label: 'Standard', hint: 'Typical response within 1–2 business days' },
  { value: 'urgent', label: 'Urgent', hint: 'Priority matching for time-sensitive matters' },
] as const

function toggleArea(name: string) {
  const idx = draft.value.practiceAreas.indexOf(name)
  if (idx >= 0) {
    draft.value.practiceAreas = draft.value.practiceAreas.filter(a => a !== name)
  } else {
    draft.value.practiceAreas = [...draft.value.practiceAreas, name]
  }
}

function formatNaira(n: number) {
  return new Intl.NumberFormat('en-NG').format(n)
}
</script>
