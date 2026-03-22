// Message Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderType: 'lawyer' | 'client'
  content: string
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
  isRead: boolean
}

// Conversation Types
export interface ConversationParticipant {
  userId: string
  name: string
  image?: string
  lastReadAt?: string
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
export interface Notification {
  id: string
  userId: string
  type: 'new_message'
  title: string
  body: string
  read: boolean
  conversationId: string
  messageId: string
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

// Socket Event Types
export interface ServerToClientEvents {
  'message:new': (message: Message) => void
  'message:status': (data: { messageId: string; status: string; readBy: string }) => void
  'notification:new': (notification: Notification) => void
  'typing:start': (data: { userId: string; userName: string }) => void
  'typing:stop': (data: { userId: string }) => void
  'conversation:joined': (data: { conversationId: string }) => void
  'error': (data: { message: string; code: string }) => void
}

export interface ClientToServerEvents {
  'conversation:join': (conversationId: string) => void
  'conversation:leave': (conversationId: string) => void
  'message:send': (data: {
    conversationId: string
    content: string
    file?: FileUploadResponse
    replyToId?: string
  }) => void
  'message:read': (data: { conversationId: string; messageId: string }) => void
  'typing:start': (conversationId: string) => void
  'typing:stop': (conversationId: string) => void
}
