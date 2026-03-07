<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">
          SSR Session Test
        </h1>

        <!-- SSR vs Client Detection -->
        <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 class="text-xl font-semibold text-blue-900 mb-2">Render Context</h2>
          <p class="text-blue-800">
            <span class="font-medium">Current render:</span> 
            <ClientOnly>
              <span class="font-mono">{{ renderContext }}</span>
              <template #fallback>
                <span class="font-mono">SSR</span>
              </template>
            </ClientOnly>
          </p>
          <p class="text-sm text-blue-600 mt-2">
            On initial page load, this should show "SSR". After hydration, it shows "Client".
          </p>
        </div>

        <!-- Server-Side Session (from middleware) -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Server-Side Session (SSR)
          </h2>
          
          <div v-if="serverSession" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 font-medium mb-2">✓ Session found on server</p>
            <div class="text-sm text-gray-700 space-y-1">
              <p><span class="font-medium">User ID:</span> {{ serverSession.user?.id }}</p>
              <p><span class="font-medium">Email:</span> {{ serverSession.user?.email }}</p>
              <p><span class="font-medium">Name:</span> {{ serverSession.user?.name }}</p>
            </div>
            <p class="text-xs text-green-600 mt-2">
              ✓ This data was fetched during SSR and is available immediately
            </p>
          </div>

          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 font-medium">No session on server</p>
            <p class="text-sm text-yellow-600 mt-1">
              This means either you're not logged in, or the SSR middleware didn't run
            </p>
          </div>
        </div>

        <!-- Client-Side Session (from Better Auth) -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Client-Side Session (Better Auth)
          </h2>
          
          <div v-if="isPending" class="text-gray-600">
            Loading client session...
          </div>

          <div v-else-if="clientSession" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 font-medium mb-2">✓ Session found on client</p>
            <div class="text-sm text-gray-700 space-y-1">
              <p><span class="font-medium">User ID:</span> {{ clientSession.user?.id }}</p>
              <p><span class="font-medium">Email:</span> {{ clientSession.user?.email }}</p>
              <p><span class="font-medium">Name:</span> {{ clientSession.user?.name }}</p>
            </div>
            <p class="text-xs text-green-600 mt-2">
              ✓ This data was fetched by Better Auth client after hydration
            </p>
          </div>

          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 font-medium">No session on client</p>
          </div>
        </div>

        <!-- SSR Verification -->
        <div class="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h2 class="text-xl font-semibold text-purple-900 mb-4">
            SSR Verification Checklist
          </h2>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <span v-if="serverSession" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
              <div>
                <p class="font-medium">Server session exists</p>
                <p class="text-gray-600">Session should be available during SSR</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span v-if="clientSession" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
              <div>
                <p class="font-medium">Client session exists</p>
                <p class="text-gray-600">Better Auth client should fetch session</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span v-if="serverSession && clientSession && serverSession.user?.id === clientSession.user?.id" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
              <div>
                <p class="font-medium">Sessions match</p>
                <p class="text-gray-600">Server and client sessions should have the same user</p>
              </div>
            </div>
          </div>
        </div>

        <!-- How to Test -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            How to Test SSR
          </h2>
          
          <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Sign in at <a href="/auth-test" class="text-blue-600 hover:underline">/auth-test</a></li>
            <li>Come back to this page</li>
            <li>Do a hard refresh (Cmd+Shift+R or Ctrl+Shift+R)</li>
            <li>Check "View Page Source" (right-click → View Page Source)</li>
            <li>Search for your email in the HTML source</li>
            <li>If you find it, SSR is working! 🎉</li>
          </ol>

          <div class="mt-4 p-3 bg-gray-100 rounded text-xs font-mono">
            <p class="text-gray-600 mb-1">Check your server terminal for:</p>
            <p class="text-gray-800">Session middleware error: ...</p>
            <p class="text-gray-800">API URL: {{ apiUrl }}</p>
          </div>
        </div>

        <!-- Debug Info -->
        <div class="border-t pt-6 mt-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Debug Information
          </h2>
          
          <div class="bg-gray-50 rounded-lg p-4 text-xs font-mono space-y-2">
            <p><span class="text-gray-600">API URL:</span> {{ apiUrl }}</p>
            <p><span class="text-gray-600">Render Context:</span> {{ renderContext }}</p>
            <p><span class="text-gray-600">Server Session:</span> {{ serverSession ? 'Present' : 'Null' }}</p>
            <p><span class="text-gray-600">Client Session:</span> {{ clientSession ? 'Present' : 'Null' }}</p>
            <p><span class="text-gray-600">Client Pending:</span> {{ isPending }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client';

definePageMeta({
  layout: 'default',
});

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

// Detect if we're on server or client
const renderContext = ref(import.meta.server ? 'SSR' : 'Client');

// Server-side session (from middleware)
const event = import.meta.server ? useRequestEvent() : null;
const serverSession = ref(event?.context.session || null);

// Client-side session (from Better Auth)
const sessionData = authClient.useSession();
const clientSession = computed(() => sessionData.value.data);
const isPending = computed(() => sessionData.value.isPending);

// Update render context after mount
onMounted(() => {
  renderContext.value = 'Client (Hydrated)';
});
</script>
