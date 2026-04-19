import type { Component } from 'vue'
import { PhCalendarBlank, PhMapPin, PhPhone, PhVideoCamera } from '@phosphor-icons/vue'

/** Maps API meeting type strings to Phosphor icon components. */
export function meetingTypeIcon(type: string): Component {
  switch (type) {
    case 'video':
      return PhVideoCamera
    case 'phone':
      return PhPhone
    case 'in_person':
      return PhMapPin
    default:
      return PhCalendarBlank
  }
}
