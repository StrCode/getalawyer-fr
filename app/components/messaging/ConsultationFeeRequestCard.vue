<script setup lang="ts">
import { toast } from 'vue-sonner'
import { PhCheck, PhX } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { messagingAPI } from '~/lib/api/messaging'
import { getFeeRequestMetadata, type Message } from '~/types/messaging'
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '~/lib/query-client'

const props = defineProps<{
  message: Message
  conversationId: string
  viewerRole: 'client' | 'lawyer' | null
}>()

const { session } = useAuth()
const queryClient = useQueryClient()
const isResponding = ref(false)

const metadata = computed(() => getFeeRequestMetadata(props.message))
const isPending = computed(() => metadata.value?.status === 'pending')
const isOwnRequest = computed(() => props.message.senderId === session.value?.user?.id)

function formatAmount(amount: string, currency: string) {
  const value = Number.parseFloat(amount)
  if (currency === 'NGN') return `₦${value.toLocaleString()}`
  return `${currency} ${value.toLocaleString()}`
}

async function respond(response: 'accepted' | 'declined') {
  if (isResponding.value) return
  isResponding.value = true
  try {
    await messagingAPI.respondToFeeRequest(props.conversationId, props.message.id, response)
    await queryClient.invalidateQueries({
      queryKey: queryKeys.messaging.conversation(props.conversationId),
    })
    toast.success(response === 'accepted' ? 'Consultation fee accepted' : 'Consultation fee declined')
  } catch (error: unknown) {
    const err = error as { data?: { code?: string } }
    if (err.data?.code === 'FEE_REQUEST_ALREADY_RESOLVED') {
      toast.error('This request was already resolved')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.conversation(props.conversationId),
      })
    } else {
      toast.error('Failed to respond to fee request')
    }
  } finally {
    isResponding.value = false
  }
}

async function cancel() {
  if (isResponding.value) return
  isResponding.value = true
  try {
    await messagingAPI.cancelFeeRequest(props.conversationId, props.message.id)
    await queryClient.invalidateQueries({
      queryKey: queryKeys.messaging.conversation(props.conversationId),
    })
    toast.success('Fee request cancelled')
  } catch {
    toast.error('Failed to cancel fee request')
  } finally {
    isResponding.value = false
  }
}
</script>

<template>
  <div
    v-if="metadata"
    class="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-sm"
  >
    <div class="mb-2 flex items-center justify-between gap-2">
      <p class="text-sm font-semibold text-foreground">
        Consultation fee request
      </p>
      <Badge
        v-if="metadata.status !== 'pending'"
        variant="outline"
        class="capitalize"
      >
        {{ metadata.status }}
      </Badge>
    </div>
    <p class="text-2xl font-semibold tabular-nums text-foreground">
      {{ formatAmount(metadata.amount, metadata.currency) }}
    </p>
    <p v-if="metadata.description" class="mt-2 text-sm text-muted-foreground">
      {{ metadata.description }}
    </p>

    <div
      v-if="viewerRole === 'client' && isPending"
      class="mt-4 flex gap-2"
    >
      <Button
        size="sm"
        class="flex-1"
        :disabled="isResponding"
        @click="respond('accepted')"
      >
        <PhCheck class="mr-1 size-4" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        class="flex-1"
        :disabled="isResponding"
        @click="respond('declined')"
      >
        <PhX class="mr-1 size-4" />
        Decline
      </Button>
    </div>

    <div
      v-else-if="viewerRole === 'lawyer' && isPending && isOwnRequest"
      class="mt-4"
    >
      <Button
        size="sm"
        variant="outline"
        :disabled="isResponding"
        @click="cancel"
      >
        Cancel request
      </Button>
    </div>
  </div>
</template>
