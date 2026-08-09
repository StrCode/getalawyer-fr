<script setup lang="ts">
import { Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NIGERIA_STATE_NAMES } from '@/constants/nigeria-states-lgas'
import type { LawyerProfilePracticeInfo, UpdateLawyerOfficeInput } from '~/types/lawyer-profile-editor'

const props = defineProps<{
  practiceInfo: LawyerProfilePracticeInfo | null
  disabled?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: UpdateLawyerOfficeInput]
}>()

const firmName = ref(props.practiceInfo?.firmName ?? '')
const officeStreet = ref(props.practiceInfo?.officeStreet ?? '')
const officeCity = ref(props.practiceInfo?.officeCity ?? '')
const officeState = ref(props.practiceInfo?.officeState ?? '')
const officePostalCode = ref(props.practiceInfo?.officePostalCode ?? '')

watch(
  () => props.practiceInfo,
  (value) => {
    firmName.value = value?.firmName ?? ''
    officeStreet.value = value?.officeStreet ?? ''
    officeCity.value = value?.officeCity ?? ''
    officeState.value = value?.officeState ?? ''
    officePostalCode.value = value?.officePostalCode ?? ''
  },
  { deep: true },
)

const snapshot = computed(() =>
  JSON.stringify({
    firmName: props.practiceInfo?.firmName ?? '',
    officeStreet: props.practiceInfo?.officeStreet ?? '',
    officeCity: props.practiceInfo?.officeCity ?? '',
    officeState: props.practiceInfo?.officeState ?? '',
    officePostalCode: props.practiceInfo?.officePostalCode ?? '',
  }),
)

const isDirty = computed(
  () =>
    JSON.stringify({
      firmName: firmName.value,
      officeStreet: officeStreet.value,
      officeCity: officeCity.value,
      officeState: officeState.value,
      officePostalCode: officePostalCode.value,
    }) !== snapshot.value,
)

const locationPreview = computed(() => {
  const parts = [officeCity.value.trim(), officeState.value.trim()].filter(Boolean)
  if (parts.length === 0) return null
  return parts.join(', ')
})

function onSave() {
  emit('save', {
    firmName: firmName.value.trim() || undefined,
    officeStreet: officeStreet.value.trim() || null,
    officeCity: officeCity.value.trim() || null,
    officeState: officeState.value.trim() || null,
    officePostalCode: officePostalCode.value.trim() || null,
  })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        Office & firm
      </CardTitle>
      <CardDescription>
        Your firm name and office location appear on your listing and in search results.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <FieldGroup class="gap-5">
        <Field>
          <FieldLabel for="profile-firm-name">
            Firm or practice name
          </FieldLabel>
          <Input
            id="profile-firm-name"
            v-model="firmName"
            :disabled="disabled"
            maxlength="160"
            placeholder="e.g. Adeyemi & Partners"
          />
          <FieldDescription>
            Leave blank if you practise under your own name.
          </FieldDescription>
        </Field>

        <div class="space-y-4 rounded-xl border border-border bg-background p-4">
          <div class="flex items-start gap-2">
            <HugeiconsIcon :icon="Location01Icon" class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground">
                Office address
              </p>
              <p
                v-if="locationPreview"
                class="mt-0.5 text-xs text-muted-foreground"
              >
                {{ locationPreview }}
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel for="profile-office-street">
              Street address
            </FieldLabel>
            <Input
              id="profile-office-street"
              v-model="officeStreet"
              :disabled="disabled"
              maxlength="200"
              placeholder="e.g. 15 Adeola Odeku Street"
            />
          </Field>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="profile-office-city">
                City
              </FieldLabel>
              <Input
                id="profile-office-city"
                v-model="officeCity"
                :disabled="disabled"
                maxlength="120"
                placeholder="e.g. Victoria Island"
              />
            </Field>

            <Field>
              <FieldLabel for="profile-office-state">
                State
              </FieldLabel>
              <Select
                :model-value="officeState || undefined"
                :disabled="disabled"
                @update:model-value="(v) => { officeState = String(v ?? '') }"
              >
                <SelectTrigger id="profile-office-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="state in NIGERIA_STATE_NAMES"
                    :key="state"
                    :value="state"
                  >
                    {{ state }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel for="profile-office-postal">
              Postal code
            </FieldLabel>
            <Input
              id="profile-office-postal"
              v-model="officePostalCode"
              :disabled="disabled"
              maxlength="32"
              placeholder="Optional"
              class="max-w-xs"
            />
          </Field>
        </div>
      </FieldGroup>

      <div class="flex justify-end">
        <ButtonBusy
          size="sm"
          :loading="saving"
          :disabled="disabled || !isDirty"
          @click="onSave"
        >
          Save office
        </ButtonBusy>
      </div>
    </CardContent>
  </Card>
</template>
