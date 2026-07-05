export type HeroSpotlightLawyer = {
  id: string
  name: string
  practiceArea: string
  initials: string
  /** Generated portrait — illustrative only */
  avatarUrl: string
  /** Fallback when the image fails to load */
  avatarClass: string
  /** Optional prefill when the card is clicked */
  searchQuery?: string
}

/** Deterministic generated avatars (Dicebear notionists). */
export function heroSpotlightAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/webp?seed=${encodeURIComponent(seed)}&size=88&backgroundColor=f5f5f4`
}

/** Decorative hero spotlight profiles — illustrative only, not live directory listings. */
export const HERO_SPOTLIGHT_LAWYERS: HeroSpotlightLawyer[] = [
  {
    id: 'spotlight-1',
    name: 'Adaeze Okafor',
    practiceArea: 'Family Law',
    initials: 'AO',
    avatarUrl: heroSpotlightAvatarUrl('adaeze-okafor'),
    avatarClass: 'bg-primary/12 text-primary',
    searchQuery: 'Family Law',
  },
  {
    id: 'spotlight-2',
    name: 'Chidi Nwosu',
    practiceArea: 'Property & Tenancy',
    initials: 'CN',
    avatarUrl: heroSpotlightAvatarUrl('chidi-nwosu'),
    avatarClass: 'bg-primary/15 text-primary',
    searchQuery: 'Property & tenancy',
  },
  {
    id: 'spotlight-3',
    name: 'Fatima Bello',
    practiceArea: 'Corporate Law',
    initials: 'FB',
    avatarUrl: heroSpotlightAvatarUrl('fatima-bello'),
    avatarClass: 'bg-secondary/20 text-secondary-foreground',
    searchQuery: 'Corporate & business',
  },
  {
    id: 'spotlight-4',
    name: 'Emeka Adeyemi',
    practiceArea: 'Criminal Defence',
    initials: 'EA',
    avatarUrl: heroSpotlightAvatarUrl('emeka-adeyemi'),
    avatarClass: 'bg-muted text-muted-foreground',
    searchQuery: 'Criminal defence',
  },
]

import { lawyersListingQueryFromParts } from '~/composables/useLawyerFilters'

export function heroSpotlightLawyerHref(lawyer: HeroSpotlightLawyer) {
  return {
    path: '/find-lawyers',
    query: lawyersListingQueryFromParts({
      keywords: lawyer.searchQuery,
    }),
  }
}
