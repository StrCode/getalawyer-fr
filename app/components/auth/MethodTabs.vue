<template>
  <div class="flex w-full flex-col gap-5">
    <Tabs
      :model-value="modelValue"
      class="w-full gap-0"
      @update:model-value="onTabChange"
    >
      <TabsList
        class="grid h-11 w-full grid-cols-2 rounded-xl border border-border bg-muted p-1"
      >
        <TabsTrigger
          value="email"
          class="cursor-pointer rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          :disabled="disabled"
        >
          Email
        </TabsTrigger>
        <TabsTrigger
          value="phone"
          class="cursor-pointer rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          :disabled="disabled"
        >
          Phone
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <!-- Keep both panels mounted (v-show) so TanStack form fields mount once and clean up safely -->
    <div
      v-show="modelValue === 'email'"
      class="mt-0"
    >
      <slot name="email" />
    </div>
    <div
      v-show="modelValue === 'phone'"
      class="mt-0"
    >
      <slot name="phone" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type AuthMethod = 'email' | 'phone'

defineProps<{
  modelValue: AuthMethod
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AuthMethod]
}>()

function onTabChange(value: string | number) {
  if (value === 'email' || value === 'phone') {
    emit('update:modelValue', value)
  }
}
</script>
