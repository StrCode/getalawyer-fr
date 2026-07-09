import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Alert } from "./Alert.vue"
export { default as AlertDescription } from "./AlertDescription.vue"
export { default as AlertTitle } from "./AlertTitle.vue"

export const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground",
        success:
          "border-success-border bg-success-subtle text-success-subtle-foreground [&>svg]:text-success *:data-[slot=alert-description]:text-success-subtle-foreground/90",
        warning:
          "border-warning-border bg-warning-subtle text-warning-subtle-foreground [&>svg]:text-warning *:data-[slot=alert-description]:text-warning-subtle-foreground/90",
        info:
          "border-info-border bg-info-subtle text-info-subtle-foreground [&>svg]:text-info *:data-[slot=alert-description]:text-info-subtle-foreground/90",
        destructive:
          "border-destructive-border bg-destructive-subtle text-destructive-subtle-foreground [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive-subtle-foreground/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)
export type AlertVariants = VariantProps<typeof alertVariants>
