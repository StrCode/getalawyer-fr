import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields, phoneNumberClient } from "better-auth/client/plugins";
import { DEV_BETTER_AUTH_URL, PROD_BETTER_AUTH_URL } from "./api-config";

/**
 * Get Auth API URL from runtime config or environment.
 * Works in both server and client contexts.
 */
const getAuthBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__NUXT__?.config?.public?.betterAuthUrl) {
    return window.__NUXT__.config.public.betterAuthUrl;
  }

  const betterAuthUrl =
    import.meta.env.NUXT_PUBLIC_BETTER_AUTH_URL ||
    import.meta.env.VITE_NUXT_PUBLIC_BETTER_AUTH_URL;

  if (betterAuthUrl) {
    return betterAuthUrl;
  }

  const apiUrl =
    import.meta.env.NUXT_PUBLIC_API_URL ||
    import.meta.env.VITE_NUXT_PUBLIC_API_URL;

  if (apiUrl) {
    return `${apiUrl.replace(/\/$/, '')}/api/auth`;
  }

  return import.meta.env.PROD ? PROD_BETTER_AUTH_URL : DEV_BETTER_AUTH_URL;
};

// Create auth client with proper configuration for external Hono backend
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
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
          // Server declares `input: false`; mirror it so signUp.email doesn't require it.
          input: false,
        },
      },
    }),
    emailOTPClient(),
    phoneNumberClient(),
  ],
});

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
