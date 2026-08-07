<script setup lang="ts">
import ButtonBusy from '@/components/ButtonBusy.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { LawyerProfileAbout } from '~/types/lawyer-profile-editor'

const props = defineProps<{
  about: LawyerProfileAbout
  disabled?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: { headline: string | null; about: string | null }]
}>()

const headline = ref(props.about.headline ?? '')
const about = ref(props.about.about ?? '')

watch(
  () => props.about,
  (value) => {
    headline.value = value.headline ?? ''
    about.value = value.about ?? ''
  },
  { deep: true }
)

const isDirty = computed(
  () =>
    headline.value !== (props.about.headline ?? '') ||
    about.value !== (props.about.about ?? '')
)

async function onSave() {
  emit('save', {
    headline: headline.value.trim() || null,
    about: about.value.trim() || null,
  })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>
        About & headline
      </CardTitle>
      <CardDescription>
        A short headline and bio appear at the top of your public profile.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel for="profile-headline">
            Headline
          </FieldLabel>
          <Input
            id="profile-headline"
            v-model="headline"
            :disabled="disabled"
            maxlength="160"
            placeholder="e.g. Commercial litigation · Lagos"
          />
          <FieldDescription>
            {{ headline.length }}/160 characters
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel for="profile-about">
            About
          </FieldLabel>
          <Textarea
            id="profile-about"
            v-model="about"
            :disabled="disabled"
            rows="6"
            maxlength="5000"
            placeholder="Describe your practice, experience, and how you help clients."
          />
        </Field>
      </FieldGroup>

      <div class="flex justify-end">
        <ButtonBusy
          size="sm"
          :loading="saving"
          :disabled="disabled || !isDirty"
          @click="onSave"
        >
          Save about
        </ButtonBusy>
      </div>
    </CardContent>
  </Card>
</template>
