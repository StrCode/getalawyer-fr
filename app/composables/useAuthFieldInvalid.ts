import { useStore, type AnyFormApi } from '@tanstack/vue-form'

/**
 * TanStack Form field — show errors only after the field has been blurred
 * or a submit has been attempted. `isTouched` flips on the first keystroke,
 * so gating on it exposes stale form-level errors while the user is typing.
 */
export function useAuthFieldInvalid(form: AnyFormApi) {
  const submissionAttempts = useStore(form.store, (state) => state.submissionAttempts)

  function isInvalid(field: { state: { meta: { isBlurred: boolean, isValid: boolean } } }) {
    if (field.state.meta.isValid) return false
    return field.state.meta.isBlurred || submissionAttempts.value > 0
  }

  return { isInvalid }
}
