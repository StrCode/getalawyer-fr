<template>
  <div class="relative">
    <Input
      :id="id"
      :name="name"
      :model-value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :class="cn('h-11 pr-11 text-base', inputClass)"
      :aria-invalid="ariaInvalid"
      :disabled="disabled"
      @blur="$emit('blur')"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <button
      type="button"
      class="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :disabled="disabled"
      @click="visible = !visible"
    >
      <AppIcon :icon="appIcons.eyeSlash" v-if="visible" class="w-4 h-4" />
      <AppIcon :icon="appIcons.eye" v-else class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { appIcons } from '@/lib/app-icons'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

defineProps<{
  id?: string
  name?: string
  modelValue?: string
  placeholder?: string
  autocomplete?: string
  ariaInvalid?: boolean
  disabled?: boolean
  inputClass?: string
}>()

defineEmits<{
  blur: []
  'update:modelValue': [value: string | number]
}>()

const visible = ref(false)
</script>
