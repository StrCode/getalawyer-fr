<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useBookings } from '~/composables/useBookings'

/**
 * Lets the lawyer add or change how the client joins a booking after it was
 * made: the meeting link for a video consultation, or the address for one in
 * person. Saving a new one emails it to the client (the server does that).
 */
const props = defineProps<{
  bookingId: string
  kind: 'link' | 'address'
  current: string | null
}>()

const { useUpdateLawyerBooking } = useBookings()
const { mutate: save, isPending: saving } = useUpdateLawyerBooking()

const editing = ref(false)
const draft = ref('')
const error = ref('')
const isLink = computed(() => props.kind === 'link')

function start() {
  draft.value = props.current ?? ''
  error.value = ''
  editing.value = true
}

function stop() {
  editing.value = false
}

function submit() {
  const value = draft.value.trim()
  if (isLink.value && value && !/^https:\/\/\S+\.\S+/i.test(value)) {
    error.value = 'Use a meeting link that starts with https://'
    return
  }
  save(
    { id: props.bookingId, data: isLink.value ? { meetingUrl: value } : { meetingLocation: value } },
    {
      onSuccess: () => {
        editing.value = false
        toast.success(isLink.value ? 'Meeting link saved' : 'Address saved', {
          description: value ? 'The client has been emailed it.' : undefined,
        })
      },
      onError: (problem) => {
        error.value = problem.message || 'We could not save it. Try again.'
      },
    },
  )
}
</script>

<template>
  <form v-if="editing" class="mt-3.5 grid gap-2.5" novalidate @submit.prevent="submit">
    <Field :data-invalid="!!error || undefined">
      <FieldLabel for="join-detail">{{ isLink ? 'Meeting link' : 'Address' }}</FieldLabel>
      <Input
        id="join-detail"
        v-model="draft"
        :type="isLink ? 'url' : 'text'"
        :placeholder="isLink ? 'https://meet.google.com/…' : 'Where to meet'"
        :aria-invalid="!!error || undefined"
        class="bg-card"
      />
      <FieldError v-if="error">{{ error }}</FieldError>
    </Field>
    <div class="flex flex-wrap gap-2">
      <Button type="submit" variant="canopy" size="pill-sm" :disabled="saving" :aria-busy="saving">{{ saving ? 'Saving…' : 'Save' }}</Button>
      <Button type="button" variant="line" size="pill-sm" :disabled="saving" @click="stop">Cancel</Button>
    </div>
  </form>
  <button v-else type="button" class="mt-2.5 min-h-11 cursor-pointer text-sm font-medium underline underline-offset-3" @click="start">
    {{ current ? (isLink ? 'Change the link' : 'Change the address') : (isLink ? 'Add the meeting link' : 'Add the address') }}
  </button>
</template>
