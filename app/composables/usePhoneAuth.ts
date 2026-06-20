import { authClient } from "~/lib/auth-client";
import { toBetterAuthPhone } from "~/lib/phone";

export type PhonePasswordStrategy = "serverSetPassword" | "resetPassword";

/** serverSetPassword: one OTP after verify (via /api/account/set-phone-password). resetPassword: legacy two-OTP fallback. */
export function getPhonePasswordStrategy(): PhonePasswordStrategy {
  const configured = import.meta.env.NUXT_PUBLIC_PHONE_PASSWORD_STRATEGY;
  if (configured === "resetPassword") return "resetPassword";
  return "serverSetPassword";
}

export function usePhoneAuth() {
  const config = useRuntimeConfig();
  const apiBase = computed(() => (config.public.apiUrl as string).replace(/\/$/, ""));

  function normalizePhone(phone: string): string | null {
    return toBetterAuthPhone(phone);
  }

  async function sendPhoneOtp(phone: string) {
    const phoneNumber = normalizePhone(phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Please enter a valid Nigerian phone number." } };
    }
    return authClient.phoneNumber.sendOtp({ phoneNumber });
  }

  async function verifyPhoneAndRegister(params: {
    phone: string;
    code: string;
    name: string;
    userType: string;
  }) {
    const phoneNumber = normalizePhone(params.phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.phoneNumber.verify({
      phoneNumber,
      code: params.code,
      name: params.name,
      userType: params.userType,
    });
  }

  /** Set password right after phone verify — uses server-only Better Auth setPassword (one OTP total). */
  async function setPasswordAfterVerify(password: string) {
    try {
      await $fetch<{ success: boolean; error?: string }>(
        `${apiBase.value}/api/account/set-phone-password`,
        {
          method: "POST",
          body: { newPassword: password },
          credentials: "include",
        },
      );
      return { data: { status: true }, error: null };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error ?? "Failed to set password.")
          : err instanceof Error
            ? err.message
            : "Failed to set password.";
      return { data: null, error: { message } };
    }
  }

  async function resetPasswordAfterSignup(params: {
    phone: string;
    code: string;
    password: string;
  }) {
    const phoneNumber = normalizePhone(params.phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.phoneNumber.resetPassword({
      phoneNumber,
      otp: params.code,
      newPassword: params.password,
    });
  }

  /** Legacy two-OTP path — only when NUXT_PUBLIC_PHONE_PASSWORD_STRATEGY=resetPassword */
  async function requestSignupPasswordOtp(phone: string) {
    const phoneNumber = normalizePhone(phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.phoneNumber.requestPasswordReset({ phoneNumber });
  }

  async function completePhoneRegistrationPassword(params: {
    phone: string;
    code: string;
    password: string;
  }) {
    if (getPhonePasswordStrategy() === "resetPassword") {
      return resetPasswordAfterSignup(params);
    }
    return setPasswordAfterVerify(params.password);
  }

  async function signInWithPhone(phone: string, password: string) {
    const phoneNumber = normalizePhone(phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.signIn.phoneNumber({ phoneNumber, password });
  }

  async function verifyPhoneOtp(params: {
    phone: string;
    code: string;
    updatePhoneNumber?: boolean;
  }) {
    const phoneNumber = normalizePhone(params.phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.phoneNumber.verify({
      phoneNumber,
      code: params.code,
      updatePhoneNumber: params.updatePhoneNumber,
    });
  }

  async function requestPhonePasswordReset(phone: string) {
    const phoneNumber = normalizePhone(phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.phoneNumber.requestPasswordReset({ phoneNumber });
  }

  async function resetPhonePassword(params: {
    phone: string;
    otp: string;
    newPassword: string;
  }) {
    const phoneNumber = normalizePhone(params.phone);
    if (!phoneNumber) {
      return { data: null, error: { message: "Invalid phone number." } };
    }
    return authClient.phoneNumber.resetPassword({
      phoneNumber,
      otp: params.otp,
      newPassword: params.newPassword,
    });
  }

  function isPhoneNotVerifiedError(error: { message?: string; code?: string } | null | undefined) {
    if (!error) return false;
    const msg = error.message ?? "";
    return (
      error.code === "PHONE_NUMBER_NOT_VERIFIED"
      || msg.includes("PHONE_NUMBER_NOT_VERIFIED")
      || msg.toLowerCase().includes("not verified")
    );
  }

  function isTooManyAttemptsError(error: { message?: string; status?: number } | null | undefined) {
    if (!error) return false;
    return (
      error.status === 403
      || (error.message ?? "").toLowerCase().includes("too many attempts")
    );
  }

  return {
    normalizePhone,
    sendPhoneOtp,
    verifyPhoneAndRegister,
    setPasswordAfterVerify,
    requestSignupPasswordOtp,
    completePhoneRegistrationPassword,
    signInWithPhone,
    verifyPhoneOtp,
    requestPhonePasswordReset,
    resetPhonePassword,
    isPhoneNotVerifiedError,
    isTooManyAttemptsError,
    getPhonePasswordStrategy,
  };
}
