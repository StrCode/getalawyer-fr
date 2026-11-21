/**
 * Class lists for the forms inside the lawyer application's sections (full
 * strings, so Tailwind sees them). The fields sit straight on the page ground,
 * the way the sign-in forms do, in groups separated by a rule; they share the
 * sign-in group's input look (see auth-ui.ts) so the two read as one product.
 */

/** The whole form of a section: its groups, stacked. */
export const canopyForm = 'mt-5 grid gap-6'

/**
 * One group of fields (a fieldset). Every group after the first gets a rule
 * above it. The rule is drawn on the legend, not the fieldset: a fieldset's own
 * top border runs through its legend.
 */
export const canopyGroup = 'min-w-0 gap-3.5 not-first:[&>legend]:border-t not-first:[&>legend]:border-border not-first:[&>legend]:pt-6'

/** A group's title. */
export const canopyLegend = 'mb-1.75 w-full font-display text-lg font-normal tracking-tight'

/** Label, control, hint and error of one field. */
export const canopyField = 'min-w-0 gap-1.5'
export const canopyLabel = 'text-sm font-medium'
export const canopyHint = 'text-sm text-muted-foreground'

/** A select's closed box, matching the text inputs. */
export const canopySelect = `${authInput} w-full data-[size=default]:h-12 data-[placeholder]:text-placeholder`

/** A button that opens a picker (date, practice areas), styled as a field. */
export const canopyTrigger = `${authInput} w-full cursor-pointer justify-between px-4 font-normal has-[>svg]:px-4 hover:bg-card hover:text-foreground dark:bg-card dark:hover:bg-card`

/** A box for longer text, in the same look as the inputs. */
export const canopyTextarea = 'min-h-28 rounded-xl border-border bg-card px-4 py-3 text-base leading-normal text-foreground shadow-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-mint aria-invalid:border-destructive'

/** The panel a select, date picker or search list opens. */
export const canopyPanel = 'rounded-lg border-border'

/** A tick-box with its explanation, as one tappable row. */
export const canopyChoice = 'flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors has-data-[state=checked]:border-brand has-data-[state=checked]:bg-mint'
export const canopyCheckbox = 'mt-0.5 size-5 rounded-sm border-border bg-background'

/** A removable chip (a chosen practice area or state). */
export const canopyChip = 'inline-flex min-h-8 items-center gap-1.5 rounded-full bg-mint px-3 text-sm font-medium text-deep'
