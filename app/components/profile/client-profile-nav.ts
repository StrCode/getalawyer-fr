import { appIcons, type AppIconData } from '@/lib/app-icons'

export interface ClientProfileSection {
  id: string
  label: string
  icon: AppIconData
}

export const CLIENT_PROFILE_SECTIONS: ClientProfileSection[] = [
  { id: 'photo', label: 'Photo', icon: appIcons.camera },
  { id: 'personal', label: 'Personal', icon: appIcons.user },
  { id: 'location', label: 'Location', icon: appIcons.mapPin },
  { id: 'about', label: 'About', icon: appIcons.identificationCard },
  { id: 'contact', label: 'Contact', icon: appIcons.phone },
]
