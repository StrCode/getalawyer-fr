<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">
          Better Auth Test Page
        </h1>

        <!-- Session Status -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Session Status</h2>
          
          <div v-if="isPending" class="text-gray-600">
            Loading session...
          </div>

          <div v-else-if="session" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-green-800 font-medium mb-2">✓ Authenticated</p>
              <div class="text-sm text-gray-700 space-y-1">
                <p><span class="font-medium">User ID:</span> {{ session.user?.id }}</p>
                <p><span class="font-medium">Email:</span> {{ session.user?.email }}</p>
                <p><span class="font-medium">Name:</span> {{ session.user?.name }}</p>
                <p v-if="session.user?.role">
                  <span class="font-medium">Role:</span> {{ session.user.role }}
                </p>
                <p v-if="session.user?.userType">
                  <span class="font-medium">User Type:</span> {{ session.user.userType }}
                </p>
                <p>
                  <span class="font-medium">Onboarding:</span> 
                  {{ session.user?.onboarding_completed ? 'Completed' : 'Pending' }}
                </p>
              </div>
            </div>

            <button 
              class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              @click="handleSignOut"
              :disabled="isSigningOut"
            >
              {{ isSigningOut ? 'Signing out...' : 'Sign Out' }}
            </button>
          </div>

          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 font-medium">Not authenticated</p>
          </div>
        </div>

        <!-- Sign In Form -->
        <div v-if="!session" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Sign In</h2>
          
          <form @submit.prevent="handleSignIn" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <UInput
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <UInput
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-800 text-sm">{{ error }}</p>
            </div>

            <button 
              type="submit" 
              class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              :disabled="isSigningIn"
            >
              {{ isSigningIn ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </div>

        <!-- Sign Up Form -->
        <div v-if="!session" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Sign Up</h2>
          
          <form @submit.prevent="handleSignUp" class="space-y-4">
            <div>
              <label for="signup-name" class="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <UInput
                id="signup-name"
                v-model="signupName"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label for="signup-email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <UInput
                id="signup-email"
                v-model="signupEmail"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label for="signup-password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <UInput
                id="signup-password"
                v-model="signupPassword"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <div v-if="signupError" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-800 text-sm">{{ signupError }}</p>
            </div>

            <button 
              type="submit" 
              class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              :disabled="isSigningUp"
            >
              {{ isSigningUp ? 'Signing up...' : 'Sign Up' }}
            </button>
          </form>
        </div>

        <!-- API Configuration -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Configuration</h2>
          <div class="bg-gray-50 rounded-lg p-4 text-sm font-mono">
            <p><span class="text-gray-600">API URL:</span> {{ apiUrl }}</p>
            <p><span class="text-gray-600">Auth URL:</span> {{ apiUrl }}/api/auth</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

// Use the unified auth composable
const { session, isPending, signIn, signUp, signOut } = useAuth();

// Sign in form
const email = ref('');
const password = ref('');
const error = ref('');
const isSigningIn = ref(false);

// Sign up form
const signupName = ref('');
const signupEmail = ref('');
const signupPassword = ref('');
const signupError = ref('');
const isSigningUp = ref(false);

// Sign out state
const isSigningOut = ref(false);

async function handleSignIn() {
  error.value = '';
  isSigningIn.value = true;

  try {
    const result = await signIn.email({
      email: email.value,
      password: password.value,
      rememberMe: true,
    });

    if (result.error) {
      error.value = result.error.message || 'Sign in failed';
    } else {
      // Clear form on success
      email.value = '';
      password.value = '';
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred';
  } finally {
    isSigningIn.value = false;
  }
}

async function handleSignUp() {
  signupError.value = '';
  isSigningUp.value = true;

  try {
    const result = await signUp.email({
      email: signupEmail.value,
      password: signupPassword.value,
      name: signupName.value,
      userType: 'client', // Default user type
      onboarding_completed: false, // Default onboarding status
    });

    if (result.error) {
      signupError.value = result.error.message || 'Sign up failed';
    } else {
      // Clear form on success
      signupName.value = '';
      signupEmail.value = '';
      signupPassword.value = '';
    }
  } catch (err: any) {
    signupError.value = err.message || 'An unexpected error occurred';
  } finally {
    isSigningUp.value = false;
  }
}

async function handleSignOut() {
  isSigningOut.value = true;

  try {
    await signOut();
  } catch (err: any) {
    console.error('Sign out error:', err);
  } finally {
    isSigningOut.value = false;
  }
}
</script>
