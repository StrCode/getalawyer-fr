// Message Types
export type MessageKind = 'text' | 'consultation_fee_request' | 'consultation_fee_response'

export type FeeRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export interface FeeRequestMetadata {
  amount: string
  currency: string
  description?: string
  status: FeeRequestStatus
}

export interface FeeResponseMetadata {
  requestMessageId: string
  response: 'accepted' | 'declined'
}

/** Lifecycle of an optimistic (not yet server-confirmed) outgoing message. */
export type OptimisticSendState = 'queued' | 'pending' | 'failed'

export interface OptimisticMessage {
  clientId: string
  conversationId: string
  content: string
  /** Already-uploaded attachment metadata — upload completes before send. */
  file: FileUploadResponse | null
  replyToId: string | null
  senderId: string
  createdAt: string
  state: OptimisticSendState
}

export interface Message {
  id: string
  conversationId: string
  /** Echoed by the backend when the sender supplied one — reconciles optimistic bubbles. */
  clientId?: string
  senderId: string
  senderType?: 'lawyer' | 'client'
  content: string | null
  kind?: MessageKind
  metadata: FeeRequestMetadata | FeeResponseMetadata | Record<string, unknown> | null
  status: 'sent' | 'delivered' | 'read'
  fileUrl: string | null
  filePublicId: string | null
  fileName: string | null
  fileType: string | null
  fileSize: number | null
  replyToId: string | null
  createdAt: string
  updatedAt: string
  sender?: {
    id: string
    name: string
    image?: string | null
  }
  replyTo?: Message | null
  isRead?: boolean
}

// Conversation Types
export interface ConversationParticipant {
  userId: string
  name: string
  image?: string
  lastReadAt?: string
  role?: 'client' | 'lawyer'
}

export interface ConversationInfo {
  id: string
  title: string | null
  lastMessageAt: string | null
  unreadCount: number
  lastMessage?: {
    content: string
    fileUrl: string | null
    fileName: string | null
    createdAt: string
  }
  participants: ConversationParticipant[]
}

export interface ConversationDetail {
  conversation: {
    id: string
    title: string | null
    lastMessageAt: string | null
    createdAt: string
    updatedAt: string
  }
  participants: ConversationParticipant[]
  messages: Message[]
}

// Notification Types
export type NotificationType =
  | 'new_message'
  | 'new_conversation'
  | 'file_received'
  | 'consultation_fee_request'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  conversationId: string | null
  messageId: string | null
  /** Not persisted by the backend yet; supported so booking/case links light up when it is. */
  bookingId?: string | null
  caseId?: string | null
  data?: { conversationId?: string | null; bookingId?: string | null; caseId?: string | null } | null
  emailSent: boolean
  emailSentAt: string | null
  createdAt: string
}

// File Upload Types
export interface FileUploadResponse {
  url: string
  publicId: string
  name: string
  type: string
  size: number
}

export interface StartConversationResponse {
  conversationId: string
  message: Message
  created: boolean
}

// Socket Event Types
export interface ServerToClientEvents {
  'message:new': (message: Message) => void
  'message:status': (data: { conversationId: string; messageId: string; status: 'sent' | 'delivered' | 'read'; readBy: string }) => void
  'notification:new': (notification: Notification) => void
  'typing:start': (data: { userId: string; userName: string }) => void
  'typing:stop': (data: { userId: string }) => void
  'conversation:joined': (data: { conversationId: string }) => void
  /** Case-thread message (see useCaseRealTime / useCaseMessaging). */
  'message:received': (data: { message: unknown; conversationId: string; caseId: string; senderId: string }) => void
  'error': (data: { message: string; code: string; clientId?: string }) => void
}

export interface ClientToServerEvents {
  'conversation:join': (conversationId: string) => void
  'conversation:leave': (conversationId: string) => void
  'message:send': (data: {
    conversationId: string
    content: string
    file?: FileUploadResponse
    replyToId?: string
    /** Echoed back on message:new / error so optimistic bubbles reconcile. */
    clientId?: string
  }) => void
  'message:read': (data: { conversationId: string; messageId: string }) => void
  'message:delivered': (data: { conversationId: string; messageId: string }) => void
  'typing:start': (conversationId: string) => void
  'typing:stop': (conversationId: string) => void
}

export function isFeeRequestMessage(message: Message): message is Message & { metadata: FeeRequestMetadata } {
  return message.kind === 'consultation_fee_request' && message.metadata !== null
}

export function getFeeRequestMetadata(message: Message): FeeRequestMetadata | null {
  if (message.kind !== 'consultation_fee_request' || !message.metadata) return null
  return message.metadata as FeeRequestMetadata
}
