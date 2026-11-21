/**
 * Class lists shared by the dashboard panels that have not been rebuilt one by
 * one yet (the profile editor), so they sit in the Canopy look with the rest.
 * PANEL = a bordered section; MICRO = a small uppercase label.
 */
export const PANEL = 'overflow-hidden rounded-card border border-border bg-card'

export const MICRO = 'text-[0.8125rem] font-bold tracking-[0.08em] uppercase'

export const PANEL_HEADER =
  'flex flex-wrap items-start justify-between gap-3 border-b border-border px-[clamp(1.1rem,2.2vw,1.5rem)] py-[1.1rem]'

export const PANEL_FOOTER = 'border-t border-border bg-background/60 px-[clamp(1.1rem,2.2vw,1.5rem)] py-[0.95rem]'

export const PANEL_TITLE = 'font-display text-[1.15rem] font-[650] tracking-[-0.02em]'

export const PANEL_LINK =
  'group text-[0.92rem] font-semibold text-brand'

export const PANEL_LINK_ARROW =
  'ml-1 inline-block transition-transform duration-200 ease-canopy group-hover:translate-x-0.5'

/**
 * Put on the wrapper of a page whose sections are still the shared ui/ cards:
 * gives every card inside it the Canopy panel edge and heading, in one place,
 * until those sections are rebuilt.
 */
export const CANOPY_CARDS = [
  '[&_[data-slot=card]]:rounded-card [&_[data-slot=card]]:border-border [&_[data-slot=card]]:shadow-none',
  '[&_[data-slot=card-title]]:font-display [&_[data-slot=card-title]]:text-[1.15rem] [&_[data-slot=card-title]]:leading-[1.2] [&_[data-slot=card-title]]:font-[650] [&_[data-slot=card-title]]:tracking-[-0.02em]',
  '[&_[data-slot=card-description]]:text-[0.95rem]',
].join(' ')
