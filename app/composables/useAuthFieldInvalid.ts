/** TanStack Form field — show errors after blur/touch. */
export function useAuthFieldInvalid() {
  function isInvalid(field: { state: { meta: { isTouched: boolean, isValid: boolean } } }) {
    return field.state.meta.isTouched && !field.state.meta.isValid
  }

  return { isInvalid }
}
