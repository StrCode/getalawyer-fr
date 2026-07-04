import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { messagingAPI } from '~/lib/api/messaging'

export function useAskQuestion() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async ({
      lawyerUserId,
      question,
    }: {
      lawyerUserId: string
      question: string
    }) => {
      return messagingAPI.startConversation([lawyerUserId], question)
    },
    onSuccess: (data) => {
      router.push(`/dashboard/messages?conversation=${data.conversationId}`)
    },
    onError: (error: { data?: { code?: string; error?: string }; message?: string }) => {
      const code = error.data?.code
      if (code === 'CONVERSATION_START_RATE_LIMITED') {
        toast.error('You have started too many new conversations recently. Please try again later.')
        return
      }
      toast.error(error.data?.error || error.message || 'Failed to send your question')
    },
  })

  return {
    askQuestion: mutation.mutate,
    askQuestionAsync: mutation.mutateAsync,
    isAsking: computed(() => mutation.isPending.value),
  }
}
