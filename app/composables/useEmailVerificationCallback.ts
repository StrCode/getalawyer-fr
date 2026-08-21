import { toast } from 'vue-sonner'

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: 'That verification link is invalid. Request a new one.',
  TOKEN_EXPIRED: 'That verification link has expired. Request a new one.',
  USER_NOT_FOUND: 'We could not find an account for that verification link.',
  INVALID_USER: 'That verification link does not match your account.',
}

/**
 * Handles Better Auth email-verify redirects to /dashboard:
 * - Success: `?emailVerified=1` → refetch session (bypass cookie cache)
 * - Failure: `?error=INVALID_TOKEN|TOKEN_EXPIRED|…` → toast + open verify dialog
 *
 * callbackURL used by the app: `${origin}/dashboard?emailVerified=1`
 * Failed verify becomes: `/dashboard?emailVerified=1&error=INVALID_TOKEN`
 */
export function useEmailVerificationCallback() {
  const route = useRoute()
  const router = useRouter()
  const { refetchSession } = useAuth()
  const { needsVerifyEmail } = useEmailVerificationPrompt()
  const { openDialog } = useEmailVerificationDialog()

  async function handleEmailVerificationCallback() {
    if (!import.meta.client) return

    const errorCode = typeof route.query.error === 'string' ? route.query.error : null
    const markedVerified = route.query.emailVerified === '1'
    const fromVerifyLink = markedVerified || Boolean(errorCode)

    if (!fromVerifyLink) return

    const nextQuery = { ...route.query }
    delete nextQuery.error
    delete nextQuery.emailVerified

    await router.replace({ path: route.path, query: nextQuery })

    // Always refresh after a verify redirect so emailVerified isn't stuck in cookie cache.
    const fresh = await refetchSession()
    const stillNeedsVerify = fresh?.user
      ? (fresh.user as { emailVerified?: boolean }).emailVerified !== true
      : needsVerifyEmail.value

    if (errorCode) {
      toast.error(
        VERIFY_ERROR_MESSAGES[errorCode] ?? 'Email verification failed. Please try again.',
      )
      if (stillNeedsVerify) {
        openDialog()
      }
      return
    }

    if (!stillNeedsVerify) {
      toast.success('Email verified successfully.')
      return
    }

    // Rare race: DB updated but session still stale — let the user resend.
    openDialog()
  }

  return { handleEmailVerificationCallback }
}
