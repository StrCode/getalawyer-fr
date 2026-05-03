/**
 * Drop-in substitute for `@nuxt/ui` FormSubmitEvent when using `@submit` payloads
 * with `event.data`.
 */
export type FormSubmitEvent<T = Record<string, unknown>> = {
  data: T
}
