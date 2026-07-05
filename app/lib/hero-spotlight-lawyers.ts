export type HeroSpotlightLawyer = {
  id: string
  name: string
  practiceArea: string
  initials: string
  avatarClass: string
  /** Optional prefill when the card is clicked */
  searchQuery?: string
}

/** Decorative hero spotlight profiles — illustrative only, not live directory listings. */
export const HERO_SPOTLIGHT_LAWYERS: HeroSpotlightLawyer[] = [
  {
    id: 'spotlight-1',
    name: 'Adaeze Okafor',
    practiceArea: 'Family Law',
    initials: 'AO',
    avatarClass: 'bg-primary/12 text-primary',
    searchQuery: 'Family Law',
  },
  {
    id: 'spotlight-2',
    name: 'Chidi Nwosu',
    practiceArea: 'Property & Tenancy',
    initials: 'CN',
    avatarClass: 'bg-primary/15 text-primary',
    searchQuery: 'Property & tenancy',
  },
  {
    id: 'spotlight-3',
    name: 'Fatima Bello',
    practiceArea: 'Corporate Law',
    initials: 'FB',
    avatarClass: 'bg-secondary/20 text-secondary-foreground',
    searchQuery: 'Corporate & business',
  },
  {
    id: 'spotlight-4',
    name: 'Emeka Adeyemi',
    practiceArea: 'Criminal Defence',
    initials: 'EA',
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
