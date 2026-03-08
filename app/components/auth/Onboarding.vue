<script lang="ts" setup>
import { SvgEnvelope, SvgPhone } from "#components";
import { VisuallyHidden } from "reka-ui";
import { computed, ref, watch } from "vue";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useValidate } from "~/composables/useValidate";
import { useAppResourceStore } from "~/stores/appResources";

const { signIn } = useAuth();
const appResourceStore = useAppResourceStore();

const carouselRef = ref<any>(null);
const isLoggingIn = ref<boolean>(false);
const showPassword = ref(false);
const validate = useValidate();
const formHasError = ref(true);
const loading = ref(false);
const loginFailed = ref(false);
const isVerifyingOTP = ref(false);
const otp = ref("");
const expectedOTPLength = ref(6);
const otpError = ref("");
const registrationError = ref("");
const confirmPassword = ref("");
const attemptedLogin = ref(false);
const currentStep2Action = ref<"login" | "register" | "resetPassword" | "verifyOTP" | "setPassword">("register");
type UniqueIdType = "email" | "phone";
const uniqueIdType = ref<UniqueIdType>("email");
const uniqueIdDetails = ref({
  email: { name: "Email", longName: "Email Address", formId: "email", slug: "email" as UniqueIdType, icon: markRaw(SvgEnvelope) },
  phone: { name: "Phone", longName: "Phone Number", formId: "phone_number", slug: "phone" as UniqueIdType, icon: markRaw(SvgPhone) },
});
const currentUniqueIdDetails = computed(() => {
  const otherType = uniqueIdType.value === "email" ? "phone" : "email";
  return (alt = false) => alt ? uniqueIdDetails.value[otherType] : uniqueIdDetails.value[uniqueIdType.value];
});

const step2 = computed(() => {
  return {
    login: { heading: "Login to your account", subheading: "Enter your details to login.", btnText: "Login" },
    register: { heading: "Welcome to Getalawyer", subheading: "Please enter your details to create an account.", btnText: "Continue" },
    resetPassword: { heading: "Reset Password", subheading: `Enter your ${currentUniqueIdDetails.value().longName} to reset your password.`, btnText: "Reset Password" },
    verifyOTP: { heading: "Verify OTP", subheading: `Enter the OTP sent to your ${currentUniqueIdDetails.value().slug}.`, btnText: "Verify OTP" },
    setPassword: { heading: "Set Password", subheading: "Enter your new password.", btnText: "Set Password" },
  };
});
const loginForm = ref<Record<string, any>>({
  email: "johndoe1@smartrental.test",
  phone_number: "",
  password: "password",
});
const loginFormRules = ref<Record<string, any>>({
  email: { type: "email" },
  phone_number: { type: "tel" },
  password: { minLength: 8, maxLength: 25 },
});
const registerForm = ref<Record<string, any>>({
  email: "johndoe@smartrental.test",
  first_name: "John",
  last_name: "Doe",
  password: "1234568",
  dob: "2000-01-01",
  user_type: "tenant",
  phone_number: "07067137110",
});
const registerFormRules = ref<Record<string, any>>({
  email: { type: "email" },
  first_name: { minLength: 2, maxLength: 50 },
  last_name: { minLength: 2, maxLength: 50 },
  password: { minLength: 8, maxLength: 25 },
  phone_number: { type: "tel" },
});
const hasUpper = computed(() => /[A-Z]/.test(registerForm.value.password));
const hasNumber = computed(() => /\d/.test(registerForm.value.password));
const hasLength = computed(() => registerForm.value.password.length >= 8);
const secondStepHeading = computed(() => step2.value[currentStep2Action.value].heading);
const secondStepSubHeading = computed(() => step2.value[currentStep2Action.value].subheading);
const score = computed(() => Number(hasUpper.value) + Number(hasNumber.value) + Number(hasLength.value));
const canContinue = computed(
  () => (!formHasError.value && isLoggingIn.value)
    || (
      !isLoggingIn.value
      && ((uniqueIdType.value === "email" && !registerFormRules.value.email.hasError) || (uniqueIdType.value === "phone" && !registerFormRules.value.phone_number.hasError))
    ),
);
function checkLoginForm() {
  loginFailed.value = false;
  loginFormRules.value = validate(loginForm.value, loginFormRules.value);
  formHasError.value = false;
  for (const field in loginFormRules.value) {
    if ((loginFormRules.value[field]?.hasError || !loginForm.value[field]) && ((uniqueIdType.value === "email" && field !== "phone_number") || (uniqueIdType.value === "phone" && field !== "email"))) {
      formHasError.value = true;
      break;
    }
  }
};
function checkRegisterForm() {
  registerFormRules.value = validate(registerForm.value, registerFormRules.value);
  formHasError.value = false;
  for (const field in registerFormRules.value) {
    if (registerFormRules.value[field]?.hasError || !registerForm.value[field]) {
      formHasError.value = true;
      break;
    }
  }
};
function next() {
  // call the exposed scrollNext() on the Carousel component instance
  if (currentStep2Action.value === "resetPassword") {
    sendOTP("passwordReset");
  }
  else if (currentStep2Action.value === "setPassword") {
    setPassword();
  }
  else if (currentStep2Action.value === "verifyOTP") {
    verifyOTP("passwordReset");
  }
  else if (isLoggingIn.value) {
    login();
  }
  else {
    carouselRef.value?.scrollNext?.();
  }
}

