import { isTempPhoneEmail } from "~/lib/auth-constants";

export function useAccountLinking() {
  const config = useRuntimeConfig();
  const apiBase = computed(() => (config.public.apiUrl as string).replace(/\/$/, ""));

  async function requestLinkEmail(email: string) {
    return $fetch<{ success: boolean; message?: string; error?: string }>(
      `${apiBase.value}/api/account/link-email`,
      {
        method: "POST",
        body: { email },
        credentials: "include",
        
      },
    );
  }

  async function verifyLinkEmail(email: string, otp: string) {
    return $fetch<{ success: boolean; message?: string; error?: string }>(
      `${apiBase.value}/api/account/link-email/verify`,
      {
        method: "POST",
        body: { email, otp },
        credentials: "include",
      },
    );
  }

  return {
    isTempPhoneEmail,
    requestLinkEmail,
    verifyLinkEmail,
  };
}
