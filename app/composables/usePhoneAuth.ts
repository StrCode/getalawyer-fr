import { authClient } from "~/lib/auth-client";
import { toBetterAuthPhone } from "~/lib/phone";

export type PhonePasswordStrategy = "setPassword" | "resetPassword";

/** Which path passed Phase 1.5 spike — resetPassword works on Better Auth 1.6.20; setPassword is server-only */
export function getPhonePasswordStrategy(): PhonePasswordStrategy {
  const configured = import.meta.env.NUXT_PUBLIC_PHONE_PASSWORD_STRATEGY;
  if (configured === "setPassword") return "setPassword";
  return "resetPassword";
}

export function usePhoneAuth() {
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

  async function setPasswordAfterVerify(password: string) {
    return authClient.setPassword({ newPassword: password });
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

  /** After verify: request password-reset OTP (second SMS). Returns when sent. */
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
    const strategy = getPhonePasswordStrategy();
    if (strategy === "resetPassword") {
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
