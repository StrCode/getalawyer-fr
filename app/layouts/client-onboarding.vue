<template>
  <div class="flex flex-col bg-gray-50 min-h-screen">

    <!-- Top bar -->
    <header class="bg-white border-gray-200 border-b w-full">
      <div class="flex justify-between items-center mx-auto px-6 max-w-5xl h-20">

        <!-- Logo -->
        <NuxtLink to="/" class="inline-flex items-center gap-2.5">
          <div class="flex justify-center items-center bg-primary-600 rounded-lg w-10 h-10 shrink-0">
            <Icon name="i-hugeicons-legal-document-02" class="w-5 h-5 text-white" />
          </div>
          <span class="font-bold text-[19px] text-gray-900 tracking-tight">
            Lex<span class="text-primary-600">Connect</span>
          </span>
        </NuxtLink>

        <!-- Progress bar + step label -->
        <div class="flex items-center gap-3">
          <div class="bg-gray-200 rounded-full w-48 h-1.5 overflow-hidden">
            <div
              class="bg-primary-600 rounded-full h-full transition-all duration-500"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <span class="font-medium text-gray-400 text-sm whitespace-nowrap">
            Step {{ currentStep }} of {{ totalSteps }}
          </span>
        </div>

      </div>
    </header>

    <!-- Page slot -->
    <main class="flex flex-col flex-1 justify-start items-center px-4 py-12">
      <div class="flex flex-col justify-center w-full max-w-3xl">
        <slot />
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
// Pages provide currentStep and totalSteps via useState so the layout can read them
const currentStep = useState<number>('onboarding-step', () => 1)
const totalSteps = useState<number>('onboarding-total', () => 2)
const progressPercent = computed(() => (currentStep.value / totalSteps.value) * 100)
</script>