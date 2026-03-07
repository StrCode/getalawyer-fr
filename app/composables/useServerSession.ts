import { authClient } from '~/lib/auth-client';
import type { Session } from '~/lib/auth-client';

/**
 * Composable to access session data in both SSR and client contexts
 * On the server, it uses the session from the middleware
 * On the client, it uses the Better Auth client
 */
export function useServerSession() {
  if (import.meta.server) {
    const event = useRequestEvent();
    return {
      data: computed(() => event?.context.session || null),
      isPending: ref(false),
    };
  }

  // Client-side: use Better Auth's useSession
  return authClient.useSession();
}
