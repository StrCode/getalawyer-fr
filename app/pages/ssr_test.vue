<template>
  <div class="bg-gray-50 p-8 min-h-screen">
    <UContainer>
      <div class="space-y-8 mx-auto max-w-4xl">
        <div class="text-center">
          <h1 class="mb-2 font-bold text-gray-900 text-3xl">SSR Test Page</h1>
          <p class="text-gray-600">Verify server-side rendering, client hydration, and session loading</p>
        </div>

        <!-- Direct Backend Fetch Test -->
        <UCard>
          <template #header>
            <h2 class="flex items-center gap-2 font-semibold text-xl">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6" />
              Direct Backend Fetch Test (Better Auth + useFetch)
            </h2>
          </template>
          
          <div class="space-y-4">
            <div class="bg-orange-50 p-4 border border-orange-200 rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <div class="font-semibold text-orange-700 text-sm uppercase tracking-wide">Backend Session via authClient.useSession(useFetch)</div>
                <UBadge :color="backendSession ? 'success' : (backendPending ? 'warning' : (backendError ? 'error' : 'gray'))" size="sm">
                  {{ backendPending ? 'Loading...' : (backendSession ? 'Success' : (backendError ? 'Error' : 'Not Loaded')) }}
                </UBadge>
              </div>
              
              <div v-if="backendError" class="space-y-2 text-sm">
                <div class="font-medium text-red-600">Error fetching from backend:</div>
                <div class="bg-red-100 p-2 rounded font-mono text-xs">{{ backendError }}</div>
              </div>
              
              <div v-else-if="backendSession" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-orange-600">User ID:</span>
                  <span class="font-mono text-xs">{{ backendSession.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-orange-600">Email:</span>
                  <span class="font-mono text-xs">{{ backendSession.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-orange-600">User Type:</span>
                  <span class="font-mono text-xs">{{ backendSession.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-orange-600">Session Token:</span>
                  <span class="font-mono text-xs">{{ backendSession.session?.token?.slice(0, 20) || 'N/A' }}...</span>
                </div>
              </div>
              <div v-else-if="backendPending" class="text-orange-600 text-sm">
                Fetching session from backend...
              </div>
              <div v-else class="text-orange-600 text-sm">
                No session data from backend
              </div>
              
              <div class="mt-3 pt-3 border-orange-200 border-t">
                <div class="mb-1 font-medium text-orange-600 text-xs">Method:</div>
                <div class="bg-orange-100 p-2 rounded font-mono text-xs">
                  authClient.useSession(useFetch)
                </div>
                <div class="mt-2 mb-1 font-medium text-orange-600 text-xs">Endpoint:</div>
                <div class="bg-orange-100 p-2 rounded font-mono text-xs break-all">
                  {{ backendUrl }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Session Test Card -->
        <UCard>
          <template #header>
            <h2 class="flex items-center gap-2 font-semibold text-xl">
              <UIcon name="i-heroicons-user-circle" class="w-6 h-6" />
              Session Test
            </h2>
          </template>
          
          <div class="space-y-4">
            <!-- Server Session -->
            <div class="bg-blue-50 p-4 border border-blue-200 rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <div class="font-semibold text-blue-700 text-sm uppercase tracking-wide">Server Session (Middleware)</div>
                <UBadge :color="serverSession ? 'success' : 'error'" size="sm">
                  {{ serverSession ? 'Loaded' : 'Not Loaded' }}
                </UBadge>
              </div>
              
              <div v-if="serverSession" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-blue-600">User ID:</span>
                  <span class="font-mono text-xs">{{ serverSession.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-blue-600">Email:</span>
                  <span class="font-mono text-xs">{{ serverSession.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-blue-600">User Type:</span>
                  <span class="font-mono text-xs">{{ serverSession.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-blue-600">Session ID:</span>
                  <span class="font-mono text-xs">{{ serverSession.session?.id?.slice(0, 20) || 'N/A' }}...</span>
                </div>
              </div>
              <div v-else class="text-blue-600 text-sm">
                No session found on server
              </div>
            </div>

            <!-- Client Session -->
            <div class="bg-green-50 p-4 border border-green-200 rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <div class="font-semibold text-green-700 text-sm uppercase tracking-wide">Client Session</div>
                <UBadge :color="clientSession ? 'success' : (sessionPending ? 'warning' : 'error')" size="sm">
                  {{ sessionPending ? 'Loading...' : (clientSession ? 'Loaded' : 'Not Loaded') }}
                </UBadge>
              </div>
              
              <div v-if="clientSession" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-green-600">User ID:</span>
                  <span class="font-mono text-xs">{{ clientSession.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-green-600">Email:</span>
                  <span class="font-mono text-xs">{{ clientSession.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-green-600">User Type:</span>
                  <span class="font-mono text-xs">{{ clientSession.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-green-600">Session ID:</span>
                  <span class="font-mono text-xs">{{ clientSession.session?.id?.slice(0, 20) || 'N/A' }}...</span>
                </div>
              </div>
              <div v-else-if="sessionPending" class="text-green-600 text-sm">
                Loading session from client...
              </div>
              <div v-else class="text-green-600 text-sm">
                No session found on client
              </div>
            </div>

            <!-- Unified Session (from useAuth) -->
            <div class="bg-purple-50 p-4 border border-purple-200 rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <div class="font-semibold text-purple-700 text-sm uppercase tracking-wide">Unified Session (useAuth)</div>
                <UBadge :color="session ? 'success' : (isPending ? 'warning' : 'error')" size="sm">
                  {{ isPending ? 'Loading...' : (session ? 'Loaded' : 'Not Loaded') }}
                </UBadge>
              </div>
              
              <div v-if="session" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium text-purple-600">User ID:</span>
                  <span class="font-mono text-xs">{{ session.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-purple-600">Email:</span>
                  <span class="font-mono text-xs">{{ session.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-purple-600">User Type:</span>
                  <span class="font-mono text-xs">{{ session.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-purple-600">Onboarding:</span>
                  <span class="font-mono text-xs">{{ session.user?.onboarding_completed ? 'Complete' : 'Incomplete' }}</span>
                </div>
              </div>
              <div v-else-if="isPending" class="text-purple-600 text-sm">
                Loading unified session...
              </div>
              <div v-else class="text-purple-600 text-sm">
                No unified session available
              </div>
            </div>

            <!-- Session Comparison -->
            <div class="bg-gray-100 p-4 rounded-lg">
              <div class="mb-2 font-semibold text-sm">Session Consistency Check:</div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-2">
                  <UIcon 
                    :name="serverSession && clientSession ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
                    :class="serverSession && clientSession ? 'text-green-600' : 'text-red-600'"
                    class="w-4 h-4"
                  />
                  <span>Both server and client sessions {{ serverSession && clientSession ? 'exist' : 'missing' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon 
                    :name="serverSession?.user?.id === clientSession?.user?.id ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
                    :class="serverSession?.user?.id === clientSession?.user?.id ? 'text-green-600' : 'text-red-600'"
                    class="w-4 h-4"
                  />
                  <span>User IDs {{ serverSession?.user?.id === clientSession?.user?.id ? 'match' : 'do not match' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon 
                    :name="!sessionFlash ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" 
                    :class="!sessionFlash ? 'text-green-600' : 'text-yellow-600'"
                    class="w-4 h-4"
                  />
                  <span>{{ sessionFlash ? 'Session flash detected (server session but no client initially)' : 'No session flash detected' }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-xl">Render Context</h2>
          </template>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span class="font-medium">Current Context:</span>
              <UBadge :color="isServer ? 'info' : 'success'" size="lg">
                {{ isServer ? 'Server' : 'Client' }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span class="font-medium">Hydration Status:</span>
              <UBadge :color="isHydrated ? 'success' : 'warning'" size="lg">
                {{ isHydrated ? 'Hydrated' : 'Not Hydrated' }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-xl">Timestamps</h2>
          </template>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="mb-1 font-medium text-blue-600 text-sm">Server Render Time</div>
              <div class="font-mono text-sm">{{ serverTime }}</div>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <div class="mb-1 font-medium text-green-600 text-sm">Client Mount Time</div>
              <div class="font-mono text-sm">{{ clientTime || 'Not mounted yet' }}</div>
            </div>

            <div v-if="clientTime" class="bg-purple-50 p-4 rounded-lg">
              <div class="mb-1 font-medium text-purple-600 text-sm">Time Difference</div>
              <div class="font-mono text-sm">{{ timeDiff }} ms</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-xl">Interactive Test</h2>
          </template>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span class="font-medium">Counter:</span>
              <div class="flex items-center gap-3">
                <UButton @click="counter--" icon="i-heroicons-minus" size="sm" />
                <span class="w-12 font-bold text-2xl text-center">{{ counter }}</span>
                <UButton @click="counter++" icon="i-heroicons-plus" size="sm" />
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="mb-2 font-medium">Input Test:</div>
              <UInput v-model="inputValue" placeholder="Type something..." />
              <div v-if="inputValue" class="mt-2 text-gray-600 text-sm">
                You typed: <span class="font-mono">{{ inputValue }}</span>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold text-xl">Environment Info</h2>
          </template>
          
          <div class="space-y-2 font-mono text-sm">
            <div class="flex justify-between hover:bg-gray-50 p-2 rounded">
              <span class="text-gray-600">process.server:</span>
              <span class="font-semibold">{{ processServer }}</span>
            </div>
            <div class="flex justify-between hover:bg-gray-50 p-2 rounded">
              <span class="text-gray-600">process.client:</span>
              <span class="font-semibold">{{ processClient }}</span>
            </div>
            <div class="flex justify-between hover:bg-gray-50 p-2 rounded">
              <span class="text-gray-600">User Agent:</span>
              <span class="font-semibold text-xs">{{ userAgent }}</span>
            </div>
          </div>
        </UCard>

        <div class="space-y-1 text-gray-500 text-sm text-center">
          <p>✓ If you see this page with data, SSR is working</p>
          <p>✓ If the counter and input work, client hydration is working</p>
          <p>✓ If server and client sessions match, session loading is working correctly</p>
          <p>✓ If no session flash is detected, the unified session composable is working</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const config = useRuntimeConfig()

const isServer = computed(() => process.server)
const processServer = process.server
const processClient = process.client

const serverTime = new Date().toISOString()
const clientTime = ref<string | null>(null)
const isHydrated = ref(false)
const counter = ref(0)
const inputValue = ref('')
const userAgent = ref('Server')

// Direct backend fetch test using Better Auth's useSession with useFetch
const backendUrl = `${config.public.apiUrl}/api/auth/get-session`
const { data: backendSession, pending: backendPending, error: backendError } = await authClient.useSession(useFetch)

// Session testing
const { session, isPending } = useAuth()

// Get server session from useState (set by middleware)
const serverSession = useState('auth-server-session', () => {
  if (import.meta.server) {
    const event = useRequestEvent()
    return event?.context.session || null
  }
  return null
})

// Get client session directly from Better Auth
const clientSessionData = authClient.useSession()
const clientSession = computed(() => clientSessionData.value.data)
const sessionPending = computed(() => clientSessionData.value.isPending)

// Track if there was a session flash (server had session but client didn't initially)
const sessionFlash = ref(false)

const timeDiff = computed(() => {
  if (!clientTime.value) return 0
  return new Date(clientTime.value).getTime() - new Date(serverTime).getTime()
})

onMounted(() => {
  clientTime.value = new Date().toISOString()
  isHydrated.value = true
  userAgent.value = navigator.userAgent
  
  // Check for session flash
  if (serverSession.value && !clientSession.value && sessionPending.value) {
    sessionFlash.value = true
  }
})

useHead({
  title: 'SSR Test Page - Session & Hydration'
})
</script>
