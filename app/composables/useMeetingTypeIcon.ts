import type { Hugeicon } from '@/lib/icon-types'
import { Calendar01Icon, CallIcon, Location01Icon, Video01Icon } from '@hugeicons/core-free-icons'

/** Maps API meeting type strings to Hugeicons icon data. */
export function meetingTypeIcon(type: string): Hugeicon {
  switch (type) {
    case 'video':
      return Video01Icon
    case 'phone':
      return CallIcon
    case 'in_person':
      return Location01Icon
    default:
      return Calendar01Icon
  }
}
