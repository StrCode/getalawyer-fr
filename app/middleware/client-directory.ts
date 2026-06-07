import { getSessionUserType } from '~/lib/session-user'

const CLIENT_DIRECTORY_PATHS = ['/find-lawyers', '/lawyers'] as const

function isClientDirectoryPath(path: string): boolean {
  return CLIENT_DIRECTORY_PATHS.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`),
  )
}

/**
 * Clients (and guests) may browse find-a-lawyer and public lawyer profiles.
 * Authenticated lawyers are redirected to the dashboard.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!isClientDirectoryPath(to.path)) return

  const { session } = useAuth()
  if (getSessionUserType(session.value?.user) !== 'lawyer') return

  return navigateTo('/dashboard')
})
