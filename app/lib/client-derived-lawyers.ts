import type { Booking } from '~/types/booking'
import type { ConversationInfo } from '~/types/messaging'

export interface ClientLawyerContact {
  lawyerProfileId: string | null
  userId: string | null
  name: string
  image: string | null
  lastInteractionAt: string
  bookingCount: number
  hasActiveCase: boolean
  conversationId: string | null
}

function upsertContact(
  map: Map<string, ClientLawyerContact>,
  key: string,
  contact: ClientLawyerContact,
) {
  const existing = map.get(key)
  if (!existing) {
    map.set(key, contact)
    return
  }

  existing.bookingCount += contact.bookingCount
  if (contact.hasActiveCase) existing.hasActiveCase = true
  if (contact.lawyerProfileId) existing.lawyerProfileId = contact.lawyerProfileId
  if (contact.conversationId) existing.conversationId = contact.conversationId
  if (contact.userId) existing.userId = contact.userId
  if (!existing.image && contact.image) existing.image = contact.image
  if (new Date(contact.lastInteractionAt).getTime() > new Date(existing.lastInteractionAt).getTime()) {
    existing.lastInteractionAt = contact.lastInteractionAt
  }
}

export function deriveClientLawyers(
  bookings: Booking[],
  conversations: ConversationInfo[],
  currentUserId: string | null | undefined,
): ClientLawyerContact[] {
  const map = new Map<string, ClientLawyerContact>()

  for (const booking of bookings) {
    const lawyer = booking.lawyer
    if (!lawyer?.id && !booking.lawyerId) continue
    if (!['pending', 'confirmed', 'completed'].includes(booking.status)) continue

    const profileId = booking.lawyerId || lawyer?.id || null
    const key = profileId ?? `booking-${booking.id}`
    const interactionAt = booking.updatedAt || booking.createdAt

    upsertContact(map, key, {
      lawyerProfileId: profileId,
      userId: null,
      name: lawyer?.name ?? 'Lawyer',
      image: lawyer?.profilePicture ?? null,
      lastInteractionAt: interactionAt,
      bookingCount: 1,
      hasActiveCase: Boolean(booking.caseId),
      conversationId: booking.conversationId ?? null,
    })
  }

  for (const conversation of conversations) {
    const other = conversation.participants.find((p) => p.userId !== currentUserId)
    if (!other || other.role === 'client') continue

    const interactionAt = conversation.lastMessageAt ?? conversation.lastMessage?.createdAt ?? ''
    if (!interactionAt) continue

    const key = `user-${other.userId}`
    upsertContact(map, key, {
      lawyerProfileId: null,
      userId: other.userId,
      name: other.name,
      image: other.image ?? null,
      lastInteractionAt: interactionAt,
      bookingCount: 0,
      hasActiveCase: false,
      conversationId: conversation.id,
    })
  }

  return [...map.values()].sort(
    (a, b) => new Date(b.lastInteractionAt).getTime() - new Date(a.lastInteractionAt).getTime(),
  )
}
