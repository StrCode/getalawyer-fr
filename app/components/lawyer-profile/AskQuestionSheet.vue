<script setup lang="ts">
import { Loading03Icon, SentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAskQuestion } from '~/composables/useAskQuestion'
import type { LawyerProfile } from '~/types/lawyer'

const props = defineProps<{
  lawyerInfo: LawyerProfile
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const viewport = useViewport()
const isDesktop = computed(() => {
  if (import.meta.server) return true
  return viewport.isGreaterOrEquals('md')
})

const question = ref('')
const { askQuestionAsync, isAsking } = useAskQuestion()

async function handleSubmit() {
  const trimmed = question.value.trim()
  if (!trimmed || isAsking.value) return

  if (!props.lawyerInfo.userId) {
    toast.error('Unable to start a conversation with this lawyer.')
    return
  }

  try {
    await askQuestionAsync({
      lawyerUserId: props.lawyerInfo.userId,
      question: trimmed,
    })
    question.value = ''
    isOpen.value = false
  } catch {
    // toast handled in composable
  }
}

watch(isOpen, (open) => {
  if (!open) question.value = ''
})
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      :side="isDesktop ? 'right' : 'bottom'"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-md"
    >
      <div class="border-b border-border px-6 py-5">
        <h2 class="text-lg font-semibold text-foreground">
          Ask {{ lawyerInfo.name }} a question
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Free to message. The lawyer may request a consultation fee later.
        </p>
      </div>

      <form class="flex flex-1 flex-col gap-4 px-6 py-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="question">Your question</Label>
          <Textarea
            id="question"
            v-model="question"
            rows="6"
            maxlength="5000"
            placeholder="Describe your legal question or situation…"
            class="min-h-[160px] resize-none"
          />
          <p class="text-xs text-muted-foreground">
            You can attach files after the conversation opens.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          class="mt-auto h-12 w-full font-semibold"
          :disabled="!question.trim() || isAsking"
        >
          <HugeiconsIcon :icon="Loading03Icon" v-if="isAsking" class="mr-2 size-4 animate-spin" />
          <HugeiconsIcon :icon="SentIcon" v-else class="mr-2 size-4" />
          Send question
        </Button>
      </form>
    </SheetContent>
  </Sheet>
</template>
