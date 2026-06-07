import { getSessionUserType } from '~/lib/session-user'

const CLIENT_DIRECTORY_PATHS = ['/find-lawyers'] as const

function isClientDirectoryPath(path: string): boolean {
  return CLIENT_DIRECTORY_PATHS.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`),
  )
}

/**
 * Clients (and guests) may browse find-a-lawyer.
 * Public lawyer profiles (/lawyers/:id) are allowed for clients and for lawyers
 * viewing their own profile — foreign profile access is blocked by the API (403).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!isClientDirectoryPath(to.path)) return

  const { session } = useAuth()
  if (getSessionUserType(session.value?.user) !== 'lawyer') return

  return navigateTo('/dashboard')
})
