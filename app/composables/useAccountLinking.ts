import { isTempPhoneEmail } from '~/lib/auth-constants'

function linkEmailErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback
  const data = (err as { data?: { error?: string; message?: string } }).data
  if (data?.error) return data.error
  if (data?.message) return data.message
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function useAccountLinking() {
  const config = useRuntimeConfig()
  const apiBase = computed(() => (config.public.apiUrl as string).replace(/\/$/, ''))

  async function requestLinkEmail(email: string) {
    try {
      return await $fetch<{ success: boolean; message?: string; error?: string }>(
        `${apiBase.value}/api/account/link-email`,
        {
          method: 'POST',
          body: { email },
          credentials: 'include',
        },
      )
    } catch (err: unknown) {
      throw new Error(linkEmailErrorMessage(err, 'Could not send verification code.'))
    }
  }

  async function verifyLinkEmail(email: string, otp: string) {
    try {
      return await $fetch<{ success: boolean; message?: string; error?: string }>(
        `${apiBase.value}/api/account/link-email/verify`,
        {
          method: 'POST',
          body: { email, otp },
          credentials: 'include',
        },
      )
    } catch (err: unknown) {
      throw new Error(linkEmailErrorMessage(err, 'Invalid or expired verification code.'))
    }
  }

  return {
    isTempPhoneEmail,
    requestLinkEmail,
    verifyLinkEmail,
  }
}
