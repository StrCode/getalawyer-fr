export const TEMP_PHONE_EMAIL_DOMAIN = "@phone.getalawyer.ng"

export function isTempPhoneEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.endsWith(TEMP_PHONE_EMAIL_DOMAIN)
}
