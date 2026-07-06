<script setup lang="ts">
import { CurrencyIcon, SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { messagingAPI } from '~/lib/api/messaging'
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'

const props = defineProps<{
  conversationId: string
}>()

const queryClient = useQueryClient()
const isOpen = ref(false)
const isSubmitting = ref(false)
const amount = ref('')
const description = ref('')

async function submit() {
  const trimmed = amount.value.trim()
  if (!trimmed || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await messagingAPI.createFeeRequest(props.conversationId, {
      amount: trimmed,
      description: description.value.trim() || undefined,
    })
    await queryClient.invalidateQueries({
      queryKey: queryKeys.messaging.conversation(props.conversationId),
    })
    amount.value = ''
    description.value = ''
    isOpen.value = false
    toast.success('Consultation fee request sent')
  } catch {
    toast.error('Failed to send fee request')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="border-b border-border bg-muted/30 px-4 py-3">
    <Button
      v-if="!isOpen"
      variant="outline"
      size="sm"
      @click="isOpen = true"
    >
      <HugeiconsIcon :icon="CurrencyIcon" class="mr-2 size-4" />
      Request consultation fee
    </Button>

    <form
      v-else
      class="space-y-3"
      @submit.prevent="submit"
    >
      <div class="space-y-1">
        <Label for="fee-amount">Amount (NGN)</Label>
        <Input
          id="fee-amount"
          v-model="amount"
          inputmode="decimal"
          placeholder="15000"
        />
      </div>
      <div class="space-y-1">
        <Label for="fee-description">Description (optional)</Label>
        <Textarea
          id="fee-description"
          v-model="description"
          rows="2"
          placeholder="e.g. 30-min call to review your contract"
          class="resize-none"
        />
      </div>
      <div class="flex gap-2">
        <Button type="submit" size="sm" :disabled="!amount.trim() || isSubmitting">
          <HugeiconsIcon :icon="SentIcon" class="mr-1 size-4" />
          Send request
        </Button>
        <Button type="button" size="sm" variant="ghost" @click="isOpen = false">
          Cancel
        </Button>
      </div>
    </form>
  </div>
</template>
