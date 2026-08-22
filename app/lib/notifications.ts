import type { Hugeicon } from '@/lib/icon-types'
import {
  Attachment01Icon,
  DollarCircleIcon,
  Message01Icon,
  MessageAdd01Icon,
  Notification03Icon,
} from '@hugeicons/core-free-icons'
import type { Notification, NotificationType } from '~/types/messaging'

export const NOTIFICATIONS_PAGE_SIZE = 20
export const NOTIFICATIONS_PREVIEW_COUNT = 5

/** Backend `notification_type` enum → hugeicon. Unknown types fall back to a bell. */
const NOTIFICATION_ICONS: Record<NotificationType, Hugeicon> = {
  new_message: Message01Icon,
  new_conversation: MessageAdd01Icon,
  file_received: Attachment01Icon,
  consultation_fee_request: DollarCircleIcon,
}

export function notificationIcon(type: string): Hugeicon {
  return NOTIFICATION_ICONS[type as NotificationType] ?? Notification03Icon
}

export type NotificationRole = 'lawyer' | 'client' | string | undefined

/**
 * Where a click on the notification should land. Derived from the
 * notification's context ids, with bookings routed per role (lawyers see
 * `/appointments`, clients `/bookings`).
 */
export function notificationLink(
  notification: Pick<Notification, 'type' | 'conversationId' | 'bookingId' | 'caseId' | 'data'>,
  role: NotificationRole,
): string {
  const bookingId = notification.bookingId ?? notification.data?.bookingId
  const caseId = notification.caseId ?? notification.data?.caseId
  const conversationId = notification.conversationId ?? notification.data?.conversationId

  if (conversationId)
    return `/dashboard/messages?conversation=${encodeURIComponent(conversationId)}`
  if (bookingId)
    return role === 'lawyer'
      ? `/dashboard/appointments/${encodeURIComponent(bookingId)}`
      : `/dashboard/bookings/${encodeURIComponent(bookingId)}`
  if (caseId)
    return `/dashboard/cases/${encodeURIComponent(caseId)}`
  if (notification.type === 'consultation_fee_request')
    return role === 'lawyer' ? '/dashboard/appointments' : '/dashboard/bookings'
  return '/dashboard/messages'
}

export function sortNotificationsNewestFirst<T extends Pick<Notification, 'createdAt'>>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function countUnread(items: readonly Pick<Notification, 'read'>[] | undefined): number {
  return (items ?? []).filter(item => !item.read).length
}

/** "99+" cap for compact badges. */
export function formatBadgeCount(count: number, cap = 99): string {
  return count > cap ? `${cap}+` : String(count)
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Compact relative time: "just now", "5m ago", "3h ago", "2d ago", then a short date. */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then))
    return ''
  const diff = now - then
  if (diff < MINUTE)
    return 'just now'
  if (diff < HOUR)
    return `${Math.floor(diff / MINUTE)}m ago`
  if (diff < DAY)
    return `${Math.floor(diff / HOUR)}h ago`
  if (diff < 7 * DAY)
    return `${Math.floor(diff / DAY)}d ago`
  const date = new Date(then)
  const sameYear = date.getFullYear() === new Date(now).getFullYear()
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
