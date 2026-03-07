import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

// Get API URL - use environment variable directly to avoid composable issues
const getApiUrl = () => {
  // Check if we're in browser
  if (typeof window !== 'undefined') {
    // Use window.__NUXT__ injected config if available
    if (window.__NUXT__?.config?.public?.apiUrl) {
      return window.__NUXT__.config.public.apiUrl;
    }
  }
  // Fallback to environment variable
  return import.meta.env.VITE_NUXT_PUBLIC_API_URL || 
         import.meta.env.NUXT_PUBLIC_API_URL || 
         'http://localhost:3001';
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
