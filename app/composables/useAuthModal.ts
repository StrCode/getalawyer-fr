// composables/useAuthModal.ts

// All the possible views in the auth flow
type AuthView = 'startup' | 'entry' | 'otp' | 'email' | 'password' | 'signup' | 'forgot' | 'newpassword' | 'success'
type UserIntent = 'tenant' | 'property_owner' | null
type OtpType = 'phone' | 'email' | 'password-reset'

export const useAuthModal = () => {

  // ─── State ────────────────────────────────────────────────────────
  //
  // useState is Nuxt's SSR-safe version of ref.
  // The string key ('auth-modal-open' etc.) is what makes it GLOBAL —
  // every component that calls useAuthModal() gets the exact same
  // state instance, not a copy. Without the key it would be isolated.

  const isOpen = useState<boolean>('auth-modal-open', () => false)

  const intent = useState<UserIntent>('auth-intent', () => null)

  // The stack is an array of views. The last item is always what's
  // currently visible. Starting with ['entry'] means the modal
  // always opens on the entry screen by default.
  //
  // Example as user navigates:
  //   ['entry']                    → on entry screen
  //   ['entry', 'email']           → navigated to email
  //   ['entry', 'email', 'signup'] → navigated to signup
  //   ['entry', 'email']           → pressed back, popped signup
  const viewStack = useState<AuthView[]>('auth-view-stack', () => ['startup'])

  // Controls which way the animation slides.
  //   1  = forward  → new view slides in from the right
  //  -1  = back     → new view slides in from the left
  // motion-v reads this to set the initial x offset
  const direction = useState<1 | -1>('auth-direction', () => 1)

  // Stored here so child views can share it without prop drilling.
  // Can be either email address or phone number depending on the auth flow
  const identifier = useState<string>('auth-identifier', () => '')

  // OTP type to determine which API endpoints to use
  const otpType = useState<OtpType>('auth-otp-type', () => 'email')

  // Store the verified OTP token for password reset
  const resetToken = useState<string>('auth-reset-token', () => '')

  // ─── Computed ─────────────────────────────────────────────────────

  // Always derived from the stack — never stored separately.
  // at(-1) gets the last item. If stack is ['entry', 'email']
  // this returns 'email'.
  const currentView = computed<AuthView>(() => viewStack.value.at(-1)!)

  // True when there is more than one view in the stack,
  // which means the user can go back. AuthShell uses this
  // to show or hide the back button.
  const canGoBack = computed<boolean>(() => viewStack.value.length > 1)

  // ─── Actions ──────────────────────────────────────────────────────

  // Called from any component that wants to open the modal.
  // startView defaults to 'entry' but can be overridden:
  //   open()           → opens on entry screen
  //   open('signup')   → opens directly on signup screen
  // Resets all state so previous sessions don't bleed through.
  function open(startView: AuthView = 'startup'): void {
    viewStack.value = [startView]
    direction.value = 1
    identifier.value = ''
    isOpen.value = true
  }

  // Closes the modal and resets state after the exit animation
  // completes (300ms). You don't want to reset while the modal
  // is still animating out or the content will flash to entry
  // before it's fully gone.
  function close(): void {
    isOpen.value = false
    setTimeout(() => {
      viewStack.value = ['entry']
      direction.value = 1
      identifier.value = ''
    }, 300)
  }

  // Navigate forward to a new view.
  // Sets direction to 1 so motion-v slides the new view in from
  // the right, then appends the view to the stack.
  // Using spread [...viewStack.value, view] instead of .push()
  // because mutating a useState array directly can sometimes
  // not trigger reactivity in Nuxt — spread creates a new array
  // reference which guarantees the update is detected.
  function push(view: AuthView): void {
    direction.value = 1
    viewStack.value = [...viewStack.value, view]
  }

  // Navigate back to the previous view.
  // Sets direction to -1 so the animation slides the opposite way,
  // then removes the last item from the stack.
  // The guard prevents popping below a single-item stack which
  // would leave currentView undefined.
  function pop(): void {
    if (viewStack.value.length <= 1) return
    direction.value = -1
    viewStack.value = viewStack.value.slice(0, -1)
  }

  // ─── Return ───────────────────────────────────────────────────────
  //
  // Only expose what components actually need.
  // The raw viewStack isn't exposed because nothing outside this
  // composable should manipulate it directly — push/pop/open/close
  // are the only intended ways to change navigation state.
  return {
    // State
    isOpen,
    direction,
    identifier,
    otpType,
    resetToken,
    // Computed
    currentView,
    canGoBack,
    // Actions
    open,
    close,
    push,
    pop,
    intent,
  }
}