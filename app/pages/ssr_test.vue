<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <UContainer>
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">SSR Test Page</h1>
          <p class="text-gray-600">Verify server-side rendering, client hydration, and session loading</p>
        </div>

        <!-- Session Test Card -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" class="w-6 h-6" />
              Session Test
            </h2>
          </template>
          
          <div class="space-y-4">
            <!-- Server Session -->
            <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-blue-700 font-semibold uppercase tracking-wide">Server Session</div>
                <UBadge :color="serverSession ? 'success' : 'error'" size="sm">
                  {{ serverSession ? 'Loaded' : 'Not Loaded' }}
                </UBadge>
              </div>
              
              <div v-if="serverSession" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-blue-600 font-medium">User ID:</span>
                  <span class="font-mono text-xs">{{ serverSession.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-600 font-medium">Email:</span>
                  <span class="font-mono text-xs">{{ serverSession.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-600 font-medium">User Type:</span>
                  <span class="font-mono text-xs">{{ serverSession.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-600 font-medium">Session ID:</span>
                  <span class="font-mono text-xs">{{ serverSession.session?.id?.slice(0, 20) || 'N/A' }}...</span>
                </div>
              </div>
              <div v-else class="text-sm text-blue-600">
                No session found on server
              </div>
            </div>

            <!-- Client Session -->
            <div class="p-4 bg-green-50 rounded-lg border border-green-200">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-green-700 font-semibold uppercase tracking-wide">Client Session</div>
                <UBadge :color="clientSession ? 'success' : (sessionPending ? 'warning' : 'error')" size="sm">
                  {{ sessionPending ? 'Loading...' : (clientSession ? 'Loaded' : 'Not Loaded') }}
                </UBadge>
              </div>
              
              <div v-if="clientSession" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-green-600 font-medium">User ID:</span>
                  <span class="font-mono text-xs">{{ clientSession.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-green-600 font-medium">Email:</span>
                  <span class="font-mono text-xs">{{ clientSession.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-green-600 font-medium">User Type:</span>
                  <span class="font-mono text-xs">{{ clientSession.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-green-600 font-medium">Session ID:</span>
                  <span class="font-mono text-xs">{{ clientSession.session?.id?.slice(0, 20) || 'N/A' }}...</span>
                </div>
              </div>
              <div v-else-if="sessionPending" class="text-sm text-green-600">
                Loading session from client...
              </div>
              <div v-else class="text-sm text-green-600">
                No session found on client
              </div>
            </div>

            <!-- Unified Session (from useAuth) -->
            <div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-purple-700 font-semibold uppercase tracking-wide">Unified Session (useAuth)</div>
                <UBadge :color="session ? 'success' : (isPending ? 'warning' : 'error')" size="sm">
                  {{ isPending ? 'Loading...' : (session ? 'Loaded' : 'Not Loaded') }}
                </UBadge>
              </div>
              
              <div v-if="session" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-purple-600 font-medium">User ID:</span>
                  <span class="font-mono text-xs">{{ session.user?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-purple-600 font-medium">Email:</span>
                  <span class="font-mono text-xs">{{ session.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-purple-600 font-medium">User Type:</span>
                  <span class="font-mono text-xs">{{ session.user?.userType || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-purple-600 font-medium">Onboarding:</span>
                  <span class="font-mono text-xs">{{ session.user?.onboarding_completed ? 'Complete' : 'Incomplete' }}</span>
                </div>
              </div>
              <div v-else-if="isPending" class="text-sm text-purple-600">
                Loading unified session...
              </div>
              <div v-else class="text-sm text-purple-600">
                No unified session available
              </div>
            </div>

            <!-- Session Comparison -->
            <div class="p-4 bg-gray-100 rounded-lg">
              <div class="text-sm font-semibold mb-2">Session Consistency Check:</div>
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
            <h2 class="text-xl font-semibold">Render Context</h2>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Current Context:</span>
              <UBadge :color="isServer ? 'info' : 'success'" size="lg">
                {{ isServer ? 'Server' : 'Client' }}
              </UBadge>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Hydration Status:</span>
              <UBadge :color="isHydrated ? 'success' : 'warning'" size="lg">
                {{ isHydrated ? 'Hydrated' : 'Not Hydrated' }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Timestamps</h2>
          </template>
          
          <div class="space-y-3">
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="text-sm text-blue-600 font-medium mb-1">Server Render Time</div>
              <div class="font-mono text-sm">{{ serverTime }}</div>
            </div>

            <div class="p-4 bg-green-50 rounded-lg">
              <div class="text-sm text-green-600 font-medium mb-1">Client Mount Time</div>
              <div class="font-mono text-sm">{{ clientTime || 'Not mounted yet' }}</div>
            </div>

            <div v-if="clientTime" class="p-4 bg-purple-50 rounded-lg">
              <div class="text-sm text-purple-600 font-medium mb-1">Time Difference</div>
              <div class="font-mono text-sm">{{ timeDiff }} ms</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Interactive Test</h2>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Counter:</span>
              <div class="flex items-center gap-3">
                <UButton @click="counter--" icon="i-heroicons-minus" size="sm" />
                <span class="text-2xl font-bold w-12 text-center">{{ counter }}</span>
                <UButton @click="counter++" icon="i-heroicons-plus" size="sm" />
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="font-medium mb-2">Input Test:</div>
              <UInput v-model="inputValue" placeholder="Type something..." />
              <div v-if="inputValue" class="mt-2 text-sm text-gray-600">
                You typed: <span class="font-mono">{{ inputValue }}</span>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Environment Info</h2>
          </template>
          
          <div class="space-y-2 font-mono text-sm">
            <div class="flex justify-between p-2 hover:bg-gray-50 rounded">
              <span class="text-gray-600">process.server:</span>
              <span class="font-semibold">{{ processServer }}</span>
            </div>
            <div class="flex justify-between p-2 hover:bg-gray-50 rounded">
              <span class="text-gray-600">process.client:</span>
              <span class="font-semibold">{{ processClient }}</span>
            </div>
            <div class="flex justify-between p-2 hover:bg-gray-50 rounded">
              <span class="text-gray-600">User Agent:</span>
              <span class="font-semibold text-xs">{{ userAgent }}</span>
            </div>
          </div>
        </UCard>

        <div class="text-center text-sm text-gray-500 space-y-1">
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

const isServer = computed(() => process.server)
const processServer = process.server
const processClient = process.client

const serverTime = new Date().toISOString()
const clientTime = ref<string | null>(null)
const isHydrated = ref(false)
const counter = ref(0)
const inputValue = ref('')
const userAgent = ref('Server')

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