function prev() {
  // move to previous carousel item
  carouselRef.value?.scrollPrev?.();
}

function showLogin(carouselIndex: number = 0) {
  isLoggingIn.value = true;
  currentStep2Action.value = "login";
  if (!carouselIndex) {
    carouselRef.value.scrollNext?.();
  }
}
// Watch store flag and call showLogin when modal is shown
watch(
  () => appResourceStore.showLoginModal,
  (val) => {
    if (val && appResourceStore.intendedRoute) {
      setTimeout(() => {
        showLogin();
      }, 250);
    }
    else {
      appResourceStore.intendedRoute = "";
    }
  },
);
function toggleUniqueIdType() {
  uniqueIdType.value = currentUniqueIdDetails.value(true).slug;
  loginForm.value.email = registerForm.value.email;
  loginForm.value.phone_number = registerForm.value.phone_number;
}
function setUniqueIdType(payload: Record<string, any>) {
  if (uniqueIdType.value === "email") {
    delete payload.phone_number;
  }
  else {
    delete payload.email;
    // replace the first zero in the phone number with the country code +234 (assuming Nigerian numbers)
    payload.phone_number = appendCountryCode(payload.phone_number);
  }
  return payload;
}
function appendCountryCode(phone: string) {
  // Simple formatting: +234 801 234 5678
  if (phone.startsWith("0")) {
    phone = `+234${phone.slice(1)}`;
  }
  return phone; // Return as is if it doesn't match expected format
}
async function register() {
  loading.value = true;
  registrationError.value = "";

  try {
    const api = useApi();

    // Define the response type based on your API
    type RegisterResponse = {
      status: string;
      status_code: string;
      message: string;
      data: any;
      timestamp: string;
    };
    if (uniqueIdType.value === "phone") {
      registerForm.value.password_confirmation = registerForm.value.password;
    }
    const response = await api.fetchPost<RegisterResponse>(
      "/auth/register",
      setUniqueIdType({ ...registerForm.value }),
      { requiresAuth: false },
    );

    // Check if registration was successful
    if (response.status === "created" || response.status === "success") {
      console.warn(response.message);

      // Show OTP verification screen
      isVerifyingOTP.value = true;
    }
  }
  catch (error: any) {
    console.error("Registration failed:", error);

    // Display error message to user
    registrationError.value = error.data?.message || "Registration failed, please try again";
  }
  finally {
    loading.value = false;
  }
}
async function login() {
  loading.value = true;
  loginFailed.value = false; // Reset login failed state

  try {
    // Prevent automatic redirect by setting redirect: false
    await signIn(setUniqueIdType({ ...loginForm.value }), { redirect: false });

    // Manually navigate after successful login
    if (appResourceStore.showLoginModal) {
      appResourceStore.showLoginModal = false;
    }
    else {
      await navigateTo("/account");
    }
    console.warn("Login successful");
  }
  catch (error: any) {
    console.error("Login failed:", error);

    // Check if the error is due to unverified email (status code 422 with status_code "15")
    if (error.status === 422 || error.statusCode === 422) {
      // Check if it's specifically the email verification error
      const errorData = error.data || error.response?.data;

      if (errorData?.status_code === "15" || errorData?.message?.includes("E-mail has not been verified")) {
        console.warn("Email not verified, redirecting to OTP verification");

        // Set the states to show OTP verification
        isVerifyingOTP.value = true;
        isLoggingIn.value = false;
        currentStep2Action.value = "register";
        attemptedLogin.value = true;

        // Move to the next carousel item (registration/OTP screen)
        next();

        return; // Exit early to prevent showing login failed error
      }
    }

    // For other errors, show the login failed message
    loginFailed.value = true;
  }
  finally {
    loading.value = false;
  }
}
async function sendOTP(type = "emailVerification") {
  loading.value = true;
  otpError.value = "";

  try {
    const api = useApi();

    // Define the response type based on your API
    type SendOTPResponse = {
      status: string;
      status_code: string;
      message: string;
      timestamp: string;
    };
    const link = type === "emailVerification" ? "/auth/resend-verification-token" : "/auth/resend-password-reset-token";
    let payload: Record<string, any> = {
      email: currentStep2Action.value === "register" ? registerForm.value.email : loginForm.value.email,
    };
    if (uniqueIdType.value === "phone") {
      payload = {
        phone_number: appendCountryCode(currentStep2Action.value === "register" ? registerForm.value.phone_number : loginForm.value.phone_number),
      };
    }
    // Make POST request to send OTP
    const response = await api.fetchPost<SendOTPResponse>(
      link,
      payload,
      { requiresAuth: false },
    );

    // Check if OTP was sent successfully
    if (response.status === "success") {
      console.warn(response.message);

      // Show OTP verification screen
      isVerifyingOTP.value = true;
      currentStep2Action.value = "verifyOTP";
    }
  }
  catch (error: any) {
    console.error("OTP sending failed:", error);

    // Display error message to user
    otpError.value = error.data?.message || "Failed to send OTP, please try again";
  }
  finally {
    loading.value = false;
  }
}
async function verifyOTP(type = "emailVerification") {
  loading.value = true;
  otpError.value = "";

  try {
    const api = useApi();

    // Define the response type based on your API
    type VerifyEmailResponse = {
      status: string;
      status_code: string;
      message: string;
      timestamp: string;
    };

    // Make POST request to verify email
    const link = type === "emailVerification" ? "/auth/verify" : "/auth/verify-password-reset-token";
    let payload: Record<string, any> = {
      email: currentStep2Action.value === "register" ? registerForm.value.email : loginForm.value.email,
      token: otp.value,
    };
    if (uniqueIdType.value === "phone") {
      payload = {
        phone_number: appendCountryCode(currentStep2Action.value === "register" ? registerForm.value.phone_number : loginForm.value.phone_number),
        token: otp.value,
      };
    }
    const response = await api.fetchPost<VerifyEmailResponse>(
      link,
      payload,
      { requiresAuth: false },
    );

    // Check if verification was successful
    if (response.status === "success") {
      console.warn(response.message);

      // Auto-login after successful verification
      if (type === "emailVerification") {
        await signIn(
          {
            email: attemptedLogin.value ? loginForm.value.email : registerForm.value.email,
            password: attemptedLogin.value ? loginForm.value.password : registerForm.value.password,
          },
          { redirect: false },
        );
      }
      else {
        currentStep2Action.value = "setPassword";
      }

      // Navigate to intended route or account page
      const route = appResourceStore.intendedRoute || "/account";
      await navigateTo(route);
    }
  }
  catch (error: any) {
    console.error("OTP verification failed:", error);

    // Display error message to user
    otpError.value = error.data?.message || "Verification failed. Please check your code and try again.";
  }
  finally {
    loading.value = false;
  }
}
async function setPassword() {
  loading.value = true;
  try {
    const api = useApi();

    // Define the response type
    type SetPasswordResponse = {
      status: string;
      status_code: string;
      message: string;
      timestamp: string;
    };

    const response = await api.fetchPost<SetPasswordResponse>(
      "/auth/reset-password",
      setUniqueIdType({
        email: loginForm.value.email,
        password: loginForm.value.password,
        password_confirmation: confirmPassword.value,
        token: otp.value,
      }),
      { requiresAuth: false },
    );
    if (response.status === "success") {
      console.warn(response.message);
      isLoggingIn.value = true;
      currentStep2Action.value = "login";
    }
  }
  catch (error: any) {
    console.error("Password set failed:", error);
    // Display error message to user
    registrationError.value = error.data?.message || "Password set failed. Please try again.";
  }
  finally {
    loading.value = false;
  }
}
watch(loginForm.value, () => {
  checkLoginForm();
});
watch(registerForm.value, () => {
  checkRegisterForm();
  // Clear registration error when user modifies the form
  if (registrationError.value) {
    registrationError.value = "";
  }
});
watch(otp, () => {
  // Clear error when user starts typing
  if (otpError.value) {
    otpError.value = "";
  }
});
// watch appResourceStore.showLoginModal and reset currentStep2Action to "register" when the modal is closed
watch(
  () => appResourceStore.showLoginModal,
  (val) => {
    if (!val) {
      isLoggingIn.value = false;
      currentStep2Action.value = "register";
    }
  },
);
</script>

