import { getSessionUserType, type SessionUserWithOnboarding } from '~/lib/session-user'

/**
 * Addresses of what follows sign-up: a lawyer's application and a client's
 * welcome steps. Kept in one place so pages, layouts and middleware agree.
 *
 * A lawyer's application is one address, `/application`, whatever state it is
 * in (being filled in, in review, needing changes); only the sections and the
 * membership payment have addresses of their own.
 */
export const APPLICATION_HOME = '/application'
export const APPLICATION_MEMBERSHIP = '/application/membership'

/** The four sections of the application, by the key each one saves under. */
export const APPLICATION_SECTION_PATHS = {
  personal_info: '/application/about-you',
  nin_verification: '/application/identity',
  professional_info: '/application/bar-credentials',
  practice_info: '/application/practice',
} as const

export type ApplicationSectionKey = keyof typeof APPLICATION_SECTION_PATHS

/** The section key for an address, or null when it is not a section. */
export function applicationSectionKeyFor(path: string): ApplicationSectionKey | null {
  const entry = Object.entries(APPLICATION_SECTION_PATHS).find(([, sectionPath]) => sectionPath === path)
  return (entry?.[0] as ApplicationSectionKey | undefined) ?? null
}

/** A client's welcome steps, in order. */
export const WELCOME_STEPS = [
  { key: 'location', path: '/welcome/location', label: 'Your state' },
  { key: 'specializations', path: '/welcome/legal-needs', label: 'Legal needs' },
] as const

export const WELCOME_HOME = WELCOME_STEPS[0].path

function isUnder(path: string, root: string) {
  return path === root || path.startsWith(`${root}/`)
}

/** True for any address in the lawyer application or the client welcome steps. */
export function isSetupPath(path: string): boolean {
  return isUnder(path, '/application') || isUnder(path, '/welcome')
}

/** Where someone who has not finished setting up belongs: lawyers apply, everyone else is welcomed. */
export function setupHomeFor(user: SessionUserWithOnboarding | null | undefined): string {
  return getSessionUserType(user) === 'lawyer' ? APPLICATION_HOME : WELCOME_HOME
}
