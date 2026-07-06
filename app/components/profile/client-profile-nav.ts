import type { Hugeicon } from '@/lib/icon-types'
import { CallIcon, Camera01Icon, IdentityCardIcon, Location01Icon, UserIcon } from '@hugeicons/core-free-icons'


export interface ClientProfileSection {
  id: string
  label: string
  icon: Hugeicon
}

export const CLIENT_PROFILE_SECTIONS: ClientProfileSection[] = [
  { id: 'photo', label: 'Photo', icon: Camera01Icon },
  { id: 'personal', label: 'Personal', icon: UserIcon },
  { id: 'location', label: 'Location', icon: Location01Icon },
  { id: 'about', label: 'About', icon: IdentityCardIcon },
  { id: 'contact', label: 'Contact', icon: CallIcon },
]
