/**
 * Class lists shared by the sign-in group's fields and links (full strings, so
 * Tailwind sees them). They restyle the shadcn-vue controls for the Canopy
 * design without forking the components.
 */

/** Text inputs: taller, rounder, on the card colour, with the Canopy focus ring. */
export const authInput = 'h-[3.25rem] rounded-[1rem] border-border bg-card px-4 text-[1.02rem] shadow-none placeholder:text-placeholder focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-mint aria-invalid:border-destructive'

/** Inline text links and link-like buttons ("Use phone instead", "Forgot password?"). */
export const authLink = 'cursor-pointer font-semibold text-brand underline underline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-60'

/** The quiet "← Back" control above a title. */
export const authBack = 'inline-flex min-h-11 cursor-pointer items-center gap-[0.4rem] text-[0.9rem] font-semibold text-muted-foreground hover:text-brand'

/** One box of the 6-digit code. Separate boxes follow the shadcn-vue `otp-02` block. */
export const authOtpSlot = 'h-[3.6rem] w-auto flex-1 rounded-[1rem] border border-border bg-card font-display text-[1.5rem] font-[650] shadow-none first:rounded-l-[1rem] last:rounded-r-[1rem] data-[active=true]:border-brand data-[active=true]:ring-4 data-[active=true]:ring-mint'

/**
 * A field with something inside it (the +234 prefix, the show-password button),
 * built on the shadcn-vue input group: the group carries the border and focus
 * ring, the control inside is bare.
 */
export const authInputGroup = 'h-[3.25rem] rounded-[1rem] border-border bg-card shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-brand has-[[data-slot=input-group-control]:focus-visible]:ring-4 has-[[data-slot=input-group-control]:focus-visible]:ring-mint dark:bg-card'
export const authInputGroupControl = 'h-full px-4 text-[1.02rem] placeholder:text-placeholder'
