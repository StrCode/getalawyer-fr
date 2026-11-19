/**
 * Class lists for the forms inside the lawyer application's sections (full
 * strings, so Tailwind sees them). The fields sit straight on the page ground,
 * the way the sign-in forms do, in groups separated by a rule; they share the
 * sign-in group's input look (see auth-ui.ts) so the two read as one product.
 */

/** The whole form of a section: its groups, stacked. */
export const canopyForm = 'mt-[1.25rem] grid gap-[1.5rem]'

/**
 * One group of fields (a fieldset). Every group after the first gets a rule
 * above it. The rule is drawn on the legend, not the fieldset: a fieldset's own
 * top border runs through its legend.
 */
export const canopyGroup = 'min-w-0 gap-[0.9rem] not-first:[&>legend]:border-t not-first:[&>legend]:border-border not-first:[&>legend]:pt-[1.5rem]'

/** A group's title. */
export const canopyLegend = 'mb-[0.45rem] w-full font-display text-[1.15rem] font-[650] tracking-[-0.02em]'

/** Label, control, hint and error of one field. */
export const canopyField = 'min-w-0 gap-[0.4rem]'
export const canopyLabel = 'text-[0.9rem] font-semibold'
export const canopyHint = 'text-[0.85rem] text-muted-foreground'

/** A select's closed box, matching the text inputs. */
export const canopySelect = `${authInput} w-full data-[size=default]:h-[3.25rem] data-[placeholder]:text-placeholder`

/** A button that opens a picker (date, practice areas), styled as a field. */
export const canopyTrigger = `${authInput} w-full cursor-pointer justify-between px-4 font-normal has-[>svg]:px-4 hover:bg-card hover:text-foreground dark:bg-card dark:hover:bg-card`

/** The panel a select, date picker or search list opens. */
export const canopyPanel = 'rounded-[1rem] border-border'

/** A tick-box with its explanation, as one tappable row. */
export const canopyChoice = 'flex cursor-pointer items-start gap-3 rounded-[1.1rem] border border-border bg-card p-4 transition-colors has-data-[state=checked]:border-brand has-data-[state=checked]:bg-mint'
export const canopyCheckbox = 'mt-0.5 size-5 rounded-[0.4rem] border-border bg-background'

/** A removable chip (a chosen practice area or state). */
export const canopyChip = 'inline-flex min-h-8 items-center gap-[0.35rem] rounded-full bg-mint px-3 text-[0.85rem] font-semibold text-deep'
