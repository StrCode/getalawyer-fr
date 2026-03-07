import { authClient } from '~/lib/auth-client';
import type { Session } from '~/lib/auth-client';

/**
 * Unified auth composable that combines SSR and client-side sessions
 * 
 * This composable eliminates the "flash of login form" by:
 * 1. Using server session during SSR (fetched by middleware)
 * 2. Persisting it through hydration with useState
 * 3. Falling back to Better Auth client session after hydration
 * 
 * Usage:
 * ```vue
 * <script setup>
 * const { session, isPending, signIn, signUp, signOut } = useAuth();
 * </script>
 * 
 * <template>
 *   <div v-if="isPending">Loading...</div>
 *   <div v-else-if="session">Welcome {{ session.user.email }}</div>
 *   <div v-else>Please sign in</div>
 * </template>
 * ```
 */
export function useAuth() {
  // Get server session from middleware (SSR only)
  const serverSession = useState<Session | null>('auth-server-session', () => {
    if (import.meta.server) {
      const event = useRequestEvent();
      return event?.context.session || null;
    }
    return null;
  });

  // Get client session from Better Auth
  const sessionData = authClient.useSession();
  const clientSession = computed(() => sessionData.value.data);
  const clientPending = computed(() => sessionData.value.isPending);

  // Unified session: prefer server session during initial load, then client session
  const session = computed<Session | null>(() => {
    // If we have server session and client is still loading, use server session
    // This prevents flash of login form during hydration
    if (serverSession.value && clientPending.value) {
      return serverSession.value;
    }
    // Otherwise use client session (which may be null)
    return clientSession.value || null;
  });

  // isPending is true only if we don't have any session and client is loading
  const isPending = computed(() => {
    return !serverSession.value && clientPending.value;
  });

  // Auth methods from Better Auth client
  const signIn = {
    email: authClient.signIn.email,
  };

  const signUp = {
    email: authClient.signUp.email,
  };

  const signOut = authClient.signOut;

  return {
    session,
    isPending,
    signIn,
    signUp,
    signOut,
  };
}
