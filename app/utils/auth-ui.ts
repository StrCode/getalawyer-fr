/**
 * Class lists shared by the sign-in group's fields and links (full strings, so
 * Tailwind sees them). They restyle the shadcn-vue controls for the Canopy
 * design without forking the components.
 */

/** Text inputs: taller, rounder, on the card colour, with the Canopy focus ring. */
export const authInput = 'h-13 rounded-lg border-border bg-card px-4 text-base text-foreground shadow-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-mint aria-invalid:border-destructive'

/** Inline text links and link-like buttons ("Use phone instead", "Forgot password?"). */
export const authLink = 'cursor-pointer font-medium text-brand underline underline-offset-3 disabled:cursor-not-allowed disabled:opacity-60'

/** The quiet "← Back" control above a title. */
export const authBack = 'inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand'

/** One box of the 6-digit code. Separate boxes follow the shadcn-vue `otp-02` block. */
export const authOtpSlot = 'h-14.5 w-auto flex-1 rounded-lg border border-border bg-card font-display text-2xl font-normal shadow-none first:rounded-l-lg last:rounded-r-lg data-[active=true]:border-brand data-[active=true]:ring-4 data-[active=true]:ring-mint'

/**
 * A field with something inside it (the +234 prefix, the show-password button),
 * built on the shadcn-vue input group: the group carries the border and focus
 * ring, the control inside is bare.
 */
export const authInputGroup = 'h-13 rounded-lg border-border bg-card shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-brand has-[[data-slot=input-group-control]:focus-visible]:ring-4 has-[[data-slot=input-group-control]:focus-visible]:ring-mint dark:bg-card'
export const authInputGroupControl = 'h-full px-4 text-base text-foreground placeholder:text-placeholder'
