import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Get Auth API URL from runtime config or environment
 * Works in both server and client contexts
 */
const getAuthBaseUrl = () => {
  // In browser, check for Nuxt injected config first
  if (typeof window !== 'undefined' && window.__NUXT__?.config?.public?.betterAuthUrl) {
    return window.__NUXT__.config.public.betterAuthUrl;
  }
  
  // Check environment variables
  const envUrl = import.meta.env.VITE_NUXT_PUBLIC_API_URL || 
                 import.meta.env.NUXT_PUBLIC_API_URL;
  
  if (envUrl) {
    return `${envUrl}/api/auth`;
  }
  
  // Production default (hardcoded fallback)
  if (import.meta.env.PROD) {
    return 'https://api.getalawyer.ng/api/auth';
  }
  
  // Development fallback
  return 'http://localhost:3001/api/auth';
}

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
        },
      },
    }),
    emailOTPClient(),
  ],
});

// Export types
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
