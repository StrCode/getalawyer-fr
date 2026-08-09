/**
 * Shared listing-completion visuals for nav badges, page headers, and progress panels.
 */

export type ListingProgressTone = 'low' | 'mid' | 'high' | 'complete'

export function getListingProgressTone(percent: number): ListingProgressTone {
  if (percent >= 100) return 'complete'
  if (percent >= 67) return 'high'
  if (percent >= 34) return 'mid'
  return 'low'
}

/** Compact nav / pill badges (no border needed). */
export const LISTING_PROGRESS_NAV_BADGE_CLASS: Record<ListingProgressTone, string> = {
  low: 'border-0 bg-destructive/15 text-destructive',
  mid: 'border-0 bg-amber-500/15 text-amber-800 dark:text-amber-400',
  high: 'border-0 bg-primary/15 text-primary',
  complete: 'border-0 bg-primary/15 text-primary',
}

/** Outline badges used in page headers. */
export const LISTING_PROGRESS_OUTLINE_BADGE_CLASS: Record<ListingProgressTone, string> = {
  low: 'border-destructive/40 bg-destructive/10 text-destructive',
  mid: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-500',
  high: 'border-primary/40 bg-primary/10 text-primary',
  complete: 'border-primary/40 bg-primary/10 text-primary',
}

export const LISTING_PROGRESS_BAR_CLASS: Record<ListingProgressTone, string> = {
  low: 'bg-destructive',
  mid: 'bg-amber-500',
  high: 'bg-primary',
  complete: 'bg-primary',
}

export const LISTING_PROGRESS_TEXT_CLASS: Record<ListingProgressTone, string> = {
  low: 'text-destructive',
  mid: 'text-amber-700 dark:text-amber-500',
  high: 'text-primary',
  complete: 'text-primary',
}
