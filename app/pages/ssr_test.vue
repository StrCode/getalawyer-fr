<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <UContainer>
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">SSR Test Page</h1>
          <p class="text-gray-600">Verify server-side rendering and client hydration</p>
        </div>

        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Render Context</h2>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Current Context:</span>
              <UBadge :color="isServer ? 'blue' : 'green'" size="lg">
                {{ isServer ? 'Server' : 'Client' }}
              </UBadge>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Hydration Status:</span>
              <UBadge :color="isHydrated ? 'green' : 'yellow'" size="lg">
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

        <div class="text-center text-sm text-gray-500">
          <p>✓ If you see this page with data, SSR is working</p>
          <p>✓ If the counter and input work, client hydration is working</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const isServer = computed(() => process.server)
const processServer = process.server
const processClient = process.client

const serverTime = new Date().toISOString()
const clientTime = ref<string | null>(null)
const isHydrated = ref(false)
const counter = ref(0)
const inputValue = ref('')
const userAgent = ref('Server')

const timeDiff = computed(() => {
  if (!clientTime.value) return 0
  return new Date(clientTime.value).getTime() - new Date(serverTime).getTime()
})

onMounted(() => {
  clientTime.value = new Date().toISOString()
  isHydrated.value = true
  userAgent.value = navigator.userAgent
})

useHead({
  title: 'SSR Test Page'
})
</script>
