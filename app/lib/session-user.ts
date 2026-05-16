/** Session user fields extended via Better Auth `inferAdditionalFields`. */
export type SessionUserWithOnboarding = {
  userType?: string
  role?: string | null
  onboarding_completed?: boolean
}

export function getSessionUserType(
  user: SessionUserWithOnboarding | null | undefined,
): string | undefined {
  return user?.userType ?? user?.role
}

export function isLawyerOrClientUser(
  user: SessionUserWithOnboarding | null | undefined,
): boolean {
  const userType = getSessionUserType(user)
  return userType === 'lawyer' || userType === 'client'
}

export function isOnboardingIncomplete(
  user: SessionUserWithOnboarding | null | undefined,
): boolean {
  if (!isLawyerOrClientUser(user)) return false
  return !user?.onboarding_completed
}
