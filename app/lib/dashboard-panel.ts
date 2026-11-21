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
