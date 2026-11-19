<template>
  <InputGroup :class="authInputGroup">
    <InputGroupInput
      :id="id"
      :name="name"
      :model-value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :class="cn(authInputGroupControl, inputClass)"
      :aria-invalid="ariaInvalid"
      :disabled="disabled"
      @blur="$emit('blur')"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <InputGroupAddon align="inline-end" class="pr-1">
      <InputGroupButton
        type="button"
        size="icon-sm"
        class="size-11 cursor-pointer rounded-full text-muted-foreground hover:bg-mint hover:text-deep"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :aria-pressed="visible"
        :disabled="disabled"
        @click="visible = !visible"
      >
        <HugeiconsIcon :icon="visible ? ViewOffIcon : ViewIcon" class="size-5" />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
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
