import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { casesAPI, type CaseMessageRow, type CaseUserType } from '~/lib/api/cases'
import { queryKeys } from '~/lib/query-client'
import { getSessionUserType } from '~/lib/session-user'
import type { Message } from '~/types/messaging'

/** Map a backend `case_messages` row onto the shared `Message` shape used by the chat UI. */
export function caseMessageRowToMessage(row: CaseMessageRow, currentUser?: { id: string, name?: string | null, image?: string | null } | null): Message {
  const isOwn = currentUser?.id === row.senderId
  return {
    id: row.id,
    conversationId: row.caseId,
    senderId: row.senderId,
    senderType: row.senderType,
    content: row.messageContent,
    metadata: null,
    status: row.isRead ? 'read' : 'sent',
    fileUrl: null,
    filePublicId: null,
    fileName: null,
    fileType: null,
    fileSize: null,
    replyToId: null,
    createdAt: row.createdAt,
    updatedAt: row.readAt ?? row.createdAt,
    sender: isOwn
      ? { id: row.senderId, name: currentUser?.name || 'You', image: currentUser?.image ?? null }
      : { id: row.senderId, name: row.senderType === 'lawyer' ? 'Lawyer' : 'Client', image: null },
    isRead: row.isRead,
  }
}

export const useCaseMessaging = (caseId: string) => {
  const { session } = useAuth()
  const { $socket } = useNuxtApp()
  const queryClient = useQueryClient()

  const userType = computed(() => getSessionUserType(session.value?.user) as CaseUserType | undefined)
  const queryKey = queryKeys.cases.conversation(caseId)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const rows = await casesAPI.getCaseMessages(caseId, userType.value)
      return rows.map((row) => caseMessageRowToMessage(row, session.value?.user))
    },
    enabled: computed(() => !!caseId),
  })

  const messages = computed<Message[]>(() => data.value ?? [])

  const sendMutation = useMutation({
    mutationFn: (content: string) => casesAPI.sendCaseMessage(caseId, content, userType.value),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Message[]>(queryKey)

      const user = session.value?.user
      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        conversationId: caseId,
        senderId: user?.id ?? '',
        senderType: userType.value === 'lawyer' ? 'lawyer' : 'client',
        content,
        metadata: null,
        status: 'sent',
        fileUrl: null,
        filePublicId: null,
        fileName: null,
        fileType: null,
        fileSize: null,
        replyToId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: { id: user?.id ?? '', name: user?.name || 'You', image: user?.image ?? null },
        isRead: false,
      }

      queryClient.setQueryData<Message[]>(queryKey, (old = []) => [...old, optimistic])
      return { previous }
    },
    onError: (_error, _content, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || sendMutation.isPending.value)
      throw new Error('Cannot send message')
    await sendMutation.mutateAsync(trimmed)
  }

  // Refetch when the socket announces a new message on this case.
  const handleMessageReceived = (payload: { caseId?: string }) => {
    if (payload?.caseId === caseId)
      refetch()
  }

  onMounted(() => {
    $socket?.on('message:received', handleMessageReceived)
  })

  onUnmounted(() => {
    $socket?.off('message:received', handleMessageReceived)
  })

  return {
    messages,
    isLoading: readonly(isLoading),
    error: readonly(error),
    isSending: readonly(sendMutation.isPending),
    sendMessage,
    refetch,
  }
}