<template>
  <Dialog
    v-if="!$isLoggedIn()"
    :open="appResourceStore.showLoginModal"
    @update:open="appResourceStore.showLoginModal = $event"
  >
    <DialogTrigger as-child>
      <Button
        class="app-primary-bg rounded-xl transition-all duration-300 text-sm lg:text-base px-3 lg:px-4 search-button"
      >
        Get Started
      </Button>
    </DialogTrigger>
    <DialogScrollContent>
      <VisuallyHidden>
        <DialogTitle>Authentication</DialogTitle>
      </VisuallyHidden>
      <Carousel ref="carouselRef" class="max-w-[90vw] md:max-w-[29rem]">
        <CarouselContent>
          <!-- item 1: starting point selection -->
          <CarouselItem>
            <div class="flex flex-col items-center w-full">
              <div class="bg-gradient-to-b from-gray-200 to-white rounded-full p-4 mb-4">
                <div class="w-14 h-14 rounded-full bg-gray-100 grid place-items-center shadow-sm">
                  <SvgAddUser />
                </div>
              </div>

              <h3 class="text-2xl font-semibold text-foreground text-center w-2/3">
                What brings you to<br>Getalawyer?
              </h3>
              <p class="mt-3 text-lg text-muted-foreground max-w-sm">
                We'll tailor your experience based on your goals.
              </p>

              <hr class="w-full h-px bg-border my-6">

              <div class="w-full space-y-4">
                <label class="flex items-start gap-4 p-4 border border-border rounded-xl bg-background" @click="registerForm.user_type = 'tenant'">
                  <div class="flex-1">
                    <div class="font-medium">I'm a client</div>
                    <div class="text-sm text-muted-foreground">Find legal services and connect with lawyers.</div>
                  </div>
                  <input
                    type="radio"
                    name="startOption"
                    class="mt-1"
                    checked
                  >
                </label>

                <label class="flex items-start gap-4 p-4 border border-border rounded-xl bg-background" @click="registerForm.user_type = 'property_owner'">
                  <div>
                    <div class="font-semibold text-lg mb-1">I'm a lawyer</div>
                    <div class="text-sm text-muted-foreground">Join our network to connect with clients seeking legal advice.</div>
                  </div>
                  <input
                    type="radio"
                    name="startOption"
                    class="mt-1"
                  >
                </label>
              </div>

              <div class="mt-8 pt-6 border-t font-semibold">
                <button class="w-full bg-[#1d6b44] hover:bg-[#154a2f] text-white py-3 rounded-xl text-center" @click="next">
                  Continue
                </button>
              </div>

              <div class="mt-6 text-center text-sm text-muted-foreground">
                Already have an account? <button class="text-foreground underline" @click="showLogin()">
                  Login
                </button>
              </div>
            </div>
          </CarouselItem>

          <!-- item 2: email + social login (was previously item 3) -->
          <CarouselItem>
            <div class="flex flex-col items-center w-full px-2">
              <div class="bg-gradient-to-b from-gray-200 to-white rounded-full p-4 mb-4">
                <div class="w-14 h-14 rounded-full bg-gray-100 grid place-items-center shadow-sm">
                  <SvgAddUser />
                </div>
              </div>

              <h3 class="text-2xl font-semibold text-foreground text-center">
                {{ secondStepHeading }}
              </h3>
              <p class="text-muted-foreground mt-2 mb-6 text-center">
                {{ secondStepSubHeading }}
              </p>
              <p v-if="loginFailed" class="errorText mb-4">
                Incorrect credentials. Please check and try again
              </p>

              <div class="w-full">
                <label v-if="currentStep2Action !== 'setPassword'" class="block text-sm font-medium text-foreground mb-2">{{ currentStep2Action === 'verifyOTP' ? 'Verification Code' : currentUniqueIdDetails().longName }} <span
                  class="text-primary"
                >*</span></label>
                <div v-if="currentStep2Action !== 'setPassword'" class=" mb-4">
                  <div class="flex items-center relative">
                    <Input
                      v-if="currentStep2Action === 'verifyOTP'"
                      v-model="otp"
                      type="text"
                      placeholder="Enter verification code"
                      class="w-full"
                    />
                    <template v-else>
                      <component :is="currentUniqueIdDetails().icon" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        v-if="uniqueIdType === 'email'"
                        v-model="(isLoggingIn ? loginForm : registerForm).email"
                        type="email"
                        placeholder="hello@designer.com"
                        class="flex-1 bg-transparent outline-none text-sm pl-9"
                      />
                      <Input
                        v-else
                        v-model="(isLoggingIn ? loginForm : registerForm).phone_number"
                        type="tel"
                        placeholder="+234 801 234 5678"
                        class="flex-1 bg-transparent outline-none text-sm pl-9"
                      />
                    </template>
                  </div>
                  <div v-if="currentStep2Action === 'verifyOTP'" class="text-sm my-4 text-right">
                    <span v-if="loading" class="text-muted-foreground">sending OTP...</span>
                    <button
                      v-else
                      class="underline"
                      @click="sendOTP('resetPassword')"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <span v-if="formHasError && (registerFormRules.email.hasError || registerFormRules.phone_number.hasError)" class="errorText">
                    {{ registerFormRules[currentUniqueIdDetails().formId].message }}
                  </span>
                  <span v-if="formHasError && (loginFormRules.email.hasError || loginFormRules.phone_number.hasError)" class="errorText">
                    {{ loginFormRules[currentUniqueIdDetails().formId].message }}
                  </span>
                  <p v-if="otpError" class="errorText mb-4">
                    {{ otpError }}
                  </p>
                </div>
                <template v-if="isLoggingIn && currentStep2Action !== 'resetPassword' && currentStep2Action !== 'verifyOTP'">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Password<span
                      class="text-primary"
                    >*</span></label>
                    <div class="flex items-center relative">
                      <SvgPadlock class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        v-model="loginForm.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="••••••••••"
                        class="flex-1 bg-transparent outline-none text-sm pl-9"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2"
                        @click="showPassword = !showPassword"
                      >
                        <SvgEye v-if="!showPassword" />
                        <SvgEyeCrossed v-else />
                      </button>
                    </div>
                    <span v-if="formHasError && loginFormRules.password.hasError" class="errorText">{{
                      loginFormRules.password.message }}
                    </span>
                  </div>
                  <div v-if="currentStep2Action === 'setPassword'" class="my-4">
                    <label class="block text-sm font-medium text-foreground mb-2">Confirm Password<span
                      class="text-primary"
                    >*</span></label>
                    <div class="flex items-center relative">
                      <SvgPadlock class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        v-model="confirmPassword"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="••••••••••"
                        class="flex-1 bg-transparent outline-none text-sm pl-9"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2"
                        @click="showPassword = !showPassword"
                      >
                        <SvgEye v-if="!showPassword" />
                        <SvgEyeCrossed v-else />
                      </button>
                    </div>
                    <span v-if="currentStep2Action === 'setPassword' && loginForm.password !== confirmPassword" class="errorText">{{
                      'Passwords do not match'
                    }}</span>
                  </div>
                  <div v-if="currentStep2Action !== 'setPassword'" class="flex my-6">
                    <div class="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        class="mr-2 w-4 h-4"
                      >
                      <label for="remember" class="text-sm text-foreground cursor-pointer">Keep me logged in</label>
                    </div>
                    <button class="ml-auto text-sm text-foreground underline" @click="currentStep2Action = 'resetPassword'">
                      Forgot password?
                    </button>
                  </div>
                </template>

                <Button
                  :loading="loading"
                  class="w-full bg-[#1d6b44] hover:bg-[#154a2f] text-white py-3 rounded-xl text-center mb-4"
                  :disabled="!canContinue"
                  @click="next"
                >
                  {{ step2[currentStep2Action].btnText }}
                </Button>

                <div class="flex items-center my-4">
                  <div class="flex-1 h-px bg-border" />
                  <div class="px-3 text-sm text-muted-foreground">
                    OR
                  </div>
                  <div class="flex-1 h-px bg-border" />
                </div>

                <div class="space-y-3">
                  <!-- <button class="w-full border border-border rounded-xl py-3 flex items-center justify-center gap-3">
                <img
                  src="/assets/images/svg/google.svg"
                  alt="google"
                  class="w-5 h-5"
                >
                <span class="text-sm">Continue with Google</span>
              </button> -->
                  <GoogleAuthButton />

                  <button class="w-full border border-border rounded-xl py-3 flex items-center justify-center gap-3">
                    <img
                      src="/assets/images/svg/facebook.svg"
                      alt="facebook"
                      class="w-5 h-5"
                    >
                    <span class="text-sm">Continue with Facebook</span>
                  </button>

                  <button class="w-full border border-border rounded-xl py-3 flex items-center justify-center gap-3" @click="toggleUniqueIdType">
                    <component :is="currentUniqueIdDetails(true).icon" />
                    <span class="text-sm">Continue with <span class="capitalize">{{ currentUniqueIdDetails(true).name }}</span></span>
                  </button>
                </div>

                <div v-if="!isLoggingIn" class="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account? <button class="text-foreground underline" @click="showLogin(1)">
                    Login
                  </button>
                </div>
              </div>
            </div>
          </CarouselItem>

          <!-- item 3: finish signing up form -->
          <CarouselItem>
            <div class="flex flex-col w-full px-2">
              <div class="flex items-center w-full mb-4">
                <button
                  class="p-2"
                  :disabled="isVerifyingOTP"
                  @click="prev"
                >
                  <SvgArrowBack />
                </button>
                <h3 class="flex-1 text-center text-lg font-medium">
                  {{ isVerifyingOTP ? 'Verify Your Account' : 'Finish signing up' }}
                </h3>
              </div>

              <div class="h-px bg-border mb-4" />

              <div v-if="!isVerifyingOTP" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Legal name<span
                    class="text-primary"
                  >*</span></label>
                  <div class="space-y-2">
                    <div class="">
                      <div class="flex items-center relative">
                        <SvgUser class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <Input
                          v-model="registerForm.first_name"
                          type="text"
                          placeholder="First name"
                          class="flex-1 bg-transparent outline-none text-sm pl-9"
                        />
                      </div>
                      <span v-if="formHasError && registerFormRules.first_name.hasError" class="errorText">{{ registerFormRules.first_name.message }}</span>
                    </div>

                    <div class="">
                      <div class="flex items-center relative">
                        <SvgUser class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <Input
                          v-model="registerForm.last_name"
                          type="text"
                          placeholder="Last name"
                          class="flex-1 bg-transparent outline-none text-sm pl-9"
                        />
                      </div>
                      <span v-if="formHasError && registerFormRules.last_name.hasError" class="errorText">{{ registerFormRules.last_name.message }}</span>
                    </div>

                    <div class="text-xs flex text-muted-foreground">
                      <SvgInfo /> <span class="pl-1">Make sure this matches the name on your government ID.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Date of birth<span
                    class="text-primary"
                  >*</span></label>
                  <div class="flex items-center relative">
                    <SvgCalendar class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      v-model="registerForm.dob"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      class="flex-1 bg-transparent outline-none text-sm pl-9"
                    />
                  </div>
                  <div class="text-xs flex text-muted-foreground mt-1">
                    <SvgInfo /> <span class="pl-1">To sign up, you need to be at least 18.</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">{{ currentUniqueIdDetails().longName }}</label>
                  <div class="flex items-center relative">
                    <component :is="currentUniqueIdDetails().icon" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      v-if="uniqueIdType === "email""
                      v-model="(isLoggingIn ? loginForm : registerForm).email"
                      type="email"
                      placeholder="hello@designer.com"
                      class="flex-1 bg-transparent outline-none text-sm pl-9"
                    />
                    <Input
                      v-else
                      v-model="(isLoggingIn ? loginForm : registerForm).phone_number"
                      type="tel"
                      placeholder="+234 801 234 5678"
                      class="flex-1 bg-transparent outline-none text-sm pl-9"
                    />
                  </div>
                  <span
                    v-if="formHasError && (registerFormRules.email.hasError || registerFormRules.phone_number.hasError)"
                    class="errorText"
                  >
                    {{ registerFormRules[currentUniqueIdDetails().formId].message }}
                  </span>
                  <span
                    v-if="formHasError && (loginFormRules.email.hasError || loginFormRules.phone_number.hasError)"
                    class="errorText"
                  >
                    {{ loginFormRules[currentUniqueIdDetails().formId].message }}
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Password<span
                    class="text-primary"
                  >*</span></label>
                  <div class="flex items-center relative">
                    <SvgPadlock class="absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input
                      v-model="registerForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="••••••••••"
                      class="flex-1 bg-transparent outline-none text-sm pl-9"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2"
                      @click="showPassword = !showPassword"
                    >
                      <SvgEye v-if="!showPassword" />
                      <SvgEyeCrossed v-else />
                    </button>
                  </div>
                  <span v-if="formHasError && registerFormRules.password.hasError" class="errorText">{{ registerFormRules.password.message }}</span>

                  <!-- password strength bars -->
                  <div v-if="registerForm.password.length" class="">
                    <div class="flex items-center gap-2 my-2">
                      <div
                        class="h-1.5 w-full rounded-full transition-colors duration-300"
                        :class="{ 'bg-gray-900': hasUpper, 'bg-gray-300': !hasUpper }"
                      ></div>
                      <div
                        class="h-1.5 w-full rounded-full transition-colors duration-300"
                        :class="{ 'bg-gray-900': hasNumber, 'bg-gray-300': !hasNumber }"
                      ></div>
                      <div
                        class="h-1.5 w-full rounded-full transition-colors duration-300"
                        :class="{ 'bg-gray-900': hasLength, 'bg-gray-300': !hasLength }"
                      ></div>
                    </div>

                    <div v-if="score < 3" class="text-sm">
                      <p class="text-muted-foreground">
                        Weak password. Must contain:
                      </p>
                      <div class="flex items-center gap-2 text-sm">
                        <span v-if="hasUpper" class="text-success">
                          <SvgCheck class="inline-block" />
                        </span>
                        <span v-else class="text-muted-foreground">
                          <SvgFailedCheck class="inline-block" />
                        </span>
                        <span class="text-muted-foreground">At least 1 uppercase</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm">
                        <span v-if="hasNumber" class="text-success">
                          <SvgCheck class="inline-block" />
                        </span>
                        <span v-else class="text-muted-foreground">
                          <SvgFailedCheck class="inline-block" />
                        </span>
                        <span class="text-muted-foreground">At least 1 number</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm">
                        <span v-if="hasLength" class="text-success">
                          <SvgCheck class="inline-block" />
                        </span>
                        <span v-else class="text-muted-foreground">
                          <SvgFailedCheck class="inline-block" />
                        </span>
                        <span class="text-muted-foreground">At least 8 characters</span>
                      </div>
                    </div>
                  </div>
                </div>

                    :disabled="formHasError"
                    @click="register"
                  >
                    Agree and continue
                  </Button>
                </div>
              </div>
              <div v-else>
                <div>
                  <p class="text-muted-foreground">
                    We have sent a verification code to your email. Please check your inbox and enter the code below to verify your account.
                  </p>
                </div>
                <div class="my-4">
                  <Input
                    v-model="otp"
                    type="text"
                    placeholder="Enter verification code"
                    class="w-full"
                  />
                  <p v-if="otpError" class="errorText mt-2">
                    {{ otpError }}
                  </p>
                </div>
                <div class="text-sm mb-4 text-right">
                  <span v-if="loading" class="text-muted-foreground">sending OTP...</span>
                  <button
                    v-else
                    class="underline"
                    @click="sendOTP()"
                  >
                    Resend OTP
                  </button>
                </div>
                <div>
                  <Button
                    :loading="loading"
                    class="w-full py-3 rounded-xl"
                    :disabled="otp.length !== expectedOTPLength"
                    @click="verifyOTP()"
                  >
                    Verify
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </DialogScrollContent>
  </Dialog>
</template>

<style>

</style>
