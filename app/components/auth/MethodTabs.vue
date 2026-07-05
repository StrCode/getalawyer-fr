<template>
  <Tabs
    :model-value="modelValue"
    class="w-full gap-5"
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
    <slot />
  </Tabs>
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
