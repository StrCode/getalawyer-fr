import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

// Get runtime config - this works because Nuxt makes it available globally
function getApiUrl() {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Nuxt injects useRuntimeConfig globally
    const config = useRuntimeConfig();
    return config.public.apiUrl;
  }
  return "http://localhost:3000";
}

// Create auth client with proper configuration for external Hono backend
export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  fetchOptions: {
    credentials: "include", // Required for cookie-based sessions
  },
  plugins: [
    inferAdditionalFields({
      user: {
        userType: {
          type: "string"
        },
        role: {
          type: "string",
          required: false,
        },
        onboarding_completed: {
          type: "boolean",
        },
      },
    }),
    emailOTPClient(),
  ],
});

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
