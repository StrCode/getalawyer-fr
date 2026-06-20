import { isTempPhoneEmail } from "~/lib/auth-constants";

type SessionUserWithEmail = {
  email?: string | null;
  emailVerified?: boolean;
};

/** Whether the user should verify or link email — deferred to dashboard, not onboarding. */
export function useEmailVerificationPrompt() {
  const { session } = useAuth();

  const user = computed(() => session.value?.user as SessionUserWithEmail | undefined);

  const needsLinkEmail = computed(() => isTempPhoneEmail(user.value?.email));

  const needsVerifyEmail = computed(() => {
    if (!user.value?.email || needsLinkEmail.value) return false;
    return user.value.emailVerified !== true;
  });

  const needsEmailAction = computed(
    () => needsLinkEmail.value || needsVerifyEmail.value,
  );

  return {
    user,
    needsLinkEmail,
    needsVerifyEmail,
    needsEmailAction,
  };
}
