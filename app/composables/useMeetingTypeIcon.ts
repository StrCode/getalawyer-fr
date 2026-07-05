import { appIcons, type AppIconData } from '@/lib/app-icons'
/** Maps API meeting type strings to Phosphor icon components. */
export function meetingTypeIcon(type: string): AppIconData {
  switch (type) {
    case 'video':
      return appIcons.videoCamera
    case 'phone':
      return appIcons.phone
    case 'in_person':
      return appIcons.mapPin
    default:
      return appIcons.calendarBlank
  }
}
