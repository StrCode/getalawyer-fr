import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { useLawyerOnboardingStore } from '~/stores/lawyerOnboardingStore'

type Issue = { path: readonly PropertyKey[]; message: string }
type ParseResult<TParsed> =
  | { success: true; data: TParsed }
  | { success: false; error: { issues: Issue[] } }

type StepValidate = (() => Promise<boolean>) | null

export type WizardStepFormOptions<TValues extends Record<string, unknown>, TParsed> = {
  /** Draft payload section that re-seeds the form once the server draft lands. */
  draftSection?: 'personal' | 'professional' | 'practice'
  /** Form values from the store. Also used for reset / re-hydration. */
  snapshot: () => TValues
  /**
   * Validate the current values. Called on every change (TanStack form-level
   * validator) and once more on Continue, so it may close over reactive state
   * (e.g. a schema that depends on another step).
   */
  parse: (values: TValues) => ParseResult<TParsed>
  /** Mirror form values into the store as the user types. */
  sync: (values: TValues) => void
  /** Write the parsed (normalized) values to the store after a successful Continue. */
  commit: (parsed: TParsed) => void
  /** Return true to treat Continue as valid without validating (e.g. step already completed). */
  skip?: () => boolean
  /** Runs after the form is (re)seeded from the store. */
  onReset?: () => void
  /** Runs after a successful Continue. */
  onValidated?: () => void
}

/**
 * Shared wiring for a lawyer-onboarding wizard step backed by TanStack Form.
 *
 * Errors display after the field is blurred, or for every field after a failed
 * Continue. The wizard layout owns the Continue button and calls the validate
 * function this composable registers.
 */
export function useWizardStepForm<TValues extends Record<string, unknown>, TParsed>(
  options: WizardStepFormOptions<TValues, TParsed>,
) {
  const store = useLawyerOnboardingStore()
  const registerValidate = inject<((fn: StepValidate) => void) | undefined>(
    'registerLawyerOnboardingStepValidate',
    undefined,
  )

  const form = useForm({
    defaultValues: options.snapshot(),
    validators: {
      onChange: ({ value }) => toFormErrors(options.parse(value as TValues)),
    },
    listeners: {
      onBlur: ({ fieldApi }) => {
        fieldApi.validate('change')
      },
    },
  })

  /** Reactive snapshot — `form.state.values` is not tracked by Vue watchers. */
  const formValues = form.useStore((state) => state.values)
  const formFieldMeta = form.useStore((state) => state.fieldMeta)

  watch(formValues, (v) => options.sync(v as TValues), { deep: true })

  const submitAttempted = ref(false)

  function isInvalid(field: { state: { meta: { isBlurred: boolean; isValid: boolean } } }) {
    if (field.state.meta.isValid) return false
    return submitAttempted.value || field.state.meta.isBlurred
  }

  function reset() {
    form.reset(options.snapshot())
    submitAttempted.value = false
    options.onReset?.()
  }

  async function validate(): Promise<boolean> {
    if (options.skip?.()) return true

    submitAttempted.value = true
    const values = formValues.value as TValues
    options.sync(values)

    await form.validateAllFields('submit')
    const parsed = options.parse(values)
    const meta = formFieldMeta.value as Record<string, { isValid: boolean }> | undefined
    const fieldInvalid = !!meta && Object.values(meta).some((m) => !m.isValid)

    if (!parsed.success || fieldInvalid) {
      const first = parsed.success ? undefined : parsed.error.issues[0]?.message
      store.validationError = first ?? 'Please check the highlighted fields.'
      void nextTick(focusFirstInvalid)
      return false
    }

    options.commit(parsed.data)
    store.validationError = null
    submitAttempted.value = false
    options.onValidated?.()
    return true
  }

  onMounted(() => {
    reset()
    registerValidate?.(validate)
  })

  onBeforeUnmount(() => {
    registerValidate?.(null)
  })

  if (options.draftSection) {
    useOnboardingDraftHydration(options.draftSection, reset)
  }

  return { form, formValues, submitAttempted, isInvalid, reset, validate }
}

/** Map a parse failure to TanStack's form-level error shape, one message per top-level field. */
function toFormErrors<TParsed>(result: ParseResult<TParsed>) {
  if (result.success) return undefined
  const fields: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!fields[key]) fields[key] = issue.message
  }
  return { fields }
}

function focusFirstInvalid() {
  if (typeof document === 'undefined') return
  const el = document.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (!el) return
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  el.focus({ preventScroll: true })
}
